import React, { useState, useEffect } from 'react';
import Icon, { IconName } from './Icon';
import Button from './Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { isOnline, addNetworkStatusListener, checkFirebaseConnection } from '../../services/firebaseService';

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
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [firebaseStatus, setFirebaseStatus] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // 네트워크 상태 감지
  useEffect(() => {
    const unsubscribe = addNetworkStatusListener((isOnline) => {
      setNetworkStatus(isOnline);
      if (isOnline) {
        // 온라인 상태가 되면 Firebase 연결 확인
        checkFirebaseConnectionStatus();
      }
    });

    // 초기 Firebase 연결 상태 확인
    checkFirebaseConnectionStatus();

    return unsubscribe;
  }, []);

  // Firebase 연결 상태 확인
  const checkFirebaseConnectionStatus = async () => {
    setIsCheckingConnection(true);
    try {
      const isConnected = await checkFirebaseConnection();
      setFirebaseStatus(isConnected);
    } catch (error) {
      console.error('Firebase 연결 확인 실패:', error);
      setFirebaseStatus(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

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
    if (!networkStatus) {
      return {
        icon: 'WifiOff',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: '오프라인'
      };
    }

    if (isCheckingConnection) {
      return {
        icon: 'Loader2',
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        text: '연결 확인 중'
      };
    }

    if (firebaseStatus === false) {
      return {
        icon: 'AlertCircle',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        text: 'Firebase 연결 실패'
      };
    }

    if (firebaseStatus === true) {
      return {
        icon: 'CheckCircle',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        text: '연결됨'
      };
    }

    return {
      icon: 'Cloud',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      text: '확인 중'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`flex items-center space-x-2 ${classes.container} ${className}`}>
      {/* 상태 아이콘 */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
        <Icon 
          name={statusInfo.icon as IconName} 
          size={classes.icon} 
          className={`${statusInfo.color} ${isCheckingConnection ? 'animate-spin' : ''}`} 
        />
        <span className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* 네트워크 상태 */}
      {showNetworkStatus && (
        <div className="flex items-center space-x-1">
          <Icon 
            name={networkStatus ? 'Wifi' : 'WifiOff'} 
            size={classes.icon} 
            className={networkStatus ? 'text-green-500' : 'text-red-500'} 
          />
          <span className={`text-xs ${networkStatus ? 'text-green-600' : 'text-red-600'}`}>
            {networkStatus ? '온라인' : '오프라인'}
          </span>
        </div>
      )}

      {/* 재연결 버튼 */}
      {(!networkStatus || firebaseStatus === false) && (
        <Button
          variant="ghost"
          size={classes.button as 'sm' | 'md'}
          onClick={checkFirebaseConnectionStatus}
          disabled={isCheckingConnection}
          className="p-1"
        >
          <Icon 
            name={isCheckingConnection ? 'Loader2' : 'RefreshCw'} 
            size={classes.icon} 
            className={isCheckingConnection ? 'animate-spin' : ''} 
          />
        </Button>
      )}
    </div>
  );
};

export default SyncStatus; 