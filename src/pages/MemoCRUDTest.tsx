import React, { useState } from 'react';
import { MemoList, MemoDetail } from '../components/memo';
import { Card, Button, Icon } from '../components/ui';
import type { Memo } from '../types/memo';

const MemoCRUDTest: React.FC = () => {
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const handleMemoEdit = (memo: Memo) => {
    console.log('메모 수정:', memo);
    // 실제로는 수정 폼을 열거나 수정 페이지로 이동
  };

  const handleMemoDelete = (memoId: string) => {
    console.log('메모 삭제:', memoId);
    if (selectedMemo?.id === memoId) {
      setSelectedMemo(null);
      setViewMode('list');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMemo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            메모 CRUD 컴포넌트 테스트
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
            >
              <Icon name="Home" size={16} />
              목록
            </Button>
            <Button
              onClick={() => setViewMode('detail')}
              variant={viewMode === 'detail' ? 'primary' : 'outline'}
              size="sm"
              disabled={!selectedMemo}
            >
              <Icon name="FileText" size={16} />
              상세
            </Button>
          </div>
        </div>

        {/* 테스트 정보 */}
        <Card className="mb-8">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">테스트 가이드</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">메모 목록 기능</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 메모 검색 (실시간)</li>
                  <li>• 새 메모 작성</li>
                  <li>• 메모 수정/삭제</li>
                  <li>• 최신순 정렬</li>
                  <li>• 미리보기 (100자 제한)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">메모 상세 기능</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 전체 내용 표시</li>
                  <li>• 이미지 첨부 표시</li>
                  <li>• 수정/삭제 액션</li>
                  <li>• 날짜/시간 정보</li>
                  <li>• 삭제 확인 모달</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메모 목록 */}
          <div className={`${viewMode === 'detail' ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
            <Card title="메모 목록" className="h-full">
              <MemoList
                onMemoEdit={handleMemoEdit}
                onMemoDelete={handleMemoDelete}
              />
            </Card>
          </div>

          {/* 메모 상세 */}
          {viewMode === 'detail' && selectedMemo && (
            <div className="lg:col-span-2">
              <Card title="메모 상세" className="h-full">
                <MemoDetail
                  memo={selectedMemo}
                  onEdit={() => handleMemoEdit(selectedMemo)}
                  onDelete={() => handleMemoDelete(selectedMemo.id)}
                  onBack={handleBackToList}
                />
              </Card>
            </div>
          )}
        </div>

        {/* 현재 상태 표시 */}
        <Card className="mt-8">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">현재 상태</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">뷰 모드:</span>
                <span className="ml-2 text-gray-600">
                  {viewMode === 'list' ? '목록' : '상세'}
                </span>
              </div>
              <div>
                <span className="font-medium">선택된 메모:</span>
                <span className="ml-2 text-gray-600">
                  {selectedMemo ? selectedMemo.title : '없음'}
                </span>
              </div>
              <div>
                <span className="font-medium">메모 ID:</span>
                <span className="ml-2 text-gray-600">
                  {selectedMemo ? selectedMemo.id.substring(0, 8) : '없음'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemoCRUDTest; 