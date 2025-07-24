import React from 'react';
import Icon, { IconName } from './Icon';
import Button from './Button';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { useAuthContext } from '../../contexts/AuthContext';
import syncService from '../../services/syncService';

interface SyncStatusProps {
  className?: string;
  showProgress?: boolean;
  showNetworkStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SyncStatus: React.FC<SyncStatusProps> = ({ 
  className = '', 
  showProgress = true,
  showNetworkStatus = true,
  size = 'md'
}) => {
  const { state: authState } = useAuthContext();
  const { 
    startManualSync, 
    retrySync, 
    toggleAutoSync,
    isOnline, 
    isSyncing, 
    hasError, 
    progress, 
    lastSyncTime, 
    error 
  } = useSyncStatus();

  // 로그인하지 않은 경우 표시하지 않음
  if (!authState.user) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container: 'text-xs',
      icon: 14,
      button: 'sm'
    },
    md: {
      container: 'text-sm',
      icon: 16,
      button: 'sm'
    },
    lg: {
      container: 'text-base',
      icon: 18,
      button: 'md'
    }
  };

  const classes = sizeClasses[size];

  // 상태별 아이콘과 색상
  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: 'WifiOff',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: '오프라인'
      };
    }

    if (isSyncing) {
      return {
        icon: 'Loader2',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        text: '동기화 중'
      };
    }

    if (hasError) {
      return {
        icon: 'AlertCircle',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: '동기화 오류'
      };
    }

    if (lastSyncTime) {
      return {
        icon: 'CheckCircle',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        text: '동기화 완료'
      };
    }

    return {
      icon: 'Cloud',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      text: '대기 중'
    };
  };

  const statusInfo = getStatusInfo();

  // 마지막 동기화 시간 포맷팅
  const formatLastSyncTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className={`flex items-center space-x-2 ${classes.container} ${className}`}>
      {/* 상태 아이콘 */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
        <Icon 
          name={statusInfo.icon as IconName} 
          size={classes.icon} 
          className={`${statusInfo.color} ${isSyncing ? 'animate-spin' : ''}`} 
        />
        <span className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* 진행률 표시 */}
      {showProgress && isSyncing && progress.totalTasks > 0 && (
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">
            {progress.completedTasks}/{progress.totalTasks}
          </span>
          <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* 네트워크 상태 */}
      {showNetworkStatus && (
        <div className="flex items-center space-x-1">
          <Icon 
            name={isOnline ? 'Wifi' : 'WifiOff'} 
            size={classes.icon} 
            className={isOnline ? 'text-green-500' : 'text-red-500'} 
          />
          <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? '온라인' : '오프라인'}
          </span>
        </div>
      )}

      {/* 마지막 동기화 시간 */}
      {lastSyncTime && !isSyncing && !hasError && (
        <span className="text-gray-500 text-xs">
          {formatLastSyncTime(lastSyncTime)}
        </span>
      )}

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-1">
        {/* 재시도 버튼 */}
        {hasError && (
          <Button
            variant="ghost"
            size={classes.button as 'sm' | 'md'}
            onClick={retrySync}
            className="p-1"
          >
            <Icon name="RefreshCw" size={classes.icon} />
          </Button>
        )}

        {/* 수동 동기화 버튼 */}
        {!isSyncing && isOnline && (
          <Button
            variant="ghost"
            size={classes.button as 'sm' | 'md'}
            onClick={startManualSync}
            className="p-1"
          >
            <Icon name="RefreshCw" size={classes.icon} />
          </Button>
        )}

        {/* 자동 동기화 토글 버튼 */}
                 <Button
           variant="ghost"
           size={classes.button as 'sm' | 'md'}
           onClick={toggleAutoSync}
           className="p-1"
         >
           <Icon 
             name={syncService.getConfig().autoSync ? 'Pause' : 'RefreshCw'} 
             size={classes.icon} 
           />
         </Button>
      </div>

      {/* 오류 메시지 툴팁 */}
      {hasError && error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md shadow-lg z-10 max-w-xs">
          <p className="text-red-700 dark:text-red-300 text-xs">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default SyncStatus; 