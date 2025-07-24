import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Icon } from '../ui';
import { getMemos, deleteMemo, searchMemos } from '../../services';
import type { Memo } from '../../types/memo';
import MemoItem from './MemoItem';
import MemoForm from './MemoForm';

interface MemoListProps {
  onMemoEdit?: (memo: Memo) => void;
  onMemoDelete?: (memoId: string) => void;
  className?: string;
}

const MemoList: React.FC<MemoListProps> = ({
  onMemoEdit,
  onMemoDelete,
  className = ''
}) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 메모 목록 로드
  const loadMemos = () => {
    try {
      setIsLoading(true);
      const memoList = getMemos();
      setMemos(memoList);
      setFilteredMemos(memoList);
    } catch (error) {
      console.error('메모 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    
    if (!keyword.trim()) {
      setFilteredMemos(memos);
      return;
    }

    try {
      const searchResults = searchMemos({ keyword });
      setFilteredMemos(searchResults.memos);
    } catch (error) {
      console.error('메모 검색 실패:', error);
      setFilteredMemos([]);
    }
  };

  // 메모 생성
  const handleCreateMemo = () => {
    setEditingMemo(null);
    setIsFormOpen(true);
  };

  // 메모 수정
  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setIsFormOpen(true);
    onMemoEdit?.(memo);
  };

  // 메모 삭제 (확인 없이 바로 삭제)
  const handleDeleteMemo = (memoId: string) => {
    try {
      if (deleteMemo(memoId)) {
        loadMemos(); // 목록 새로고침
        onMemoDelete?.(memoId);
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
    }
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMemo(null);
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
  }, [memos, searchKeyword]);

  return (
    <div className={`memo-list w-full ${className}`}>
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="메모 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            icon="Search"
            className="w-full"
          />
        </div>
        <Button onClick={handleCreateMemo} variant="primary">
          <Icon name="Plus" size={16} />
          새 메모
        </Button>
      </div>

      {/* 메모 목록 */}
      <div className="w-full">
        {isLoading ? (
                      <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-dark-text-muted">메모를 불러오는 중...</p>
            </div>
        ) : filteredMemos.length === 0 ? (
          <Card className="text-center py-12">
            {searchKeyword ? (
              <>
                <Icon name="Search" size={48} className="mx-auto text-gray-400 dark:text-dark-text-muted mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600 dark:text-dark-text-muted mb-4">"{searchKeyword}"에 대한 메모를 찾을 수 없습니다.</p>
                <Button onClick={() => setSearchKeyword('')} variant="outline">
                  검색 초기화
                </Button>
              </>
            ) : (
              <>
                <Icon name="FileText" size={48} className="mx-auto text-gray-400 dark:text-dark-text-muted mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">메모가 없습니다</h3>
                <p className="text-gray-600 dark:text-dark-text-muted mb-4">첫 번째 메모를 작성해보세요!</p>
                <Button onClick={handleCreateMemo} variant="primary">
                  <Icon name="Plus" size={16} />
                  메모 작성하기
                </Button>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
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

      {/* 메모 작성/수정 폼 모달 */}
      {isFormOpen && (
        <MemoForm
          memo={editingMemo}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default MemoList; 