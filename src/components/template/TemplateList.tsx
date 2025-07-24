import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Icon, Modal } from '../ui';
import { getTemplates, deleteTemplate } from '../../services';
import type { Template } from '../../types/template';
import TemplateForm from './TemplateForm';

interface TemplateListProps {
  onTemplateSelect?: (template: Template) => void;
  onTemplateEdit?: (template: Template) => void;
  onTemplateDelete?: (templateId: string) => void;
  className?: string;
}

const TemplateList: React.FC<TemplateListProps> = ({
  onTemplateSelect,
  onTemplateEdit,
  onTemplateDelete,
  className = ''
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState<Template | null>(null);

  // 상용구 목록 로드
  const loadTemplates = () => {
    try {
      setIsLoading(true);
      const templateList = getTemplates();
      setTemplates(templateList);
      setFilteredTemplates(templateList);
    } catch (error) {
      console.error('상용구 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    
    if (!keyword.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    // 키워드 검색 (제목과 내용에서만 검색)
    const lowerKeyword = keyword.toLowerCase();
    const filtered = templates.filter(template => 
      template.title.toLowerCase().includes(lowerKeyword) ||
      template.content.toLowerCase().includes(lowerKeyword)
    );

    setFilteredTemplates(filtered);
  }, [templates]);

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchKeyword('');
    setFilteredTemplates(templates);
  };

  // 상용구 생성
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  // 상용구 수정
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
    onTemplateEdit?.(template);
  };

  // 상용구 삭제 확인 모달 열기
  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    setDeleteConfirmTemplate(template);
  };

  // 상용구 삭제 확인
  const handleConfirmDelete = () => {
    if (!deleteConfirmTemplate) return;

    try {
      if (deleteTemplate(deleteConfirmTemplate.id)) {
        loadTemplates(); // 목록 새로고침
        onTemplateDelete?.(deleteConfirmTemplate.id);
      }
    } catch (error) {
      console.error('상용구 삭제 실패:', error);
      alert('상용구 삭제에 실패했습니다.');
    } finally {
      setDeleteConfirmTemplate(null);
    }
  };

  // 상용구 삭제 취소
  const handleCancelDelete = () => {
    setDeleteConfirmTemplate(null);
  };

  // 상용구 선택
  const handleSelectTemplate = (template: Template) => {
    onTemplateSelect?.(template);
  };

  // 더보기/접기 토글
  const handleToggleExpand = (templateId: string) => {
    setExpandedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  // 폼 닫기
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  // 폼 제출 완료
  const handleFormSubmit = () => {
    handleFormClose();
    loadTemplates(); // 목록 새로고침
  };

  // 컴포넌트 마운트 시 상용구 목록 로드
  useEffect(() => {
    loadTemplates();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    handleSearch(searchKeyword);
  }, [templates, searchKeyword, handleSearch]);



  // 텍스트 자르기 함수
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`template-list p-2 sm:p-6 ${className}`}>
      {/* 검색 및 필터 섹션 */}
      <div className="mb-3 sm:mb-6 space-y-3 sm:space-y-4">
        {/* 검색 필드 */}
        <div className="relative">
          <Input
            placeholder="상용구 검색..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            icon="Search"
            className={`w-full transition-all duration-200 ${
              isSearchFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
          />
          {searchKeyword && (
            <button
              onClick={handleClearSearch}
              className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          )}
          
          {/* 검색 결과 요약 */}
          {searchKeyword && (
            <div className="mt-2 flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <span>
                {filteredTemplates.length}개의 상용구
                {searchKeyword && ` (검색어: "${searchKeyword}")`}
              </span>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                초기화
              </button>
            </div>
          )}
        </div>

        {/* 새 상용구 버튼 */}
        <div className="flex justify-start">
          <Button onClick={handleCreateTemplate} variant="primary" className="flex items-center">
            <Icon name="Plus" size={16} />
            <span className="ml-2">새 상용구</span>
          </Button>
        </div>
      </div>

      {/* 상용구 목록 */}
      <div className="space-y-2 sm:space-y-4">
        {isLoading ? (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-start mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600">상용구를 불러오는 중...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-8 text-center">
            {searchKeyword ? (
              <>
                <Icon name="Search" size={40} className="sm:hidden mx-auto text-gray-400 mb-3" />
                <Icon name="Search" size={48} className="hidden sm:block mx-auto text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {searchKeyword && `"${searchKeyword}"에 대한 `}
                  상용구를 찾을 수 없습니다.
                </p>
                <Button 
                  onClick={handleClearSearch} 
                  variant="outline"
                  className="flex items-center mx-auto"
                >
                  <Icon name="X" size={16} />
                  <span className="ml-2">검색 초기화</span>
                </Button>
              </>
            ) : (
              <>
                <Icon name="FileText" size={40} className="sm:hidden mx-auto text-gray-400 mb-3" />
                <Icon name="FileText" size={48} className="hidden sm:block mx-auto text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">상용구가 없습니다</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">첫 번째 상용구를 등록해보세요!</p>
                <Button onClick={handleCreateTemplate} variant="primary" className="flex items-center mx-auto">
                  <Icon name="Plus" size={16} />
                  <span className="ml-2">상용구 등록하기</span>
                </Button>
              </>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 hover:shadow-md transition-shadow group">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left">
                      {template.title}
                    </h3>
                  </div>
                  <div className="text-gray-700 text-sm leading-relaxed mb-2 text-left whitespace-pre-wrap">
                    {expandedTemplates.has(template.id) 
                      ? template.content
                      : truncateText(template.content, window.innerWidth < 640 ? 120 : 200)
                    }
                    {template.content.length > (window.innerWidth < 640 ? 120 : 200) && (
                      <button
                        onClick={() => handleToggleExpand(template.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium ml-1 text-xs"
                      >
                        {expandedTemplates.has(template.id) ? '접기' : '더보기'}
                      </button>
                    )}
                  </div>
                  
                </div>
                
                <div className="flex items-center justify-end sm:justify-start space-x-1 sm:ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSelectTemplate(template)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-1"
                  >
                    <Icon name="Copy" size={16} className="sm:w-3.5 sm:h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTemplate(template)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-1"
                  >
                    <Icon name="Edit" size={16} className="sm:w-3.5 sm:h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 p-2 sm:p-1"
                  >
                    <Icon name="Trash2" size={16} className="sm:w-3.5 sm:h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 상용구 등록/수정 폼 모달 */}
      {isFormOpen && (
        <TemplateForm
          template={editingTemplate}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!deleteConfirmTemplate}
        onClose={handleCancelDelete}
        title="상용구 삭제"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-700 dark:text-dark-text mb-6">
            상용구를 삭제하시겠습니까?<br />
            삭제된 상용구는 복구할 수 없습니다.
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
    </div>
  );
};

export default TemplateList; 