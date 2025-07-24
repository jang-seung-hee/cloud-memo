import React from 'react';
import { Icon } from './index';
import type { IconName } from './Icon';

export interface TabItem {
  id: string;
  label: string;
  icon: IconName;
  isActive?: boolean;
}

export interface BottomTabBarProps {
  tabs: TabItem[];
  onTabChange: (tabId: string) => void;
  className?: string;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border shadow-lg dark:shadow-dark z-40 ${className}`}>
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors duration-200 ${
              tab.isActive
                ? 'text-primary-start bg-blue-50 dark:bg-dark-bg-secondary'
                : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg-secondary'
            }`}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              className={tab.isActive ? 'text-primary-start' : 'text-gray-500 dark:text-dark-text-muted'}
            />
            <span className={`text-xs mt-1 font-medium ${
              tab.isActive ? 'text-primary-start' : 'text-gray-500 dark:text-dark-text-muted'
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomTabBar; 