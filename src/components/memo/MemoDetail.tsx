import React, { useState } from 'react';
import { FullscreenImageViewer } from '../ui';
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
  const [selectedImage, setSelectedImage] = useState<import('../../types/image').Image | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  // 날짜 포맷팅
  const formatDate = (date: any) => {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Firebase Timestamp 객체인 경우
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && date.seconds) {
        // Firebase Timestamp 객체인 경우 (seconds, nanoseconds)
        dateObj = new Date(date.seconds * 1000);
      } else {
        // 기타 경우 문자열로 변환 후 Date 객체 생성
        dateObj = new Date(String(date));
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(dateObj.getTime())) {
        return '날짜 정보 없음';
      }
      
      return dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error, date);
      return '날짜 정보 없음';
    }
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
  const handleImageClick = (image: import('../../types/image').Image) => {
    setSelectedImage(image);
    setIsImageViewerOpen(true);
  };

  // 이미지 뷰어 닫기
  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImage(null);
  };



  return (
    <div className={`memo-detail text-left ${className}`}>
      {/* 제목 */}
      <div className="mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            {getDisplayTitle(memo)}
          </h2>
          {/* 카테고리 뱃지 */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            memo.category === '임시' 
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              : memo.category === '기억'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {memo.category}
          </span>
        </div>
      </div>
      
      {/* ID 정보 */}
      <div className="text-sm text-gray-500 dark:text-dark-text-muted mb-3">
                        <div>{formatDate(memo.createdAt)}에 작성됨</div>
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere text-gray-700 dark:text-dark-text leading-relaxed bg-white dark:bg-dark-card rounded-lg p-3 border border-gray-200 dark:border-dark-border">
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
                onClick={() => handleImageClick(image)}
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

      {/* 전체화면 이미지 뷰어 */}
      <FullscreenImageViewer
        image={selectedImage}
        isOpen={isImageViewerOpen}
        onClose={handleCloseImageViewer}
      />
    </div>
  );
};

export default MemoDetail; 