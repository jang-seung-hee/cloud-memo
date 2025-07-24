// 스토리지 키 상수
const STORAGE_KEYS = {
  MEMOS: 'cloud_memo_memos',
  IMAGES: 'cloud_memo_images',
  TEMPLATES: 'cloud_memo_templates',
  SETTINGS: 'cloud_memo_settings'
} as const;

// 에러 메시지 상수
const ERROR_MESSAGES = {
  STORAGE_NOT_AVAILABLE: '로컬스토리지를 사용할 수 없습니다.',
  STORAGE_FULL: '로컬스토리지 용량이 부족합니다.',
  INVALID_DATA: '잘못된 데이터 형식입니다.',
  DATA_TOO_LARGE: '데이터가 너무 큽니다.',
  IMAGE_TOO_LARGE: '이미지 크기가 너무 큽니다.',
  QUOTA_EXCEEDED: '저장 공간이 부족합니다.'
} as const;

// 설정 상수
const STORAGE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TOTAL_STORAGE: 50 * 1024 * 1024, // 50MB
  MAX_MEMO_LENGTH: 10000, // 10,000자
  MAX_TEMPLATE_LENGTH: 5000 // 5,000자
} as const;

// 유틸리티 함수들
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

const getStorageSize = (): number => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      total += localStorage.getItem(key)?.length || 0;
    }
  }
  return total;
};

const validateStorageLimit = (dataSize: number): boolean => {
  const currentSize = getStorageSize();
  return currentSize + dataSize <= STORAGE_LIMITS.MAX_TOTAL_STORAGE;
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

// 기본 에러 클래스
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
  validateStorageLimit,
  safeJsonParse,
  safeJsonStringify,
  StorageError
}; 