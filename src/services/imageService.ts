import type { Image, ImageUploadResponse } from '../types/image';
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
  getCurrentUserId
} from './firebaseService';
import syncService from './syncService';
import { SyncOperation } from '../types/sync';

// 이미지 데이터 검증
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

// Base64 데이터 크기 계산
const getBase64Size = (base64String: string): number => {
  const padding = base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  return (base64String.length * 3) / 4 - padding;
};

// 이미지 목록 가져오기
const getImages = (): Image[] => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const imagesJson = localStorage.getItem(STORAGE_KEYS.IMAGES);
    if (!imagesJson) {
      return [];
    }

    const images = safeJsonParse<Image[]>(imagesJson, []);
    return Array.isArray(images) ? images : [];
  } catch (error) {
    console.error('이미지 목록 가져오기 실패:', error);
    return [];
  }
};

// 이미지 저장
const saveImage = (file: File): Promise<ImageUploadResponse> => {
  return new Promise((resolve, reject) => {
    if (!isStorageAvailable()) {
      reject(new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE'));
      return;
    }

    if (file.size > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
      reject(new StorageError(ERROR_MESSAGES.IMAGE_TOO_LARGE, 'IMAGE_TOO_LARGE'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new StorageError('이미지 파일만 업로드 가능합니다.', 'INVALID_FILE_TYPE'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
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
          localStorage.setItem(STORAGE_KEYS.IMAGES, imagesJson);
        }

        // Firebase Storage 동기화 (인증된 사용자인 경우)
        if (isFirebaseAvailable() && getCurrentUserId()) {
          try {
            syncService.addSyncOperation(
              SyncOperation.UPLOAD,
              'image',
              newImage.id,
              file
            );
          } catch (syncError) {
            console.warn('Firebase Storage 동기화 실패 (이미지 업로드):', syncError);
            // 동기화 실패해도 로컬 저장은 성공으로 처리
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
      reject(new StorageError('파일 읽기 실패', 'FILE_READ_ERROR'));
    };

    reader.readAsDataURL(file);
  });
};

// 이미지 조회
const getImage = (id: string): Image | null => {
  const images = getImages();
  return images.find(image => image.id === id) || null;
};

// 이미지 삭제
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
      localStorage.setItem(STORAGE_KEYS.IMAGES, imagesJson);
    }
    return true;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 이미지 다운로드
const downloadImage = (id: string): void => {
  const image = getImage(id);
  if (!image) {
    throw new StorageError('이미지를 찾을 수 없습니다.', 'IMAGE_NOT_FOUND');
  }

  try {
    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new StorageError('이미지 다운로드 실패', 'DOWNLOAD_ERROR');
  }
};

// 이미지 통계
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

// 사용되지 않는 이미지 정리
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
      localStorage.setItem(STORAGE_KEYS.IMAGES, imagesJson);
    }
    return unusedImages.length;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 이미지 압축 (Base64 크기 줄이기)
const compressImage = (base64Data: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new StorageError('Canvas 컨텍스트를 생성할 수 없습니다.', 'CANVAS_ERROR'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (error) {
        reject(new StorageError('이미지 압축 실패', 'COMPRESSION_ERROR'));
      }
    };

    img.onerror = () => {
      reject(new StorageError('이미지 로드 실패', 'IMAGE_LOAD_ERROR'));
    };

    img.src = base64Data;
  });
};

// 이미지 백업
const exportImages = (): string => {
  const images = getImages();
  return safeJsonStringify(images) || '[]';
};

// 이미지 복원
const importImages = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedImages = safeJsonParse<Image[]>(jsonData, []);
    
    if (!Array.isArray(importedImages)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // 데이터 검증
    const validImages = importedImages.filter(image => validateImage(image));
    
    const dataSize = safeJsonStringify(validImages)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const imagesJson = safeJsonStringify(validImages);
    if (imagesJson) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, imagesJson);
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