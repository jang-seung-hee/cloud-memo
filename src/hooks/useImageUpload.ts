import { useState, useCallback } from 'react';
import { processImage } from '../utils/imageUtils';
import type { Image } from '../types/image';

interface UseImageUploadOptions {
  maxImages?: number;
  maxSize?: number; // MB
  allowedTypes?: string[];
  enableCompression?: boolean;
  compressionQuality?: number;
}

interface UseImageUploadReturn {
  images: Image[];
  isUploading: boolean;
  error: string | null;
  uploadImages: (files: FileList | File[]) => Promise<Image[]>;
  removeImage: (imageId: string) => void;
  clearImages: () => void;
  replaceImage: (imageId: string, file: File) => Promise<boolean>;
  getImageById: (imageId: string) => Image | undefined;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    maxImages = 10,
    maxSize = 10, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    enableCompression = true,
    compressionQuality = 0.8
  } = options;

  const [images, setImages] = useState<Image[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 업로드 처리
  const uploadImages = useCallback(async (files: FileList | File[]): Promise<Image[]> => {
    try {
      setIsUploading(true);
      setError(null);

      const fileArray = Array.from(files);
      const uploadedImages: Image[] = [];

      // 최대 이미지 수 확인
      if (images.length + fileArray.length > maxImages) {
        throw new Error(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      }

      for (const file of fileArray) {
        // 파일 타입 확인
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
        }

        // 파일 크기 확인
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`파일 크기가 너무 큽니다: ${file.name} (최대 ${maxSize}MB)`);
        }

        // 이미지 처리
        const processedImage = await processImage(file, {
          quality: compressionQuality,
          maxWidth: 1280,
          maxHeight: 720
        });

        // Image 타입으로 변환
        const imageData: Image = {
          id: crypto.randomUUID(),
          data: processedImage.dataUrl,
          name: processedImage.file.name,
          size: processedImage.file.size,
          type: processedImage.file.type,
          thumbnail: processedImage.thumbnail?.dataUrl,
          uploadedAt: new Date()
        };

        uploadedImages.push(imageData);
      }

      // 이미지 목록에 추가
      setImages(prev => [...prev, ...uploadedImages]);

      return uploadedImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      console.error('이미지 업로드 실패:', err);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [images.length, maxImages, allowedTypes, maxSize, enableCompression, compressionQuality]);

  // 이미지 제거
  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setError(null);
  }, []);

  // 모든 이미지 제거
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  // 이미지 교체
  const replaceImage = useCallback(async (imageId: string, file: File): Promise<boolean> => {
    try {
      setIsUploading(true);
      setError(null);

      // 파일 타입 확인
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`지원하지 않는 파일 형식입니다: ${file.type}`);
      }

      // 파일 크기 확인
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`파일 크기가 너무 큽니다: ${file.name} (최대 ${maxSize}MB)`);
      }

      // 이미지 처리
      const processedImage = await processImage(file, {
        quality: compressionQuality,
        maxWidth: 1280,
        maxHeight: 720
      });

      // Image 타입으로 변환
      const imageData: Image = {
        id: imageId,
        data: processedImage.dataUrl,
        name: processedImage.file.name,
        size: processedImage.file.size,
        type: processedImage.file.type,
        thumbnail: processedImage.thumbnail?.dataUrl,
        uploadedAt: new Date()
      };

      // 이미지 교체
      setImages(prev => prev.map(img => 
        img.id === imageId ? imageData : img
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '이미지 교체에 실패했습니다.';
      setError(errorMessage);
      console.error('이미지 교체 실패:', err);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [allowedTypes, maxSize, enableCompression, compressionQuality]);

  // ID로 이미지 찾기
  const getImageById = useCallback((imageId: string): Image | undefined => {
    return images.find(img => img.id === imageId);
  }, [images]);

  return {
    images,
    isUploading,
    error,
    uploadImages,
    removeImage,
    clearImages,
    replaceImage,
    getImageById
  };
}

// 드래그 앤 드롭 훅
export function useImageDragAndDrop(
  onImagesUpload: (files: File[]) => void,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [enabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, [enabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
  }, [enabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      onImagesUpload(files);
    }
  }, [enabled, onImagesUpload]);

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
} 