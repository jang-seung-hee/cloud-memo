import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import LoginButton from '../components/ui/LoginButton';
import { Icon } from '../components/ui';
import { QRCodeSVG } from 'qrcode.react';

const LoginPage: React.FC = () => {
  const { state } = useAuthContext();
  const { user, isLoading, error } = state;
  const location = useLocation();

  // 이미 로그인된 경우 원래 페이지로 리다이렉트
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-start to-primary-end rounded-2xl flex items-center justify-center mb-6">
            <Icon name="FileText" size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
            Cloud Memo
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            메모를 클라우드에 저장하고 동기화하세요
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text mb-2">
              로그인
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Google 계정으로 로그인하여 시작하세요
            </p>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">로그인 중...</p>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <div className="space-y-4">
            <LoginButton 
              variant="primary" 
              size="lg" 
              className="w-full"
            />
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                로그인하면 메모가 클라우드에 자동으로 동기화됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 기능 설명 */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
          <h4 className="font-semibold text-gray-900 dark:text-dark-text mb-4">
            주요 기능
          </h4>
          <div className="flex">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <Icon name="Cloud" size={16} className="text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  클라우드 동기화
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Smartphone" size={16} className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  모든 기기에서 접근
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="Shield" size={16} className="text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  안전한 데이터 보호
                </span>
              </div>
            </div>
                         <div className="ml-6 flex items-center">
               <div className="relative">
                 <QRCodeSVG 
                   value="https://cloud-memome.netlify.app/"
                   size={80}
                   level="M"
                   includeMargin={true}
                   className="rounded"
                 />
                 <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                   <Icon name="RefreshCw" size={12} className="text-white animate-spin" />
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 