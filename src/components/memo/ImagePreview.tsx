import React, { useState } from 'react';
import { Button, Icon } from '../ui';
import type { Image } from '../../types/image';

interface ImagePreviewProps {
  image: Image;
  onDelete?: (imageId: string) => void;
  onView?: (image: Image) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showActions?: boolean;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onDelete,
  onView,
  size = 'md',
  showActions = true,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 크기별 스타일
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 이미지 로드 완료
  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // 이미지 로드 실패
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // 삭제 처리
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(image.id);
  };

  // 이미지 클릭 (상세 보기)
  const handleImageClick = () => {
    onView?.(image);
  };

  return (
    <div className={`image-preview relative group ${sizeClasses[size]} ${className}`}>
      {/* 이미지 컨테이너 */}
      <div
        className={`w-full h-full rounded-lg overflow-hidden border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md ${
          hasError ? 'bg-gray-100' : 'bg-white'
        }`}
        onClick={handleImageClick}
      >
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-start"></div>
          </div>
        )}

        {hasError && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Icon name="Image" size={24} className="text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">로드 실패</p>
            </div>
          </div>
        )}

        {!hasError && (
          <img
            src={image.thumbnail || image.data}
            alt={image.name}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>

      {/* 액션 버튼들 */}
      {showActions && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            {onView && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleImageClick}
                className="bg-white/80 hover:bg-white text-gray-700"
              >
                <Icon name="Settings" size={12} />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDelete(e);
                }}
                className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
              >
                <Icon name="Trash2" size={12} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 이미지 정보 (호버 시 표시) */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="truncate">{image.name}</div>
        <div className="flex justify-between items-center">
          <span>{formatFileSize(image.size)}</span>
          <span>{image.type.split('/')[1]?.toUpperCase()}</span>
        </div>
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-start"></div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview; 