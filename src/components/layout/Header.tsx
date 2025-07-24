import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Icon, BottomTabBar } from '../ui';
import type { IconName } from '../ui/Icon';
import LoginButton from '../ui/LoginButton';
import UserProfile from '../ui/UserProfile';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 메뉴 ?��?
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 메뉴 ?�기
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ???�정
  const tabs = [
    {
      id: 'memos',
      label: '메모 목록',
      icon: 'FileText' as IconName,
      isActive: location.pathname === '/' || location.pathname === '/write'
    },
    {
      id: 'new-memo',
      label: '??메모',
      icon: 'Plus' as IconName,
      isActive: false
    }
  ];

  // ??변�?처리
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

            {/* ?�스?�톱 ?�비게이??*/}
            <nav className="hidden md:flex items-center space-x-8">
              {/* ?�비게이??링크 ?�거??*/}
            </nav>

            {/* ?�션 버튼??*/}
            <div className="hidden md:flex items-center space-x-4">
              {/* 로그???�태 ?�시 */}
              <UserProfile size="sm" showEmail={false} />
              {/* 로그?�웃 �??�용�?관�?버튼???��???배치 */}
              <div className="flex items-center space-x-2">
                <LoginButton variant="outline" size="sm" />
                <Button
                  onClick={() => navigate('/templates')}
                  variant="outline"
                  size="sm"
                  className="flex items-center bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Icon name="Copy" size={16} />
                  <span className="ml-2">?�용구�?�?/span>
                </Button>
              </div>
            </div>

            {/* 모바??메뉴 버튼 */}
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

          {/* 모바??메뉴 */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                {/* 로그???�태 ?�시 */}
                <div className="px-3 py-2">
                  <UserProfile size="md" />
                </div>
                {/* ?�용�?관�?�?로그?�웃 버튼?????�에 배치 */}
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
                    <span className="ml-2">?�용구�?�?/span>
                  </Button>
                  <LoginButton variant="outline" size="sm" className="flex-1" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ?�단 고정 ??- 모든 ?�면?�서 ?�시 */}
      <BottomTabBar
        tabs={tabs}
        onTabChange={handleTabChange}
      />
    </>
  );
};

export default Header; 



