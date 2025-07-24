import React, { useEffect } from 'react';
import { Icon } from './index';
import type { Image } from '../../types/image';

interface FullscreenImageViewerProps {
  image: Image | null;
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  image,
  isOpen,
  onClose
}) => {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 배경 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden">
      {/* 배경 오버레이 - 흐릿한 효과 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[73] p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all duration-200"
        aria-label="닫기"
      >
        <Icon name="X" size={24} />
      </button>

      {/* 이미지 컨테이너 */}
      <div className="flex items-center justify-center w-full h-full relative z-[72]">
        <img
          src={image.data}
          alt={image.name}
          className="w-full h-full object-contain"
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
        />
      </div>
    </div>
  );
};

export default FullscreenImageViewer; 