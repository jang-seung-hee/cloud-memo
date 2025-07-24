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
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    let memos: Memo[] = [];

    // Firebase에서 데이터 가져오기 (인증된 사용자인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        console.log('Firebase에서 메모 데이터 가져오는 중...');
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {
          orderByField: 'updatedAt',
          orderDirection: 'desc'
        });
        
        console.log('Firebase에서 가져온 메모:', firebaseMemos);
        
        // Firebase 데이터를 로컬 스토리지에 저장
        if (firebaseMemos.length > 0) {
          const memosJson = safeJsonStringify(firebaseMemos);
          if (memosJson) {
            localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
          }
          memos = firebaseMemos;
        }
      } catch (firebaseError) {
        console.warn('Firebase에서 메모 가져오기 실패, 로컬 데이터 사용:', firebaseError);
      }
    }

    // Firebase에서 데이터를 가져오지 못한 경우 로컬 데이터 사용
    if (memos.length === 0) {
      const memosJson = localStorage.getItem(STORAGE_KEYS.MEMOS);
      if (memosJson) {
        const localMemos = safeJsonParse<Memo[]>(memosJson, []);
        if (Array.isArray(localMemos)) {
          memos = localMemos;
        }
      }
    }

    // 기존 메모에 카테고리 필드가 없는 경우 기본값 추가
    const processedMemos = memos.map(memo => ({
      ...memo,
      category: memo.category || '임시' // 기본값으로 '임시' 설정
    }));

    // 최근 작성한 메모가 위쪽으로 오도록 정렬 (updatedAt 기준 내림차순)
    return processedMemos.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('메모 목록 가져오기 실패:', error);
    return [];
  }
};

// 메모 생성
const createMemo = async (request: CreateMemoRequest): Promise<Memo> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (!validateMemo(request)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  // 제목이 없으면 내용에서 추출
  const title = request.title?.trim() || extractTitleFromContent(request.content);

  const newMemo: Memo = {
    id: generateId(),
    title: title,
    content: request.content.trim(),
    category: request.category,
    images: request.images || [],
    createdAt: new Date(),
    updatedAt: new Date().toISOString()
  };

  const memos = await getMemos(); // 현재 메모 목록을 가져와서 크기 계산
  const dataSize = safeJsonStringify([...memos, newMemo])?.length || 0;

  if (!validateStorageLimit(dataSize)) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
  }

  try {
    memos.push(newMemo);
    const memosJson = safeJsonStringify(memos);
    if (memosJson) {
      localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
    }

    // Firebase 동기화 (인증된 사용자인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase에 직접 저장
        await createDocument(COLLECTIONS.MEMOS, newMemo);
      } catch (syncError) {
        console.warn('Firebase 동기화 실패 (메모 생성):', syncError);
        // 동기화 실패해도 로컬 저장은 성공으로 처리
      }
    }

    return newMemo;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
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

  const memos = await getMemos(); // 현재 메모 목록을 가져와서 수정
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

  const dataSize = safeJsonStringify([...memos.slice(0, memoIndex), updatedMemo, ...memos.slice(memoIndex + 1)])?.length || 0;

  if (!validateStorageLimit(dataSize)) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
  }

  try {
    memos[memoIndex] = updatedMemo;
    const memosJson = safeJsonStringify(memos);
    if (memosJson) {
      localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
    }

    // Firebase 동기화 (인증된 사용자인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase에 직접 업데이트
        await updateDocument(COLLECTIONS.MEMOS, updatedMemo.id, updatedMemo);
      } catch (syncError) {
        console.warn('Firebase 동기화 실패 (메모 수정):', syncError);
        // 동기화 실패해도 로컬 저장은 성공으로 처리
      }
    }

    return updatedMemo;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 메모 삭제
const deleteMemo = async (id: string): Promise<boolean> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const memos = await getMemos(); // 현재 메모 목록을 가져와서 삭제
  const memoIndex = memos.findIndex(memo => memo.id === id);

  if (memoIndex === -1) {
    return false;
  }

  try {
    memos.splice(memoIndex, 1);
    const memosJson = safeJsonStringify(memos);
    if (memosJson) {
      localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
    }

    // Firebase 동기화 (인증된 사용자인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase에서 직접 삭제
        await deleteDocument(COLLECTIONS.MEMOS, id);
      } catch (syncError) {
        console.warn('Firebase 동기화 실패 (메모 삭제):', syncError);
        // 동기화 실패해도 로컬 삭제는 성공으로 처리
      }
    }

    return true;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
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
      localStorage.setItem(STORAGE_KEYS.MEMOS, memosJson);
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