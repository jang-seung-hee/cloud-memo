import type { Image, ImageUploadResponse } from '../types/image';
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
  uploadFile
} from './firebaseService';

// ?��?지 ?�이??검�?
const validateImage = (image: Partial<Image>): boolean => {
  if (!image.data || image.data.length === 0) {
    return false;
  }
  if (!image.name || image.name.trim().length === 0) {
    return false;
  }
  if (!image.type || !image.type.startsWith('image/')) {
    return false;
  }
  if (image.size && image.size > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
    return false;
  }
  return true;
};

// Base64 ?�이???�기 계산
const getBase64Size = (base64String: string): number => {
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  return (base64String.length * 3) / 4 - padding;
};

// ?��?지 목록 가?�오�?
const getImages = (): Image[] => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    // if (!imagesJson) {
    //   return [];
    // }

    // const images = safeJsonParse<Image[]>(imagesJson, []);
    // return Array.isArray(images) ? images : [];
    console.log('로컬?�토리�? ?�용?��? ?�음, �?배열 반환');
    return [];
  } catch (error) {
    console.error('?��?지 목록 가?�오�??�패:', error);
    return [];
  }
};

// ?��?지 ?�??
const saveImage = async (file: File): Promise<ImageUploadResponse> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (file.size > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
    throw new StorageError(ERROR_MESSAGES.IMAGE_TOO_LARGE, 'IMAGE_TOO_LARGE');
  }

  if (!file.type.startsWith('image/')) {
    throw new StorageError('?��?지 ?�일�??�로??가?�합?�다.', 'INVALID_FILE_TYPE');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const dataSize = getBase64Size(base64Data);

        if (dataSize > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
          reject(new StorageError(ERROR_MESSAGES.IMAGE_TOO_LARGE, 'IMAGE_TOO_LARGE'));
          return;
        }

        const newImage: Image = {
          id: generateId(),
          data: base64Data,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        };

        if (!validateImage(newImage)) {
          reject(new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA'));
          return;
        }

        const images = getImages();
        const totalDataSize = safeJsonStringify([...images, newImage])?.length || 0;

        if (!validateStorageLimit(totalDataSize)) {
          reject(new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL'));
          return;
        }

        images.push(newImage);
        const imagesJson = safeJsonStringify(images);
        if (imagesJson) {
        }

        // Firebase Storage ?�기??(?�증???�용?�인 경우)
        if (isFirebaseAvailable() && getCurrentUserId()) {
          try {
            // Firebase Storage??직접 ?�로??
            await uploadFile(file, 'images');
          } catch (syncError) {
            console.warn('Firebase Storage ?�기???�패 (?��?지 ?�로??:', syncError);
            // ?�기???�패?�도 로컬 ?�?��? ?�공?�로 처리
          }
        }

        resolve({
          image: newImage,
          success: true
        });
      } catch (error) {
        reject(new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED'));
      }
    };

    reader.onerror = () => {
      reject(new StorageError('?�일 ?�기 ?�패', 'FILE_READ_ERROR'));
    };

    reader.readAsDataURL(file);
  });
};

// ?��?지 조회
const getImage = (id: string): Image | null => {
  const images = getImages();
  return images.find(image => image.id === id) || null;
};

// ?��?지 ??��
const deleteImage = (id: string): boolean => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const images = getImages();
  const imageIndex = images.findIndex(image => image.id === id);

  if (imageIndex === -1) {
    return false;
  }

  try {
    images.splice(imageIndex, 1);
    const imagesJson = safeJsonStringify(images);
    if (imagesJson) {
    }
    return true;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?��?지 ?�운로드
const downloadImage = (id: string): void => {
  const image = getImage(id);
  if (!image) {
    throw new StorageError('?��?지�?찾을 ???�습?�다.', 'IMAGE_NOT_FOUND');
  }

  try {
    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new StorageError('?��?지 ?�운로드 ?�패', 'DOWNLOAD_ERROR');
  }
};

// ?��?지 ?�계
const getImageStats = () => {
  const images = getImages();
  const totalImages = images.length;
  const totalSize = images.reduce((sum, image) => sum + image.size, 0);
  const totalStorageSize = images.reduce((sum, image) => sum + getBase64Size(image.data), 0);
  const todayImages = images.filter(image => {
    const today = new Date();
    const imageDate = new Date(image.uploadedAt);
    return imageDate.toDateString() === today.toDateString();
  }).length;

  return {
    totalImages,
    totalSize,
    totalStorageSize,
    todayImages
  };
};

// ?�용?��? ?�는 ?��?지 ?�리
const cleanupUnusedImages = (usedImageIds: string[]): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const images = getImages();
  const usedIds = new Set(usedImageIds);
  const unusedImages = images.filter(image => !usedIds.has(image.id));

  if (unusedImages.length === 0) {
    return 0;
  }

  try {
    const remainingImages = images.filter(image => usedIds.has(image.id));
    const imagesJson = safeJsonStringify(remainingImages);
    if (imagesJson) {
    }
    return unusedImages.length;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?��?지 ?�축 (Base64 ?�기 줄이�?
const compressImage = (base64Data: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new StorageError('Canvas 컨텍?�트�??�성?????�습?�다.', 'CANVAS_ERROR'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(new StorageError('?��?지 ?�축 ?�패', 'COMPRESSION_ERROR'));
      }
    };

    img.onerror = () => {
      reject(new StorageError('?��?지 로드 ?�패', 'IMAGE_LOAD_ERROR'));
    };

    img.src = base64Data;
  });
};

// ?��?지 백업
const exportImages = (): string => {
  const images = getImages();
  return safeJsonStringify(images) || '[]';
};

// ?��?지 복원
const importImages = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedImages = safeJsonParse<Image[]>(jsonData, []);
    
    if (!Array.isArray(importedImages)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // ?�이??검�?
    const validImages = importedImages.filter(image => validateImage(image));
    
    const dataSize = safeJsonStringify(validImages)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const imagesJson = safeJsonStringify(validImages);
    if (imagesJson) {
    }

    return validImages.length;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }
};

export {
  getImages,
  saveImage,
  getImage,
  deleteImage,
  downloadImage,
  getImageStats,
  cleanupUnusedImages,
  compressImage,
  exportImages,
  importImages,
  validateImage,
  getBase64Size
}; 
