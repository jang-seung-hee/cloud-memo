import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, Button, Icon } from '../ui';
import type { Memo } from '../../types/memo';

interface VirtualizedMemoListProps {
  memos: Memo[];
  itemHeight?: number;
  containerHeight?: number;
  onSelect?: (memo: Memo) => void;
  onEdit?: (memo: Memo) => void;
  onDelete?: (memoId: string) => void;
  className?: string;
}

const VirtualizedMemoList: React.FC<VirtualizedMemoListProps> = ({
  memos,
  itemHeight = 120,
  containerHeight = 600,
  onSelect,
  onEdit,
  onDelete,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 가상화 계산
  const virtualizedData = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      memos.length
    );
    
    const visibleItems = memos.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return {
      startIndex,
      endIndex,
      visibleItems,
      offsetY,
      totalHeight: memos.length * itemHeight
    };
  }, [memos, scrollTop, itemHeight, containerHeight]);

  // 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 스크롤 위치 동기화
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      setScrollTop(container.scrollTop);
    }
  }, []);

  // 간단한 메모 아이템 컴포넌트 (성능 최적화)
  const MemoItem = React.memo<{
    memo: Memo;
    onSelect?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
  }>(({ memo, onSelect, onEdit, onDelete, className = '' }) => {
    const formatDate = useMemo(() => {
      const now = new Date();
      const memoDate = new Date(memo.updatedAt);
      const diffTime = Math.abs(now.getTime() - memoDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return '오늘';
      if (diffDays === 2) return '어제';
      if (diffDays <= 7) return `${diffDays - 1}일 전`;
      
      return memoDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }, [memo.updatedAt]);

    const preview = useMemo(() => {
      const maxLength = 80;
      return memo.content.length <= maxLength 
        ? memo.content 
        : memo.content.substring(0, maxLength) + '...';
    }, [memo.content]);

    const handleEdit = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.();
    }, [onEdit]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.();
    }, [onDelete]);

    return (
      <Card 
        className={`memo-item cursor-pointer hover:shadow-md transition-shadow duration-200 ${className}`}
        onClick={onSelect}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {memo.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <span>{formatDate}</span>
                {memo.images.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <Icon name="Image" size={12} />
                    <span className="ml-1">{memo.images.length}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <Icon name="Edit" size={12} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-1"
              >
                <Icon name="Trash2" size={12} />
              </Button>
            </div>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed flex-1">
            {preview}
          </p>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ID: {memo.id.substring(0, 6)}</span>
              <span>{memo.content.length}자</span>
            </div>
          </div>
        </div>
      </Card>
    );
  });

  // 메모 아이템 렌더링
  const renderMemoItem = useCallback((memo: Memo, index: number) => {
    const actualIndex = virtualizedData.startIndex + index;
    
    return (
      <div
        key={memo.id}
        style={{
          position: 'absolute',
          top: (actualIndex * itemHeight) - virtualizedData.offsetY,
          height: itemHeight,
          width: '100%'
        }}
      >
        <MemoItem
          memo={memo}
          onSelect={() => onSelect?.(memo)}
          onEdit={() => onEdit?.(memo)}
          onDelete={() => onDelete?.(memo.id)}
          className="h-full"
        />
      </div>
    );
  }, [virtualizedData.startIndex, virtualizedData.offsetY, itemHeight, onSelect, onEdit, onDelete, MemoItem]);



  if (memos.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <div className="text-center">
          <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">메모가 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-memo-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: virtualizedData.totalHeight, position: 'relative' }}>
        {virtualizedData.visibleItems.map((memo, index) => 
          renderMemoItem(memo, index)
        )}
      </div>
    </div>
  );
};

export default VirtualizedMemoList; 