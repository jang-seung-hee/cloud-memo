import React from 'react';

export interface InputProps {
  /** 입력값 */
  value?: string;
  /** 기본값 */
  defaultValue?: string;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 라벨 */
  label?: string;
  /** 도움말 텍스트 */
  helpText?: string;
  /** 에러 메시지 */
  error?: string;
  /** 입력 타입 */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** 필수 입력 여부 */
  required?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 최대 길이 */
  maxLength?: number;
  /** 아이콘 */
  icon?: React.ReactNode;
  /** 변경 핸들러 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 포커스 핸들러 */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 블러 핸들러 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 추가 클래스명 */
  className?: string;
  /** 입력 필드 이름 */
  name?: string;
  /** 자동완성 */
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  defaultValue,
  placeholder,
  label,
  helpText,
  error,
  type = 'text',
  required = false,
  disabled = false,
  readOnly = false,
  maxLength,
  icon,
  onChange,
  onFocus,
  onBlur,
  className = '',
  name,
  autoComplete,
}) => {
  const baseClasses = 'w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-dark-text bg-white dark:bg-dark-card placeholder-gray-500 dark:placeholder-dark-text-muted';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const iconClasses = icon ? 'pl-10' : '';
  
  const classes = `${baseClasses} ${errorClasses} ${iconClasses} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 dark:text-dark-text-muted">{icon}</span>
          </div>
        )}
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={classes}
          name={name}
          autoComplete={autoComplete}
        />
      </div>
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-muted">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input; 