import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/'
}) => {
  const { state } = useAuthContext();
  const { user, isLoading, isInitialized } = state;
  const location = useLocation();

  // 초기화 중일 때 로딩 표시
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한 경우
  if (requireAuth) {
    if (!user) {
      // 로그인 페이지로 리다이렉트하면서 현재 위치 저장
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // 인증이 필요하지 않은 경우 (로그인 페이지 등)
  if (!requireAuth) {
    if (user) {
      // 이미 로그인된 경우 홈으로 리다이렉트
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 