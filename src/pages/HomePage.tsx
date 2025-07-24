import React, { useState, useEffect, useCallback } from 'react';
import { Button, Icon } from '../components/ui';
import { getMemos, deleteMemo, searchMemos } from '../services';
import type { Memo } from '../types/memo';
import MemoItem from '../components/memo/MemoItem';
import MemoForm from '../components/memo/MemoForm';
import SyncStatus from '../components/ui/SyncStatus';
import { useAuthContext } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { state: authState } = useAuthContext();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 메모 목록 로드
  const loadMemos = () => {
    try {
      setIsLoading(true);
      const memoList = getMemos();
      console.log('로드된 메모 목록:', memoList);
      console.log('메모 개수:', memoList.length);
      setMemos(memoList);
      setFilteredMemos(memoList);
    } catch (error) {
      console.error('메모 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 처리
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    
    if (keyword.trim()) {
      try {
        const searchResults = searchMemos({ keyword });
        setFilteredMemos(searchResults.memos);
      } catch (error) {
        console.error('검색 실패:', error);
        setFilteredMemos([]);
      }
    } else {
      setFilteredMemos(memos);
    }
  }, [memos]);

  // 새 메모 생성
  const handleCreateMemo = () => {
    setSelectedMemo(null);
    setIsFormOpen(true);
  };

  // 메모 수정
  const handleEditMemo = (memo: Memo) => {
    setSelectedMemo(memo);
    setIsFormOpen(true);
  };

  // 메모 삭제
  const handleDeleteMemo = (memoId: string) => {
    try {
      if (deleteMemo(memoId)) {
        loadMemos(); // 목록 새로고침
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
    }
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMemo(null);
  };

  // 폼 제출 완료
  const handleFormSubmit = () => {
    handleFormClose();
    loadMemos(); // 목록 새로고침
  };

  // 컴포넌트 마운트 시 메모 목록 로드
  useEffect(() => {
    loadMemos();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    handleSearch(searchKeyword);
  }, [memos, searchKeyword, handleSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary pb-20">
      {/* 전체 컨텐츠를 왼쪽 정렬 */}
      <div className="max-w-8xl px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-4 sm:py-6">
        {/* 동기화 상태 표시 */}
        {authState.user && (
          <div className="mb-4 text-left">
            <SyncStatus size="sm" showProgress={true} />
          </div>
        )}

        {/* 액션 버튼들과 검색 */}
        <div className="mb-6 text-left">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* 새 메모 버튼 */}
            <Button onClick={handleCreateMemo} variant="primary" className="flex items-center w-full sm:w-auto">
              <Icon name="Plus" size={16} />
              <span className="ml-2">새 메모</span>
            </Button>

            {/* 새로운 검색창 */}
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Search" size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="메모 검색..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 메모 목록 */}
        <div className="w-full text-left">
          {isLoading ? (
            <div className="text-left py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-start"></div>
              <p className="mt-4 text-gray-600">메모를 불러오는 중...</p>
            </div>
          ) : filteredMemos.length === 0 ? (
            <div className="text-left py-12">
              {searchKeyword ? (
                <>
                  <Icon name="Search" size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-gray-600 mb-4">
                    "{searchKeyword}"에 대한 메모를 찾을 수 없습니다.
                  </p>
                  <Button 
                    onClick={() => setSearchKeyword('')} 
                    variant="outline"
                  >
                    검색 초기화
                  </Button>
                </>
              ) : (
                <>
                  <Icon name="FileText" size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">메모가 없습니다</h3>
                  <p className="text-gray-600 mb-4">첫 번째 메모를 작성해보세요!</p>
                  <Button onClick={handleCreateMemo} variant="primary">
                    <Icon name="Plus" size={16} />
                    메모 작성하기
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMemos.map((memo) => (
                <MemoItem
                  key={memo.id}
                  memo={memo}
                  onEdit={() => handleEditMemo(memo)}
                  onDelete={() => handleDeleteMemo(memo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 메모 작성/수정 폼 모달 */}
      {isFormOpen && (
        <MemoForm
          memo={selectedMemo}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default HomePage; 