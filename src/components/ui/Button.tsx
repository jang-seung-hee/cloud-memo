import React from 'react';

export interface ButtonProps {
  /** 버튼 텍스트 */
  children: React.ReactNode;
  /** 버튼 타입 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 클릭 핸들러 */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 버튼 타입 */
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-start to-primary-end text-white hover:from-primary-hover-start hover:to-primary-hover-end hover:shadow-medium focus:ring-primary-start',
    secondary: 'bg-gradient-to-r from-secondary-start to-secondary-end text-gray-800 dark:text-dark-text hover:shadow-light focus:ring-secondary-start',
    outline: 'border-2 border-primary-start text-primary-start dark:text-primary-start bg-transparent hover:bg-primary-start hover:text-white focus:ring-primary-start',
    ghost: 'text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg-secondary focus:ring-gray-300 dark:focus:ring-dark-border'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 