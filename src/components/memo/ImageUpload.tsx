import React, { useState, useRef } from 'react';
import { Button, Icon } from '../ui';
import { processImage } from '../../utils/imageUtils';
import type { Image } from '../../types/image';

interface ImageUploadProps {
  onImageUpload: (images: Image[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  maxImages = 10,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 업로드 처리
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadedImages: Image[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < Math.min(files.length, maxImages); i++) {
        const file = files[i];
        
        try {
          // 이미지 처리 (압축, 썸네일 생성)
          const result = await processImage('gallery', {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8
          });

          // 이미지 정보 생성
          const image: Image = {
            id: `img_${Date.now()}_${i}`,
            data: result.dataUrl,
            name: file.name,
            size: result.file.size,
            type: result.file.type,
            thumbnail: result.thumbnail?.dataUrl,
            uploadedAt: new Date()
          };

          uploadedImages.push(image);
          
          // 진행률 업데이트
          setUploadProgress(((i + 1) / totalFiles) * 100);
        } catch (error) {
          console.error(`이미지 ${file.name} 처리 실패:`, error);
        }
      }

      // 업로드된 이미지들을 부모 컴포넌트에 전달
      if (uploadedImages.length > 0) {
        onImageUpload(uploadedImages);
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 카메라 촬영
  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(50);

      const result = await processImage('capture', {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8
      });

             const image: Image = {
         id: `img_${Date.now()}_camera`,
         data: result.dataUrl,
         name: `camera_${Date.now()}.jpg`,
         size: result.file.size,
         type: result.file.type,
         thumbnail: result.thumbnail?.dataUrl,
         uploadedAt: new Date()
       };

      onImageUpload([image]);
      setUploadProgress(100);
    } catch (error) {
      console.error('카메라 촬영 실패:', error);
      if (error instanceof Error && error.message.includes('취소')) {
        // 사용자가 취소한 경우는 알림하지 않음
      } else {
        alert('카메라 촬영에 실패했습니다.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 갤러리 선택
  const handleGallerySelect = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    handleImageUpload(files);
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 업로드 영역 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-start transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleGallerySelect}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start"></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                이미지 처리 중... {Math.round(uploadProgress)}%
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-start h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Icon name="Image" size={32} className="text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                이미지 첨부
              </p>
              <p className="text-sm text-gray-600 mb-4">
                클릭하여 갤러리에서 선택하거나<br />
                이미지를 여기에 드래그하세요
              </p>
              <p className="text-xs text-gray-500">
                최대 {maxImages}개, 각 5MB 이하
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼들 */}
      {!isUploading && (
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={handleCameraCapture}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Icon name="Camera" size={16} />
            <span className="ml-2">카메라</span>
          </Button>
          <Button
            onClick={handleGallerySelect}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Icon name="FileText" size={16} />
            <span className="ml-2">갤러리</span>
          </Button>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start">
          <Icon name="Info" size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">이미지 첨부 팁</p>
            <ul className="space-y-1 text-xs">
              <li>• 지원 형식: JPEG, PNG, WebP, GIF</li>
              <li>• 최대 크기: 5MB (자동 압축됨)</li>
              <li>• 최대 개수: {maxImages}개</li>
              <li>• 드래그 앤 드롭 지원</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 