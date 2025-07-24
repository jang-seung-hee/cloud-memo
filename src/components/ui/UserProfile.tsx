import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Icon from './Icon';

interface UserProfileProps {
  className?: string;
  showEmail?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  className = '', 
  showEmail = true,
  size = 'md'
}) => {
  const { state } = useAuthContext();
  const { user, isLoading } = state;

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
          {showEmail && (
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container: 'space-x-2',
      avatar: 'w-6 h-6',
      text: 'text-sm',
      email: 'text-xs'
    },
    md: {
      container: 'space-x-3',
      avatar: 'w-8 h-8',
      text: 'text-sm',
      email: 'text-xs'
    },
    lg: {
      container: 'space-x-4',
      avatar: 'w-12 h-12',
      text: 'text-base',
      email: 'text-sm'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-center ${classes.container} ${className}`}>
      {/* 프로필 이미지 */}
      <div className={`${classes.avatar} rounded-full overflow-hidden bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center`}>
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || '프로필'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name="User" size={size === 'lg' ? 24 : 16} className="text-white" />
        )}
      </div>

      {/* 사용자 정보 */}
      <div className="flex flex-col">
        <span className={`font-medium text-gray-900 dark:text-dark-text ${classes.text}`}>
          {user.displayName || '사용자'}
        </span>
        {showEmail && user.email && (
          <span className={`text-gray-500 dark:text-gray-400 ${classes.email}`}>
            {user.email}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 