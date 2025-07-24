import React from 'react';

export interface CardProps {
  /** 카드 내용 */
  children: React.ReactNode;
  /** 카드 제목 */
  title?: string;
  /** 카드 부제목 */
  subtitle?: string;
  /** 카드 이미지 */
  image?: string;
  /** 이미지 대체 텍스트 */
  imageAlt?: string;
  /** 카드 액션 */
  actions?: React.ReactNode;
  /** 호버 효과 */
  hoverable?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 클래스명 */
  className?: string;
  /** 카드 패딩 */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** 카드 그림자 */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  image,
  imageAlt,
  actions,
  hoverable = false,
  onClick,
  className = '',
  padding = 'md',
  shadow = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-light',
    md: 'shadow-medium',
    lg: 'shadow-dark'
  };
  
  const hoverClasses = hoverable ? 'hover:shadow-medium hover:transform hover:-translate-y-1 transition-all duration-200 cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const baseClasses = 'bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden';
  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {image && (
        <div className="relative">
          <img 
            src={image} 
            alt={imageAlt || title || 'Card image'} 
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-border">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-dark-text-muted">{subtitle}</p>
          )}
        </div>
      )}
      
      {padding === 'none' ? (
        children
      ) : (
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          {children}
        </div>
      )}
      
      {actions && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-secondary">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card; 