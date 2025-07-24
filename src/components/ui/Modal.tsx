import React, { useEffect } from 'react';

export interface ModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 제목 */
  title?: string;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** 닫기 핸들러 */
  onClose: () => void;
  /** 닫기 버튼 숨김 */
  hideCloseButton?: boolean;
  /** 배경 클릭으로 닫기 비활성화 */
  disableBackdropClick?: boolean;
  /** 추가 클래스명 */
  className?: string;
  /** 모달 액션 */
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  size = 'md',
  onClose,
  hideCloseButton = false,
  disableBackdropClick = false,
  className = '',
  actions,
}) => {
  // ESC 키로 모달 닫기
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

  const sizeClasses = {
    sm: 'max-w-sm w-full mx-4',
    md: 'max-w-md w-full mx-4',
    lg: 'max-w-lg w-full mx-4 sm:max-w-2xl',
    xl: 'max-w-xl w-full mx-4 sm:max-w-4xl',
    '2xl': 'max-w-2xl w-full mx-4 sm:max-w-6xl',
    full: 'max-w-full w-full mx-2 sm:mx-4'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableBackdropClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className={`relative bg-white dark:bg-dark-card rounded-lg shadow-xl dark:shadow-dark w-full h-full sm:h-auto flex flex-col ${sizeClasses[size]} ${className}`}>
          {/* 모달 헤더 */}
          {(title || !hideCloseButton) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{title}</h3>
              )}
              {!hideCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 dark:text-dark-text-muted hover:text-gray-600 dark:hover:text-dark-text transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* 모달 내용 */}
          <div className="p-3 sm:p-6 flex-1 overflow-y-auto">
            {children}
          </div>
          
          {/* 모달 액션 */}
          {actions && (
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-secondary flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 