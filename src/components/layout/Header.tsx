import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Icon, BottomTabBar } from '../ui';
import type { IconName } from '../ui/Icon';
import LoginButton from '../ui/LoginButton';
import UserProfile from '../ui/UserProfile';
import SyncStatus from '../ui/SyncStatus';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 메뉴 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 메뉴 닫기
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 탭 설정
  const tabs = [
    {
      id: 'memos',
      label: '메모 목록',
      icon: 'FileText' as IconName,
      isActive: location.pathname === '/' || location.pathname === '/write'
    },
    {
      id: 'new-memo',
      label: '새 메모',
      icon: 'Plus' as IconName,
      isActive: false
    }
  ];

  // 탭 변경 처리
  const handleTabChange = (tabId: string) => {
    if (tabId === 'memos') {
      navigate('/');
    } else if (tabId === 'new-memo') {
      navigate('/write');
    }
  };

  return (
    <>
      <header className={`bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-start to-primary-end rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-dark-text">Cloud Memo</span>
              </Link>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* 네비게이션 링크 제거됨 */}
            </nav>

            {/* 액션 버튼들 */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 로그인 상태 표시 */}
              <UserProfile size="sm" showEmail={false} />
              {/* 로그아웃 및 상용구 관리 버튼을 나란히 배치 */}
              <div className="flex items-center space-x-2">
                <LoginButton variant="outline" size="sm" />
                <Button
                  onClick={() => navigate('/templates')}
                  variant="outline"
                  size="sm"
                  className="flex items-center bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Icon name="Copy" size={16} />
                  <span className="ml-2">상용구관리</span>
                </Button>
              </div>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <Button
                onClick={toggleMenu}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Icon name={isMenuOpen ? "X" : "Settings"} size={20} />
              </Button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                {/* 로그인 상태 표시 */}
                <div className="px-3 py-2">
                  <UserProfile size="md" />
                </div>
                {/* 상용구 관리 및 로그아웃 버튼을 한 행에 배치 */}
                <div className="px-3 py-2 flex space-x-2">
                  <Button
                    onClick={() => {
                      navigate('/templates');
                      closeMenu();
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Icon name="Copy" size={16} />
                    <span className="ml-2">상용구관리</span>
                  </Button>
                  <LoginButton variant="outline" size="sm" className="flex-1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 하단 고정 탭 - 모든 화면에서 표시 */}
      <BottomTabBar
        tabs={tabs}
        onTabChange={handleTabChange}
      />
    </>
  );
};

export default Header; 