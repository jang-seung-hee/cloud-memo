// ?§ÌÜ†Î¶¨Ï? ???ÅÏàò
const STORAGE_KEYS = {
  MEMOS: 'cloud_memo_memos',
  IMAGES: 'cloud_memo_images',
  TEMPLATES: 'cloud_memo_templates',
  SETTINGS: 'cloud_memo_settings'
} as const;

// ?êÎü¨ Î©îÏãúÏßÄ ?ÅÏàò
const ERROR_MESSAGES = {
  STORAGE_NOT_AVAILABLE: 'Î°úÏª¨?§ÌÜ†Î¶¨Ï?Î•??¨Ïö©?????ÜÏäµ?àÎã§.',
  STORAGE_FULL: 'Î°úÏª¨?§ÌÜ†Î¶¨Ï? ?©Îüâ??Î∂ÄÏ°±Ìï©?àÎã§.',
  INVALID_DATA: '?òÎ™ª???∞Ïù¥???ïÏãù?ÖÎãà??',
  DATA_TOO_LARGE: '?∞Ïù¥?∞Í? ?àÎ¨¥ ?ΩÎãà??',
  IMAGE_TOO_LARGE: '?¥Î?ÏßÄ ?¨Í∏∞Í∞Ä ?àÎ¨¥ ?ΩÎãà??',
  QUOTA_EXCEEDED: '?Ä??Í≥µÍ∞Ñ??Î∂ÄÏ°±Ìï©?àÎã§.'
} as const;

// ?§Ï†ï ?ÅÏàò
const STORAGE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_MEMO_LENGTH: 10000, // 10,000??
  MAX_TEMPLATE_LENGTH: 5000 // 5,000??
} as const;

// ?†Ìã∏Î¶¨Ìã∞ ?®Ïàò??
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
  console.log('Î°úÏª¨?§ÌÜ†Î¶¨Ï? ?¨Ïö©?òÏ? ?äÏùå, ?¨Í∏∞ 0 Î∞òÌôò');
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

// Í∏∞Î≥∏ ?êÎü¨ ?¥Îûò??
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
