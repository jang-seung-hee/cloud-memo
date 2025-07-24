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


// ?¬ì‹œ???¤ì •
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1ì´?  backoffMultiplier: 2
} as const;

// ?¬ì‹œ??? í‹¸ë¦¬í‹° ?¨ìˆ˜
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
      
      // ?¤íŠ¸?Œí¬ ?¤ë¥˜ê°€ ?„ë‹Œ ê²½ìš° ?¬ì‹œ?„í•˜ì§€ ?ŠìŒ
      if (lastError.message.includes('permission') || 
          lastError.message.includes('unauthenticated') ||
          lastError.message.includes('invalid')) {
        throw lastError;
      }
      
      console.warn(`?‘ì—… ?¤íŒ¨ (?œë„ ${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      
      // ì§€??ë°±ì˜¤?„ë¡œ ?€ê¸?      await new Promise(resolve => setTimeout(resolve, delay));
      delay = delay * RETRY_CONFIG.backoffMultiplier;
    }
  }
  
  throw new Error(lastError!.message);
};

// ë©”ëª¨ ?°ì´??ê²€ì¦?const validateMemo = (memo: Partial<Memo>): boolean => {
  if (!memo.content || memo.content.trim().length === 0) {
    return false;
  }
  if (memo.content.length > STORAGE_LIMITS.MAX_MEMO_LENGTH) {
    return false;
  }
  return true;
};

// ?´ìš©?ì„œ ?œëª© ì¶”ì¶œ (ì²?ì¤??ëŠ” ì²?50??
const extractTitleFromContent = (content: string): string => {
  const trimmedContent = content.trim();
  if (!trimmedContent) return '';
  
  // ì²?ì¤?ì¶”ì¶œ
  const firstLine = trimmedContent.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine;
  }
  
  // ì²?ì¤„ì´ 50?ë? ì´ˆê³¼?˜ë©´ 50?ë¡œ ?ë¥´ê³?... ì¶”ê?
  return firstLine.substring(0, 50) + '...';
};

// ë©”ëª¨ ëª©ë¡ ê°€?¸ì˜¤ê¸?const getMemos = async (): Promise<Memo[]> => {
  return retryWithBackoff(async () => {
    try {
      let memos: Memo[] = [];

      // Firebase?ì„œ ?°ì´??ê°€?¸ì˜¤ê¸?(1ì°??€?¥ì†Œ)
      if (isFirebaseAvailable() && getCurrentUserId()) {
        try {
          console.log('Firebase?ì„œ ë©”ëª¨ ?°ì´??ê°€?¸ì˜¤??ì¤?..');
          const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
          
          console.log('Firebase?ì„œ ê°€?¸ì˜¨ ë©”ëª¨:', firebaseMemos);
          
          if (firebaseMemos.length > 0) {
            memos = firebaseMemos;
            console.log('Firebase?ì„œ ë©”ëª¨ ?°ì´??ë¡œë“œ ?„ë£Œ');
          } else {
            console.log('Firebase??ë©”ëª¨ê°€ ?†ìŒ');
          }
        } catch (firebaseError) {
          console.error('Firebase?ì„œ ë©”ëª¨ ê°€?¸ì˜¤ê¸??¤íŒ¨:', firebaseError);
          throw new StorageError('Firebase ?°ê²°???¤íŒ¨?ˆìŠµ?ˆë‹¤.', 'FIREBASE_ERROR');
        }
      } else {
        console.log('Firebase ?¬ìš© ë¶ˆê? ?ëŠ” ?¬ìš©??ë¯¸ì¸ì¦?);
        throw new StorageError('Firebase ?°ê²°???„ìš”?©ë‹ˆ??', 'FIREBASE_UNAVAILABLE');
      }

      // ê¸°ì¡´ ë©”ëª¨??ì¹´í…Œê³ ë¦¬ ?„ë“œê°€ ?†ëŠ” ê²½ìš° ê¸°ë³¸ê°?ì¶”ê?
      const processedMemos = memos.map(memo => ({
        ...memo,
        category: memo.category || '?„ì‹œ' // ê¸°ë³¸ê°’ìœ¼ë¡?'?„ì‹œ' ?¤ì •
      }));

      // ?ˆì „??? ì§œ ë³€???¨ìˆ˜
      const safeDateConversion = (date: any): Date => {
        try {
          if (date instanceof Date) {
            return date;
          } else if (typeof date === 'string') {
            return new Date(date);
          } else if (date && typeof date === 'object' && date.toDate) {
            // Firebase Timestamp ê°ì²´??ê²½ìš°
            return date.toDate();
          } else if (date && typeof date === 'object' && date.seconds) {
            // Firebase Timestamp ê°ì²´??ê²½ìš° (seconds, nanoseconds)
            return new Date(date.seconds * 1000);
          } else {
            // ê¸°í? ê²½ìš° ë¬¸ì?´ë¡œ ë³€????Date ê°ì²´ ?ì„±
            return new Date(String(date));
          }
        } catch (error) {
          console.error('? ì§œ ë³€???¤ë¥˜:', error, date);
          return new Date(); // ê¸°ë³¸ê°’ìœ¼ë¡??„ì¬ ?œê°„ ë°˜í™˜
        }
      };

      // ìµœê·¼ ?‘ì„±??ë©”ëª¨ê°€ ?„ìª½?¼ë¡œ ?¤ë„ë¡??•ë ¬ (updatedAt ê¸°ì? ?´ë¦¼ì°¨ìˆœ)
      const sortedMemos = processedMemos.sort((a, b) => {
        const dateA = safeDateConversion(a.updatedAt || a.createdAt);
        const dateB = safeDateConversion(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('ìµœì¢… ë©”ëª¨ ëª©ë¡:', sortedMemos.length, 'ê°?);
      return sortedMemos;
    } catch (error) {
      console.error('ë©”ëª¨ ëª©ë¡ ê°€?¸ì˜¤ê¸??¤íŒ¨:', error);
      throw error; // ?ëŸ¬ë¥??ìœ„ë¡??„íŒŒ
    }
  });
};

// ë©”ëª¨ ?ì„±
const createMemo = async (request: CreateMemoRequest): Promise<Memo> => {
  if (!validateMemo(request)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  const title = extractTitleFromContent(request.content);
  const memoData: Omit<Memo, 'id'> = {
    title,
    content: request.content.trim(),
    category: request.category || '?„ì‹œ',
    images: request.images || [],
    createdAt: new Date(),
    updatedAt: new Date().toISOString()
  };

  try {
    // Firebase???€??(1ì°??€?¥ì†Œ)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      const savedMemo = await createDocument(COLLECTIONS.MEMOS, memoData);
      console.log('Firebase??ë©”ëª¨ ?€???±ê³µ:', savedMemo.id);
      
      // Firebase?ì„œ ?ì„±??IDë¥??¬í•¨???„ì „??ë©”ëª¨ ê°ì²´ ë°˜í™˜
      const newMemo: Memo = {
        ...memoData,
        id: savedMemo.id || generateId()
      };
      
      return newMemo;
    } else {
      console.log('Firebase ?¬ìš© ë¶ˆê? ?ëŠ” ?¬ìš©??ë¯¸ì¸ì¦?);
      throw new StorageError('Firebase ?°ê²°???„ìš”?©ë‹ˆ??', 'FIREBASE_UNAVAILABLE');
    }
  } catch (error) {
    console.error('ë©”ëª¨ ?ì„± ?¤íŒ¨:', error);
    throw error; // ?ëŸ¬ë¥??ìœ„ë¡??„íŒŒ
  }
};

// ë©”ëª¨ ì¡°íšŒ
const getMemo = async (id: string): Promise<Memo | null> => {
  const memos = await getMemos();
  const memo = memos.find(memo => memo.id === id);
  if (memo) {
    // ì¹´í…Œê³ ë¦¬ê°€ ?†ëŠ” ê²½ìš° ê¸°ë³¸ê°?ì¶”ê?
    return {
      ...memo,
      category: memo.category || '?„ì‹œ'
    };
  }
  return null;
};

// ë©”ëª¨ ?˜ì •
const updateMemo = async (id: string, request: UpdateMemoRequest): Promise<Memo> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const memos = await getMemos();
  const memoIndex = memos.findIndex(memo => memo.id === id);

  if (memoIndex === -1) {
    throw new StorageError('ë©”ëª¨ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤.', 'MEMO_NOT_FOUND');
  }

  const currentMemo = memos[memoIndex];
  let newTitle = currentMemo.title;
  let newContent = currentMemo.content;

  // ?œëª© ?…ë°?´íŠ¸
  if (request.title !== undefined) {
    newTitle = request.title.trim() || extractTitleFromContent(newContent);
  }

  // ?´ìš© ?…ë°?´íŠ¸
  if (request.content !== undefined) {
    newContent = request.content.trim();
    // ?œëª©???†ê±°???´ìš©??ë³€ê²½ëœ ê²½ìš° ?œëª© ?¬ìƒ??    if (!newTitle || request.title === undefined) {
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
    // 1. Firebase??ë¨¼ì? ?…ë°?´íŠ¸ (?¨ë¼???°ì„ )
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await updateDocument(COLLECTIONS.MEMOS, updatedMemo.id, updatedMemo);
      console.log('Firebase??ë©”ëª¨ ?…ë°?´íŠ¸ ?±ê³µ:', updatedMemo.id);
      
      // 2. Firebase?ì„œ ìµœì‹  ?°ì´?°ë? ?¤ì‹œ ê°€?¸ì???ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        if (firebaseMemos.length > 0) {
          const memosJson = safeJsonStringify(firebaseMemos);
          if (memosJson) {
            console.log('ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸ ?„ë£Œ (Firebase ?°ì´??ê¸°ì?)');
          }
        }
      } catch (cacheError) {
        console.warn('ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸ ?¤íŒ¨, ë¡œì»¬?ë§Œ ?€??', cacheError);
        // ë¡œì»¬?ë§Œ ?€??(?¤í”„?¼ì¸ ëª¨ë“œ)
        memos[memoIndex] = updatedMemo;
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
        }
      }
    } else {
      // 3. Firebase ?¬ìš© ë¶ˆê??¥í•œ ê²½ìš° ë¡œì»¬?ë§Œ ?€??      console.log('Firebase ?¬ìš© ë¶ˆê??? ë¡œì»¬?ë§Œ ?€??);
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
    }

    return updatedMemo;
  } catch (error) {
    console.error('ë©”ëª¨ ?˜ì • ?¤íŒ¨:', error);
    
    // 3. Firebase ?¤íŒ¨ ??ë¡œì»¬?ë§Œ ?€??(?¤í”„?¼ì¸ ëª¨ë“œ)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('?¤íŠ¸?Œí¬ ?¤ë¥˜, ë¡œì»¬?ë§Œ ?€??', error);
      memos[memoIndex] = updatedMemo;
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
      return updatedMemo;
    }
    
    throw error;
  }
};

// ë©”ëª¨ ?? œ
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
    // 1. Firebase?ì„œ ë¨¼ì? ?? œ (?¨ë¼???°ì„ )
    if (isFirebaseAvailable() && getCurrentUserId()) {
      await deleteDocument(COLLECTIONS.MEMOS, id);
      console.log('Firebase?ì„œ ë©”ëª¨ ?? œ ?±ê³µ:', id);
      
      // 2. Firebase?ì„œ ìµœì‹  ?°ì´?°ë? ?¤ì‹œ ê°€?¸ì???ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸
      try {
        const firebaseMemos = await getDocuments<Memo>(COLLECTIONS.MEMOS, {});
        
        const memosJson = safeJsonStringify(firebaseMemos);
        if (memosJson) {
          console.log('ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸ ?„ë£Œ (Firebase ?°ì´??ê¸°ì?)');
        }
      } catch (cacheError) {
        console.warn('ë¡œì»¬ ìºì‹œ ?…ë°?´íŠ¸ ?¤íŒ¨, ë¡œì»¬?ì„œë§??? œ:', cacheError);
        // ë¡œì»¬?ì„œë§??? œ (?¤í”„?¼ì¸ ëª¨ë“œ)
        memos.splice(memoIndex, 1);
        const memosJson = safeJsonStringify(memos);
        if (memosJson) {
        }
      }
    } else {
      // 3. Firebase ?¬ìš© ë¶ˆê??¥í•œ ê²½ìš° ë¡œì»¬?ì„œë§??? œ
      console.log('Firebase ?¬ìš© ë¶ˆê??? ë¡œì»¬?ì„œë§??? œ');
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
    }

    return true;
  } catch (error) {
    console.error('ë©”ëª¨ ?? œ ?¤íŒ¨:', error);
    
    // 3. Firebase ?¤íŒ¨ ??ë¡œì»¬?ì„œë§??? œ (?¤í”„?¼ì¸ ëª¨ë“œ)
    if (error instanceof StorageError && error.code === 'NETWORK_ERROR') {
      console.warn('?¤íŠ¸?Œí¬ ?¤ë¥˜, ë¡œì»¬?ì„œë§??? œ:', error);
      memos.splice(memoIndex, 1);
      const memosJson = safeJsonStringify(memos);
      if (memosJson) {
      }
      return true;
    }
    
    throw error;
  }
};

// ë©”ëª¨ ê²€??const searchMemos = async (params: MemoSearchParams): Promise<MemoListResponse> => {
  let memos = await getMemos();

  // ?¤ì›Œ??ê²€??  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    memos = memos.filter(memo => 
      (memo.title?.toLowerCase().includes(keyword) || false) || 
      memo.content.toLowerCase().includes(keyword)
    );
  }

  // ?•ë ¬
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

  // ?˜ì´ì§€?¤ì´??  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMemos = memos.slice(startIndex, endIndex);

  return {
    memos: paginatedMemos,
    totalCount: memos.length
  };
};

// ë©”ëª¨ ?µê³„
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

// ë©”ëª¨ ë°±ì—…
const exportMemos = (): string => {
  const memos = getMemos();
  return safeJsonStringify(memos) || '[]';
};

// ë©”ëª¨ ë³µì›
const importMemos = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedMemos = safeJsonParse<Memo[]>(jsonData, []);
    
    if (!Array.isArray(importedMemos)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // ?°ì´??ê²€ì¦?    const validMemos = importedMemos.filter(memo => validateMemo(memo));
    
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

