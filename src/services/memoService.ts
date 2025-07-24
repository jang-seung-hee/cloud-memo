import { 
  Memo, 
  CreateMemoRequest, 
  UpdateMemoRequest, 
  MemoListResponse, 
  MemoSearchParams 
} from '../types/memo';
import { 
  ERROR_MESSAGES, 
  STORAGE_LIMITS,
  generateId, 
  isStorageAvailable, 
  validateStorageLimit, 
  safeJsonParse, 
  safeJsonStringify, 
  StorageError 
} from './localStorageService';
import { 
  isFirebaseAvailable, 
  getCurrentUserId,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  COLLECTIONS
} from './firebaseService';


// ?�시???�정
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1�?  backoffMultiplier: 2
} as const;

// ?�시???�틸리티 ?�수
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries,
  delay: number = RETRY_CONFIG.retryDelay
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // ?�트?�크 ?�류가 ?�닌 경우 ?�시?�하지 ?�음
      if (lastError.message.includes('permission') || 
          lastError.message.includes('unauthenticated') ||
          lastError.message.includes('invalid')) {
        throw lastError;
      }
      
      console.warn(`?�업 ?�패 (?�도 ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      
      // 지??백오?�로 ?��?      await new Promise(resolve => setTimeout(resolve, delay));
      delay = delay * RETRY_CONFIG.backoffMultiplier;
    }
  }
  
  throw new Error(lastError!.message);
};

// 메모 ?�이??검�?const validateMemo = (memo: Partial<Memo>): boolean => {
  if (!memo.content || memo.content.trim().length === 0) {
    return false;
  }
  if (memo.content.length > STORAGE_LIMITS.MAX_MEMO_LENGTH) {
    return false;
  }
  return true;
};

// ?�용?�서 ?�목 추출 (�?�??�는 �?50??
const extractTitleFromContent = (content: string): string => {
  const trimmedContent = content.trim();
  if (!trimmedContent) return '';
  
  // �?�?추출
  const firstLine = trimmedContent.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine;
  }
  
  // �?줄이 50?��? 초과?�면 50?�로 ?�르�?... 추�?
  return firstLine.substring(0, 50) + '...';
};

// 메모 목록 가?�오�?const getMemos = async (): Promise<Memo[]> => {
  return retryWithBackoff(async () => {
    try {
      let memos: Memo[] = [];

      // Firebase?�서 ?�이??가?�오�?(1�??�?�소)
      if (isFirebaseAvailable() && getCurrentUserId()) {
        try {
          console.log('Firebase?�서 메모 ?�이??가?�오??�?..');
          const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
          
          console.log('Firebase?�서 가?�온 메모:', firebaseMemos);
          
          if (firebaseMemos.length > 0) {
            memos = firebaseMemos;
            console.log('Firebase?�서 메모 ?�이??로드 ?�료');
          } else {
            console.log('Firebase??메모가 ?�음');
          }
        } catch (firebaseError) {
          console.error('Firebase?�서 메모 가?�오�??�패:', firebaseError);
          throw new StorageError('Firebase ?�결???�패?�습?�다.', 'FIREBASE_ERROR');
        }
      } else {
        console.log('Firebase ?�용 불�? ?�는 ?�용??미인�?);
        throw new StorageError('Firebase ?�결???�요?�니??', 'FIREBASE_UNAVAILABLE');
      }

      // 기존 메모??카테고리 ?�드가 ?�는 경우 기본�?추�?
      const processedMemos = memos.map(memo => ({
        ...memo,
        category: memo.category || '?�시' // 기본값으�?'?�시' ?�정
      }));

      // ?�전???�짜 변???�수
      const safeDateConversion = (date: any): Date => {
        try {
          if (date instanceof Date) {
            return date;
          } else if (typeof date === 'string') {
            return new Date(date);
          } else if (date && typeof date === 'object' && date.toDate) {
            // Firebase Timestamp 객체??경우
            return date.toDate();
          } else if (date && typeof date === 'object' && date.seconds) {
            // Firebase Timestamp 객체??경우 (seconds, nanoseconds)
            return new Date(date.seconds * 1000);
          } else {
            // 기�? 경우 문자?�로 변????Date 객체 ?�성
            return new Date(String(date));
          }
        } catch (error) {
          console.error('?�짜 변???�류:', error, date);
          return new Date(); // 기본값으�??�재 ?�간 반환
        }
      };

      // 최근 ?�성??메모가 ?�쪽?�로 ?�도�??�렬 (updatedAt 기�? ?�림차순)
      const sortedMemos = processedMemos.sort((a, b) => {
        const dateA = safeDateConversion(a.updatedAt || a.createdAt);
        const dateB = safeDateConversion(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('최종 메모 목록:', sortedMemos.length, '�?);
      return sortedMemos;
    } catch (error) {
      console.error('메모 목록 가?�오�??�패:', error);
      throw error; // ?�러�??�위�??�파
    }
  });
};

// 메모 ?�성
const createMemo = async (request: CreateMemoRequest): Promise<Memo> => {
  if (!validateMemo(request)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  const title = extractTitleFromContent(request.content);
  const memoData: Omit<Memo, 'id'> = {
    title,
    content: request.content.trim(),
    category: request.category || '?�시',
    images: request.images || [],
    createdAt: new Date(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Firebase???�??(1�??�?�소)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      const savedMemo = await createDocument(COLLECTIONS.MEMOS, memoData);
      console.log('Firebase??메모 ?�???�공:', savedMemo.id);
      
      // Firebase?�서 ?�성??ID�??�함???�전??메모 객체 반환
      const newMemo: Memo = {
        ...memoData,
        id: savedMemo.id || generateId()
      };
      
      return newMemo;
    } else {
      console.log('Firebase ?�용 불�? ?�는 ?�용??미인�?);
      throw new StorageError('Firebase ?�결???�요?�니??', 'FIREBASE_UNAVAILABLE');
    }
  } catch (error) {
    console.error('메모 ?�성 ?�패:', error);
    throw error; // ?�러�??�위�??�파
  }
};

// 메모 조회
const getMemo = async (id: string): Promise<Memo | null> => {
  const memos = await getMemos();
  const memo = memos.find(memo => memo.id === id);
  if (memo) {
    // 카테고리가 ?�는 경우 기본�?추�?
    return {
      ...memo,
      category: memo.category || '?�시'
    };
  }
  return null;
};

// 메모 ?�정
const updateMemo = async (id: string, request: UpdateMemoRequest): Promise<Memo> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const memos = await getMemos();
  const memoIndex = memos.findIndex(memo => memo.id === id);

  if (memoIndex === -1) {
    throw new StorageError('메모�?찾을 ???�습?�다.', 'MEMO_NOT_FOUND');
  }

  const currentMemo = memos[memoIndex];
  let newTitle = currentMemo.title;
  let newContent = currentMemo.content;

  // ?�목 ?�데?�트
  if (request.title !== undefined) {
    newTitle = request.title.trim() || extractTitleFromContent(newContent);
  }

  // ?�용 ?�데?�트
  if (request.content !== undefined) {
    newContent = request.content.trim();
    // ?�목???�거???�용??변경된 경우 ?�목 ?�생??    if (!newTitle || request.title === undefined) {
      newTitle = extractTitleFromContent(newContent);
    }
  }

  const updatedMemo: Memo = {
    ...currentMemo,
    title: newTitle,
    content: newContent,
    ...(request.category && { category: request.category }),
    ...(request.images && { images: request.images }),
    updatedAt: new Date().toISOString()
  };

  if (!validateMemo(updatedMemo)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  try {
    // 1. Firebase??먼�? ?�데?�트 (?�라???�선)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await updateDocument(COLLECTIONS.MEMOS, updatedMemo.id, updatedMemo);
      console.log('Firebase??메모 ?�데?�트 ?�공:', updatedMemo.id);
      
      // 2. Firebase?�서 최신 ?�이?��? ?�시 가?��???로컬 캐시 ?�데?�트
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        if (firebaseMemos.length > 0) {
          const memosJson = safeJsonStringify(firebaseMemos);
          if (memosJson) {
            console.log('로컬 캐시 ?�데?�트 ?�료 (Firebase ?�이??기�?)');
          }
        }
      } catch (cacheError) {
        console.warn('로컬 캐시 ?�데?�트 ?�패, 로컬?�만 ?�??', cacheError);
        // 로컬?�만 ?�??(?�프?�인 모드)
        memos[memoIndex] = updatedMemo;
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
        }
      }
    } else {
      // 3. Firebase ?�용 불�??�한 경우 로컬?�만 ?�??      console.log('Firebase ?�용 불�??? 로컬?�만 ?�??);
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
    }

    return updatedMemo;
  } catch (error) {
    console.error('메모 ?�정 ?�패:', error);
    
    // 3. Firebase ?�패 ??로컬?�만 ?�??(?�프?�인 모드)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('?�트?�크 ?�류, 로컬?�만 ?�??', error);
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
      return updatedMemo;
    }
    
    throw error;
  }
};

// 메모 ??��
const deleteMemo = async (id: string): Promise<boolean> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const memos = await getMemos();
  const memoIndex = memos.findIndex(memo => memo.id === id);

  if (memoIndex === -1) {
    return false;
  }

  try {
    // 1. Firebase?�서 먼�? ??�� (?�라???�선)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await deleteDocument(COLLECTIONS.MEMOS, id);
      console.log('Firebase?�서 메모 ??�� ?�공:', id);
      
      // 2. Firebase?�서 최신 ?�이?��? ?�시 가?��???로컬 캐시 ?�데?�트
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        const memosJson = safeJsonStringify(firebaseMemos);
        if (memosJson) {
          console.log('로컬 캐시 ?�데?�트 ?�료 (Firebase ?�이??기�?)');
        }
      } catch (cacheError) {
        console.warn('로컬 캐시 ?�데?�트 ?�패, 로컬?�서�???��:', cacheError);
        // 로컬?�서�???�� (?�프?�인 모드)
        memos.splice(memoIndex, 1);
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
        }
      }
    } else {
      // 3. Firebase ?�용 불�??�한 경우 로컬?�서�???��
      console.log('Firebase ?�용 불�??? 로컬?�서�???��');
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
    }

    return true;
  } catch (error) {
    console.error('메모 ??�� ?�패:', error);
    
    // 3. Firebase ?�패 ??로컬?�서�???�� (?�프?�인 모드)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('?�트?�크 ?�류, 로컬?�서�???��:', error);
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
      return true;
    }
    
    throw error;
  }
};

// 메모 검??const searchMemos = async (params: MemoSearchParams): Promise<MemoListResponse> => {
  let memos = await getMemos();

  // ?�워??검??  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    memos = memos.filter(memo => 
      (memo.title?.toLowerCase().includes(keyword) || false) || 
      memo.content.toLowerCase().includes(keyword)
    );
  }

  // ?�렬
  const sortBy = params.sortBy || 'updatedAt';
  const sortOrder = params.sortOrder || 'desc';

  memos.sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (sortBy) {
      case 'title':
        aValue = a.title || '';
        bValue = b.title || '';
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'updatedAt':
      default:
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // ?�이지?�이??  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMemos = memos.slice(startIndex, endIndex);

  return {
    memos: paginatedMemos,
    totalCount: memos.length
  };
};

// 메모 ?�계
const getMemoStats = async () => {
  const memos = await getMemos();
  const totalMemos = memos.length;
  const totalCharacters = memos.reduce((sum, memo) => sum + memo.content.length, 0);
  const totalImages = memos.reduce((sum, memo) => sum + memo.images.length, 0);
  const todayMemos = memos.filter(memo => {
    const today = new Date();
    const memoDate = new Date(memo.createdAt);
    return memoDate.toDateString() === today.toDateString();
  }).length;

  return {
    totalMemos,
    totalCharacters,
    totalImages,
    todayMemos
  };
};

// 메모 백업
const exportMemos = (): string => {
  const memos = getMemos();
  return safeJsonStringify(memos) || '[]';
};

// 메모 복원
const importMemos = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedMemos = safeJsonParse<Memo[]>(jsonData, []);
    
    if (!Array.isArray(importedMemos)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // ?�이??검�?    const validMemos = importedMemos.filter(memo => validateMemo(memo));
    
    const dataSize = safeJsonStringify(validMemos)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const memosJson = safeJsonStringify(validMemos);
    if (memosJson) {
    }

    return validMemos.length;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }
};

export {
  getMemos,
  createMemo,
  getMemo,
  updateMemo,
  deleteMemo,
  searchMemos,
  getMemoStats,
  exportMemos,
  importMemos,
  validateMemo
}; 

