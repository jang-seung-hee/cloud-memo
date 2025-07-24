import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Icon } from '../components/ui';
import MemoForm from '../components/memo/MemoForm';
import type { Memo } from '../types/memo';
import SyncStatus from '../components/ui/SyncStatus';
import { useAuthContext } from '../contexts/AuthContext';

const MemoWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuthContext();
  const [isFormOpen, setIsFormOpen] = useState(true);

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
    navigate('/');
  };

  // 폼 제출 완료
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 동기화 상태 표시 */}
        {authState.user && (
          <div className="mb-4">
            <SyncStatus size="sm" showProgress={true} />
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">새 메모 작성</h1>
              <p className="mt-2 text-gray-600 dark:text-dark-text-muted">
                빠르고 간편하게 메모를 작성해보세요
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center"
            >
              <Icon name="ChevronLeft" size={16} />
              <span className="ml-2">목록으로</span>
            </Button>
          </div>
        </div>

        {/* 메모 작성 폼 */}
        <Card className="p-6">
          <MemoForm
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        </Card>

        {/* 도움말 */}
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-dark-text">메모 작성 팁</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-dark-text">빠른 작성</h4>
                <ul className="space-y-1 text-gray-600 dark:text-dark-text-muted">
                  <li>• Ctrl/Cmd + Enter: 저장</li>
                  <li>• Esc: 취소</li>
                  <li>• 상용구 버튼으로 자주 사용하는 문구 삽입</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-gray-900 dark:text-dark-text">이미지 첨부</h4>
                <ul className="space-y-1 text-gray-600 dark:text-dark-text-muted">
                  <li>• 갤러리에서 이미지 선택</li>
                  <li>• 카메라로 직접 촬영</li>
                  <li>• 드래그 앤 드롭 지원</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemoWritePage; 