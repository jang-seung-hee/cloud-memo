import React, { useState } from 'react';
import { Modal } from '../ui';
import type { Memo } from '../../types/memo';

interface MemoDetailProps {
  memo: Memo;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
}

const MemoDetail: React.FC<MemoDetailProps> = ({
  memo,
  onEdit,
  onDelete,
  onBack,
  onClose,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // 날짜 포맷팅
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 제목 표시 (제목이 없으면 내용의 첫 줄 사용)
  const getDisplayTitle = (memo: Memo) => {
    if (memo.title) {
      return memo.title;
    }
    
    // 내용의 첫 줄을 제목으로 사용
    const firstLine = memo.content.split('\n')[0].trim();
    if (firstLine.length <= 50) {
      return firstLine;
    }
    return firstLine.substring(0, 50) + '...';
  };

  // 이미지 클릭 처리
  const handleImageClick = (imageData: string) => {
    setSelectedImage(imageData);
    setIsImageModalOpen(true);
  };

  // 이미지 모달 닫기
  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };



  return (
    <div className={`memo-detail text-left ${className}`}>
      {/* 제목 */}
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
          {getDisplayTitle(memo)}
        </h2>
      </div>
      
      {/* ID 정보 */}
      <div className="text-sm text-gray-500 dark:text-dark-text-muted mb-3">
        <div>ID: {memo.id}</div>
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <div className="whitespace-pre-wrap text-gray-700 dark:text-dark-text leading-relaxed bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border">
          {memo.content}
        </div>
      </div>

      {/* 이미지 섹션 */}
      {memo.images.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
            첨부된 이미지 ({memo.images.length}개)
          </h3>
          <div className="space-y-3">
            {memo.images.map((image, index) => (
              <div
                key={image.id || index}
                className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleImageClick(image.data)}
              >
                <img
                  src={image.data}
                  alt={image.name}
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    // 이미지 로드 실패 시 아이콘 표시
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-32 flex items-center justify-center bg-gray-100">
                          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
                <div className="p-2 bg-gray-50 dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border">
                  <p className="text-sm text-gray-600 dark:text-dark-text-muted truncate">{image.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 작성/수정 날짜 정보 */}
      <div className="mt-4">
        <div className="bg-gray-50 dark:bg-dark-bg-secondary rounded-lg p-3 border border-gray-200 dark:border-dark-border">
          <div className="text-sm text-gray-500 dark:text-dark-text-muted space-y-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-600 dark:text-dark-text mr-2">작성:</span>
              <span>{formatDate(memo.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-600 dark:text-dark-text mr-2">수정:</span>
              <span>{formatDate(memo.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 이미지 확대 보기 모달 */}
      <Modal
        isOpen={isImageModalOpen}
        title="이미지 보기"
        onClose={handleImageModalClose}
        size="xl"
      >
        {selectedImage && (
          <div className="text-center">
            <img
              src={selectedImage}
              alt="확대된 이미지"
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MemoDetail; 