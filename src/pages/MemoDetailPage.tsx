import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Icon, BottomTabBar } from '../components/ui';
import type { IconName } from '../components/ui/Icon';
import { getMemo, deleteMemo } from '../services';
import type { Memo } from '../types/memo';
import MemoForm from '../components/memo/MemoForm';
import MemoDetail from '../components/memo/MemoDetail';

const MemoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [activeTab, setActiveTab] = useState('memos');

  // 탭 설정 (HomePage와 동일)
  const tabs = [
    {
      id: 'memos',
      label: '메모 목록',
      icon: 'FileText' as IconName,
      isActive: activeTab === 'memos'
    },
    {
      id: 'new-memo',
      label: '새 메모',
      icon: 'Plus' as IconName,
      isActive: activeTab === 'new-memo'
    }
  ];

  // 메모 로드
  const loadMemo = useCallback(() => {
    if (!id) return;

    try {
      setIsLoading(true);
      const memoData = getMemo(id);
      if (memoData) {
        setMemo(memoData);
      } else {
        // 메모가 없는 경우
        setIsDeleted(true);
      }
    } catch (error) {
      console.error('메모 로드 실패:', error);
      setIsDeleted(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 메모 수정
  const handleEditMemo = () => {
    setIsFormOpen(true);
  };

  // 메모 삭제
  const handleDeleteMemo = () => {
    if (!memo) return;

    try {
      if (deleteMemo(memo.id)) {
        setIsDeleted(true);
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
    }
  };

  // 클립보드 복사 기능
  const handleCopyMemo = async () => {
    if (!memo) return;

    try {
      await navigator.clipboard.writeText(memo.content);
      // 복사 성공 알림 (선택사항)
      console.log('메모가 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      // 폴백: 구형 브라우저 지원
      const textArea = document.createElement('textarea');
      textArea.value = memo.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // 폼 제출 완료
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    loadMemo(); // 메모 새로고침
  };

  // 탭 변경 처리 (HomePage와 동일)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'memos') {
      navigate('/');
    } else if (tabId === 'new-memo') {
      navigate('/write');
    }
  };

  // 컴포넌트 마운트 시 메모 로드
  useEffect(() => {
    loadMemo();
  }, [id, loadMemo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-start mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-dark-text-muted">메모를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isDeleted || !memo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center">
            <Icon name="FileText" size={64} className="mx-auto text-gray-400 dark:text-dark-text-muted mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-4">메모를 찾을 수 없습니다</h1>
            <p className="text-gray-600 dark:text-dark-text-muted mb-8">
              요청하신 메모가 삭제되었거나 존재하지 않습니다.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/')} variant="primary">
                메모 목록으로
              </Button>
              <Button onClick={() => navigate('/write')} variant="outline">
                새 메모 작성
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary pb-20 overflow-x-hidden">
      <div className="w-full h-full sm:max-w-4xl sm:mx-auto sm:px-6 sm:py-8 overflow-x-hidden">
        {/* 헤더 */}
                 <div className="sticky top-0 z-10 bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary backdrop-blur-sm border-b border-gray-200 dark:border-dark-border sm:border-none sm:bg-transparent sm:backdrop-blur-none">
           <div className="flex items-center justify-between p-4 sm:p-0">
             <div className="flex items-center">
               <Button
                 onClick={() => navigate('/')}
                 variant="ghost"
                 className="mr-3 sm:hidden"
               >
                 <Icon name="ChevronLeft" size={14} />
               </Button>
             </div>
                           <div className="flex-1 text-center">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">메모 상세</h1>
              </div>
             <div className="flex items-center space-x-1">
               <Button
                 onClick={handleCopyMemo}
                 variant="ghost"
                 size="sm"
                 className="p-1.5 sm:p-1"
               >
                 <Icon name="Copy" size={14} />
               </Button>
               <Button
                 onClick={handleEditMemo}
                 variant="ghost"
                 size="sm"
                 className="p-1.5 sm:p-1"
               >
                 <Icon name="Edit" size={14} />
               </Button>
               <Button
                 onClick={handleDeleteMemo}
                 variant="ghost"
                 size="sm"
                 className="p-1.5 sm:p-1 text-red-500 hover:text-red-700"
               >
                 <Icon name="Trash2" size={14} />
               </Button>
             </div>
           </div>
         </div>

                 {/* 메모 상세 내용 */}
         <div className="px-4 sm:px-0 overflow-x-hidden">
           <div className="max-w-4xl mx-auto overflow-x-hidden">
             <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm border border-gray-200 dark:border-dark-border p-4 sm:p-6 overflow-x-hidden">
               <MemoDetail
                 memo={memo}
                 onEdit={handleEditMemo}
                 onDelete={handleDeleteMemo}
               />
               {/* 닫기 버튼 - 메모 내용 하단에 배치 */}
               <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                 <Button
                   onClick={() => navigate('/')}
                   variant="outline"
                   size="sm"
                   className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                 >
                   닫기
                 </Button>
               </div>
             </div>
           </div>


        </div>

        {/* 메모 수정 폼 모달 */}
        {isFormOpen && (
          <MemoForm
            memo={memo}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
          />
        )}
      </div>

      {/* 하단 고정 탭 (HomePage와 동일) */}
      <BottomTabBar
        tabs={tabs}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default MemoDetailPage; 