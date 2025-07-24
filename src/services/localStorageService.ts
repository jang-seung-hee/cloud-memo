// ?�토리�? ???�수
const STORAGE_KEYS = {
  MEMOS: 'cloud_memo_memos',
  IMAGES: 'cloud_memo_images',
  TEMPLATES: 'cloud_memo_templates',
  SETTINGS: 'cloud_memo_settings'
} as const;

// ?�러 메시지 ?�수
const ERROR_MESSAGES = {
  STORAGE_NOT_AVAILABLE: '로컬?�토리�?�??�용?????�습?�다.',
  STORAGE_FULL: '로컬?�토리�? ?�량??부족합?�다.',
  INVALID_DATA: '?�못???�이???�식?�니??',
  DATA_TOO_LARGE: '?�이?��? ?�무 ?�니??',
  IMAGE_TOO_LARGE: '?��?지 ?�기가 ?�무 ?�니??',
  QUOTA_EXCEEDED: '?�??공간??부족합?�다.'
} as const;

// ?�정 ?�수
const STORAGE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_MEMO_LENGTH: 10000, // 10,000??
  MAX_TEMPLATE_LENGTH: 5000 // 5,000??
} as const;

// ?�틸리티 ?�수??
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const isStorageAvailable = (): boolean => {
  try {
    return true;
  } catch {
    return false;
  }
};

const getStorageSize = (): number => {
  // for (let i = 0; i < localStorage.length; i++) {
  //   const key = localStorage.key(i);
  //   if (key) {
  //   }
  // }
  console.log('로컬?�토리�? ?�용?��? ?�음, ?�기 0 반환');
  return 0;
};

  const currentSize = getStorageSize();
};

const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

const safeJsonStringify = (data: unknown): string | null => {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
};

// 기본 ?�러 ?�래??
class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  STORAGE_LIMITS,
  generateId,
  isStorageAvailable,
  getStorageSize,
  safeJsonParse,
  safeJsonStringify,
  StorageError
}; 
