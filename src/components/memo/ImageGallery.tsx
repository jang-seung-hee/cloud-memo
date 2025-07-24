import React, { useState } from 'react';
import { Card, Button, Icon, Modal } from '../ui';
import ImagePreview from './ImagePreview';
import type { Image } from '../../types/image';

interface ImageGalleryProps {
  images: Image[];
  onImageDelete?: (imageId: string) => void;
  onImageReorder?: (images: Image[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageDelete,
  onImageReorder,
  maxImages = 10,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지 상세 보기
  const handleImageView = (image: Image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // 이미지 삭제
  const handleImageDelete = (imageId: string) => {
    onImageDelete?.(imageId);
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (images.length === 0) {
    return (
      <div className={`image-gallery empty ${className}`}>
        <Card className="text-center py-8">
          <Icon name="Image" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">첨부된 이미지가 없습니다</h3>
          <p className="text-gray-600">이미지를 첨부하여 메모를 더욱 풍부하게 만들어보세요.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`image-gallery ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          첨부된 이미지 ({images.length}개)
        </h3>
        <div className="text-sm text-gray-500">
          총 {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
        </div>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.slice(0, maxImages).map((image, index) => (
          <ImagePreview
            key={image.id}
            image={image}
            size="lg"
            onDelete={handleImageDelete}
            onView={handleImageView}
            className="flex-shrink-0"
          />
        ))}
      </div>

      {/* 더 많은 이미지가 있는 경우 */}
      {images.length > maxImages && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            +{images.length - maxImages}개의 이미지가 더 있습니다
          </p>
        </div>
      )}

      {/* 이미지 상세 모달 */}
      <Modal
        isOpen={isModalOpen}
        title="이미지 상세"
        onClose={handleCloseModal}
        size="xl"
      >
        {selectedImage && (
          <div className="space-y-4">
            {/* 이미지 */}
            <div className="text-center">
              <img
                src={selectedImage.data}
                alt={selectedImage.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>

            {/* 이미지 정보 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">파일명:</span>
                <p className="text-gray-900 truncate">{selectedImage.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">크기:</span>
                <p className="text-gray-900">{formatFileSize(selectedImage.size)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">타입:</span>
                <p className="text-gray-900">{selectedImage.type}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">업로드:</span>
                <p className="text-gray-900">{formatDate(selectedImage.uploadedAt)}</p>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  handleImageDelete(selectedImage.id);
                  handleCloseModal();
                }}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <Icon name="Trash2" size={16} />
                <span className="ml-1">삭제</span>
              </Button>
              <Button onClick={handleCloseModal} variant="primary">
                닫기
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImageGallery; 