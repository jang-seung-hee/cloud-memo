import { 
  Memo, 
  CreateMemoRequest, 
  UpdateMemoRequest, 
  MemoListResponse, 
  MemoSearchParams 
} from '../types/memo';
import { 
  STORAGE_KEYS, 
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


// 재시도 설정
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1초
  backoffMultiplier: 2
} as const;

// 재시도 유틸리티 함수
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
      
      // 네트워크 오류가 아닌 경우 재시도하지 않음
      if (lastError.message.includes('permission') || 
          lastError.message.includes('unauthenticated') ||
          lastError.message.includes('invalid')) {
        throw lastError;
      }
      
      console.warn(`작업 실패 (시도 ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      
      // 지수 백오프로 대기
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= RETRY_CONFIG.backoffMultiplier;
    }
  }
  
  throw lastError!;
};

// 메모 데이터 검증
const validateMemo = (memo: Partial<Memo>): boolean => {
  if (!memo.content || memo.content.trim().length === 0) {
    return false;
  }
  if (memo.content.length > STORAGE_LIMITS.MAX_MEMO_LENGTH) {
    return false;
  }
  return true;
};

// 내용에서 제목 추출 (첫 줄 또는 첫 50자)
const extractTitleFromContent = (content: string): string => {
  const trimmedContent = content.trim();
  if (!trimmedContent) return '';
  
  // 첫 줄 추출
  const firstLine = trimmedContent.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine;
  }
  
  // 첫 줄이 50자를 초과하면 50자로 자르고 ... 추가
  return firstLine.substring(0, 50) + '...';
};

// 메모 목록 가져오기
const getMemos = async (): Promise<Memo[]> => {
  return retryWithBackoff(async () => {
    try {
      let memos: Memo[] = [];

      // Firebase에서 데이터 가져오기 (1차 저장소)
      if (isFirebaseAvailable() && getCurrentUserId()) {
        try {
          console.log('Firebase에서 메모 데이터 가져오는 중...');
          const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
          
          console.log('Firebase에서 가져온 메모:', firebaseMemos);
          
          if (firebaseMemos.length > 0) {
            memos = firebaseMemos;
            console.log('Firebase에서 메모 데이터 로드 완료');
          } else {
            console.log('Firebase에 메모가 없음');
          }
        } catch (firebaseError) {
          console.error('Firebase에서 메모 가져오기 실패:', firebaseError);
          throw new StorageError('Firebase 연결에 실패했습니다.', 'FIREBASE_ERROR');
        }
      } else {
        console.log('Firebase 사용 불가 또는 사용자 미인증');
        throw new StorageError('Firebase 연결이 필요합니다.', 'FIREBASE_UNAVAILABLE');
      }

      // 기존 메모에 카테고리 필드가 없는 경우 기본값 추가
      const processedMemos = memos.map(memo => ({
        ...memo,
        category: memo.category || '임시' // 기본값으로 '임시' 설정
      }));

      // 안전한 날짜 변환 함수
      const safeDateConversion = (date: any): Date => {
        try {
          if (date instanceof Date) {
            return date;
          } else if (typeof date === 'string') {
            return new Date(date);
          } else if (date && typeof date === 'object' && date.toDate) {
            // Firebase Timestamp 객체인 경우
            return date.toDate();
          } else if (date && typeof date === 'object' && date.seconds) {
            // Firebase Timestamp 객체인 경우 (seconds, nanoseconds)
            return new Date(date.seconds * 1000);
          } else {
            // 기타 경우 문자열로 변환 후 Date 객체 생성
            return new Date(String(date));
          }
        } catch (error) {
          console.error('날짜 변환 오류:', error, date);
          return new Date(); // 기본값으로 현재 시간 반환
        }
      };

      // 최근 작성한 메모가 위쪽으로 오도록 정렬 (updatedAt 기준 내림차순)
      const sortedMemos = processedMemos.sort((a, b) => {
        const dateA = safeDateConversion(a.updatedAt || a.createdAt);
        const dateB = safeDateConversion(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('최종 메모 목록:', sortedMemos.length, '개');
      return sortedMemos;
    } catch (error) {
      console.error('메모 목록 가져오기 실패:', error);
      throw error; // 에러를 상위로 전파
    }
  });
};

// 메모 생성
const createMemo = async (request: CreateMemoRequest): Promise<Memo> => {
  if (!validateMemo(request)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  const title = extractTitleFromContent(request.content);
  const memoData: Omit<Memo, 'id'> = {
    title,
    content: request.content.trim(),
    category: request.category || '임시',
    images: request.images || [],
    createdAt: new Date(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Firebase에 저장 (1차 저장소)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      const savedMemo = await createDocument(COLLECTIONS.MEMOS, memoData);
      console.log('Firebase에 메모 저장 성공:', savedMemo.id);
      
      // Firebase에서 생성된 ID를 포함한 완전한 메모 객체 반환
      const newMemo: Memo = {
        ...memoData,
        id: savedMemo.id || generateId()
      };
      
      return newMemo;
    } else {
      console.log('Firebase 사용 불가 또는 사용자 미인증');
      throw new StorageError('Firebase 연결이 필요합니다.', 'FIREBASE_UNAVAILABLE');
    }
  } catch (error) {
    console.error('메모 생성 실패:', error);
    throw error; // 에러를 상위로 전파
  }
};

// 메모 조회
const getMemo = async (id: string): Promise<Memo | null> => {
  const memos = await getMemos();
  const memo = memos.find(memo => memo.id === id);
  if (memo) {
    // 카테고리가 없는 경우 기본값 추가
    return {
      ...memo,
      category: memo.category || '임시'
    };
  }
  return null;
};

// 메모 수정
const updateMemo = async (id: string, request: UpdateMemoRequest): Promise<Memo> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const memos = await getMemos();
  const memoIndex = memos.findIndex(memo => memo.id === id);

  if (memoIndex === -1) {
    throw new StorageError('메모를 찾을 수 없습니다.', 'MEMO_NOT_FOUND');
  }

  const currentMemo = memos[memoIndex];
  let newTitle = currentMemo.title;
  let newContent = currentMemo.content;

  // 제목 업데이트
  if (request.title !== undefined) {
    newTitle = request.title.trim() || extractTitleFromContent(newContent);
  }

  // 내용 업데이트
  if (request.content !== undefined) {
    newContent = request.content.trim();
    // 제목이 없거나 내용이 변경된 경우 제목 재생성
    if (!newTitle || request.title === undefined) {
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
    // 1. Firebase에 먼저 업데이트 (온라인 우선)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await updateDocument(COLLECTIONS.MEMOS, updatedMemo.id, updatedMemo);
      console.log('Firebase에 메모 업데이트 성공:', updatedMemo.id);
      
      // 2. Firebase에서 최신 데이터를 다시 가져와서 로컬 캐시 업데이트
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        if (firebaseMemos.length > 0) {
          const memosJson = safeJsonStringify(firebaseMemos);
          if (memosJson) {
            // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
            console.log('로컬 캐시 업데이트 완료 (Firebase 데이터 기준)');
          }
        }
      } catch (cacheError) {
        console.warn('로컬 캐시 업데이트 실패, 로컬에만 저장:', cacheError);
        // 로컬에만 저장 (오프라인 모드)
        memos[memoIndex] = updatedMemo;
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
          // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
        }
      }
    } else {
      // 3. Firebase 사용 불가능한 경우 로컬에만 저장
      console.log('Firebase 사용 불가능, 로컬에만 저장');
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
        // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
      }
    }

    return updatedMemo;
  } catch (error) {
    console.error('메모 수정 실패:', error);
    
    // 3. Firebase 실패 시 로컬에만 저장 (오프라인 모드)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('네트워크 오류, 로컬에만 저장:', error);
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
        // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
      }
      return updatedMemo;
    }
    
    throw error;
  }
};

// 메모 삭제
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
    // 1. Firebase에서 먼저 삭제 (온라인 우선)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await deleteDocument(COLLECTIONS.MEMOS, id);
      console.log('Firebase에서 메모 삭제 성공:', id);
      
      // 2. Firebase에서 최신 데이터를 다시 가져와서 로컬 캐시 업데이트
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        const memosJson = safeJsonStringify(firebaseMemos);
        if (memosJson) {
          // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
          console.log('로컬 캐시 업데이트 완료 (Firebase 데이터 기준)');
        }
      } catch (cacheError) {
        console.warn('로컬 캐시 업데이트 실패, 로컬에서만 삭제:', cacheError);
        // 로컬에서만 삭제 (오프라인 모드)
        memos.splice(memoIndex, 1);
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
          // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
        }
      }
    } else {
      // 3. Firebase 사용 불가능한 경우 로컬에서만 삭제
      console.log('Firebase 사용 불가능, 로컬에서만 삭제');
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
        // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
      }
    }

    return true;
  } catch (error) {
    console.error('메모 삭제 실패:', error);
    
    // 3. Firebase 실패 시 로컬에서만 삭제 (오프라인 모드)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('네트워크 오류, 로컬에서만 삭제:', error);
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
        // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
      }
      return true;
    }
    
    throw error;
  }
};

// 메모 검색
const searchMemos = async (params: MemoSearchParams): Promise<MemoListResponse> => {
  let memos = await getMemos();

  // 키워드 검색
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    memos = memos.filter(memo => 
      (memo.title?.toLowerCase().includes(keyword) || false) || 
      memo.content.toLowerCase().includes(keyword)
    );
  }

  // 정렬
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

  // 페이지네이션
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMemos = memos.slice(startIndex, endIndex);

  return {
    memos: paginatedMemos,
    totalCount: memos.length
  };
};

// 메모 통계
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

    // 데이터 검증
    const validMemos = importedMemos.filter(memo => validateMemo(memo));
    
    const dataSize = safeJsonStringify(validMemos)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const memosJson = safeJsonStringify(validMemos);
    if (memosJson) {
      // localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
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