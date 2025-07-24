import React, { memo, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Icon, Modal } from '../ui';
import type { Memo } from '../../types/memo';

interface MemoItemProps {
  memo: Memo;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const MemoItem: React.FC<MemoItemProps> = memo(({
  memo,
  onEdit,
  onDelete,
  className = ''
}) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);

  // 제목 표시 (제목이 없으면 내용의 첫 줄 사용)
  const getDisplayTitle = (memo: Memo) => {
    if (memo.title) {
      return memo.title;
    }
    
    // 내용의 첫 줄을 제목으로 사용
    const firstLine = memo.content.split('\n')[0].trim();
    if (firstLine.length <= 50) {
      return firstLine;
    }
    return firstLine.substring(0, 50) + '...';
  };

  // 더보기 표시 여부 결정
  const shouldShowMoreButton = useMemo(() => {
    const contentLength = memo.content.length;
    const imageCount = memo.images.length;
    
    // 텍스트가 길거나 이미지가 있으면 더보기 표시
    return contentLength > 200 || imageCount > 2;
  }, [memo.content.length, memo.images.length]);

  // 텍스트 자르기 함수
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 더보기/접기 토글
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (shouldShowMoreButton) {
      // 더보기 버튼 클릭 시 상세 페이지로 이동
      navigate(`/memo/${memo.id}`);
    } else {
      setExpandedContent(!expandedContent);
    }
  }, [shouldShowMoreButton, expandedContent, navigate, memo.id]);

  // 메모이제이션된 값들
  const formattedDate = useMemo(() => {
    const now = new Date();
    const memoDate = new Date(memo.updatedAt);
    const diffTime = Math.abs(now.getTime() - memoDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return memoDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }, [memo.updatedAt]);

  const displayTitle = useMemo(() => {
    return getDisplayTitle(memo);
  }, [memo]);

  // 메모이제이션된 이벤트 핸들러들
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  }, [onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    onDelete?.();
  }, [onDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleCardClick = useCallback(() => {
    // 카드 클릭 시 상세 페이지로 이동
    navigate(`/memo/${memo.id}`);
  }, [navigate, memo.id]);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
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
  }, [memo.content]);

  return (
    <>
      <Card 
        className={`memo-item hover:shadow-md transition-shadow duration-200 group h-full flex flex-col min-h-[280px] sm:min-h-[260px] cursor-pointer ${className}`}
        padding="none"
        onClick={handleCardClick}
      >
        <div className="p-5 sm:p-6 flex-1 flex flex-col">
          {/* 액션 버튼들 - 제목 위에 배치 */}
          <div className="flex items-center justify-end space-x-1 mb-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="p-1.5 sm:p-1"
            >
              <Icon name="Copy" size={14} className="sm:w-3.5 sm:h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="p-1.5 sm:p-1"
            >
              <Icon name="Edit" size={14} className="sm:w-3.5 sm:h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="p-1.5 sm:p-1 text-red-600 hover:text-red-700"
            >
              <Icon name="Trash2" size={14} className="sm:w-3.5 sm:h-3.5" />
            </Button>
          </div>

          {/* 헤더 */}
          <div className="mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-base font-semibold text-gray-900 dark:text-dark-text line-clamp-2 leading-tight text-left flex-1">
                  {displayTitle}
                </h3>
                {/* 카테고리 뱃지 */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  memo.category === '임시' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : memo.category === '기억'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {memo.category}
                </span>
              </div>
              <div className="flex items-center text-sm sm:text-xs text-gray-500 dark:text-dark-text-muted">
                <span>내 메모</span>
                <span className="mx-2">•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* 내용 미리보기 */}
          <div className="mb-3 flex-1">
            <div className="text-gray-700 dark:text-dark-text text-base sm:text-sm leading-relaxed whitespace-pre-wrap text-left">
              {expandedContent 
                ? memo.content
                : truncateText(memo.content, window.innerWidth < 640 ? 150 : 250)
              }
              {shouldShowMoreButton && (
                <button
                  onClick={handleToggleExpand}
                  className="text-blue-600 dark:text-primary-start hover:text-blue-800 dark:hover:text-primary-end font-medium ml-1 text-xs"
                >
                  {expandedContent ? '접기' : '더보기'}
                </button>
              )}
            </div>
          </div>

          {/* 이미지 미리보기 (있는 경우) */}
          {memo.images.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Image" size={12} className="text-gray-400 dark:text-dark-text-muted" />
                <span className="text-xs text-gray-500 dark:text-dark-text-muted">{memo.images.length}개 이미지</span>
              </div>
              <div className="flex space-x-2">
                {memo.images.slice(0, 2).map((image, index) => (
                  <div
                    key={image.id || index}
                    className="w-12 h-12 bg-gray-200 dark:bg-dark-bg-secondary rounded overflow-hidden flex-shrink-0 border border-gray-200 dark:border-dark-border"
                  >
                    <img
                      src={image.thumbnail || image.data}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 아이콘 표시
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ))}
                {memo.images.length > 2 && (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg-secondary rounded flex items-center justify-center border border-gray-200 dark:border-dark-border">
                    <span className="text-xs text-gray-500 dark:text-dark-text-muted">+{memo.images.length - 2}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 하단 메타데이터 */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-muted">
              <span>ID: {memo.id.substring(0, 8)}</span>
              <span>{memo.content.length}자</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="메모 삭제"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 dark:text-dark-text mb-6">
            이 메모를 삭제하시겠습니까?<br />
            삭제된 메모는 복구할 수 없습니다.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default MemoItem; 