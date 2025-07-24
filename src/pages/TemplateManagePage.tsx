import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../components/ui';
import { TemplateList } from '../components/template';
import SyncStatus from '../components/ui/SyncStatus';
import { useAuthContext } from '../contexts/AuthContext';

const TemplateManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuthContext();

  const handleTemplateSelect = (template: any) => {
    console.log('상용구 선택:', template);
  };

  const handleTemplateEdit = (template: any) => {
    console.log('상용구 수정:', template);
  };

  const handleTemplateDelete = (templateId: string) => {
    console.log('상용구 삭제:', templateId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary overflow-x-hidden pb-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* 동기화 상태 표시 */}
        {authState.user && (
          <div className="mb-4">
            <SyncStatus size="sm" showProgress={true} />
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">상용구 관리</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-dark-text-muted">
                자주 사용하는 문구를 등록하고 관리하세요
              </p>
            </div>
          </div>
        </div>

        {/* 상용구 관리 - 모바일 최적화 */}
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden shadow-medium">
          <TemplateList
            onTemplateSelect={handleTemplateSelect}
            onTemplateEdit={handleTemplateEdit}
            onTemplateDelete={handleTemplateDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateManagePage; 