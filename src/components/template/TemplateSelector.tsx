import React, { useState, useEffect, useCallback } from 'react';
import { Button, Icon, Modal } from '../ui';
import { getTemplates, searchTemplates } from '../../services';
import type { Template } from '../../types/template';

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template) => void;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

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

  // 검색 및 필터링
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    
    let filtered = templates;

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 키워드 검색
    if (keyword.trim()) {
      try {
        const searchResults = searchTemplates({ keyword });
        filtered = filtered.filter(template => 
          searchResults.some((result: Template) => result.id === template.id)
        );
      } catch (error) {
        console.error('상용구 검색 실패:', error);
        filtered = [];
      }
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory]);

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    handleSearch(searchKeyword);
  };

  // 상용구 선택
  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    setIsOpen(false);
    setSearchKeyword('');
    setSelectedCategory('all');
  };

  // 모달 열기
  const handleOpen = () => {
    setIsOpen(true);
    loadTemplates();
  };

  // 모달 닫기
  const handleClose = () => {
    setIsOpen(false);
    setSearchKeyword('');
    setSelectedCategory('all');
  };

  // 컴포넌트 마운트 시 상용구 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // 검색어 또는 카테고리 변경 시 필터링
  useEffect(() => {
    if (isOpen) {
      handleSearch(searchKeyword);
    }
  }, [templates, searchKeyword, selectedCategory, isOpen, handleSearch]);

  // 카테고리 목록 추출 - 새로운 카테고리 시스템 적용
  const categories = ['all', '임시', '기억', '보관'];

  return (
    <div className={`template-selector ${className}`}>
      {/* 상용구 선택 버튼 */}
      <Button
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="flex items-center"
      >
        <Icon name="FileText" size={16} />
        <span className="ml-2">상용구</span>
      </Button>

      {/* 상용구 선택 모달 */}
      <Modal
        isOpen={isOpen}
        title="상용구 선택"
        onClose={handleClose}
        size="lg"
      >
        <div className="space-y-4">
          {/* 검색 */}
          <div>
            <input
              type="text"
              placeholder="상용구 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start"
            />
          </div>

                     {/* 카테고리 필터 */}
           <div>
             <div className="flex flex-wrap gap-2">
               {categories.map((category) => {
                 const getCategoryStyle = (cat: string) => {
                   if (cat === 'all') {
                     return selectedCategory === cat
                       ? 'bg-gray-600 text-white shadow-md'
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-bg-secondary dark:text-dark-text dark:hover:bg-dark-border';
                   }
                   if (cat === '임시') {
                     return selectedCategory === cat
                       ? 'bg-yellow-500 text-white shadow-md'
                       : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200';
                   }
                   if (cat === '기억') {
                     return selectedCategory === cat
                       ? 'bg-blue-500 text-white shadow-md'
                       : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200';
                   }
                   if (cat === '보관') {
                     return selectedCategory === cat
                       ? 'bg-red-500 text-white shadow-md'
                       : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200';
                   }
                   return selectedCategory === cat
                     ? 'bg-primary-start text-white shadow-md'
                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-bg-secondary dark:text-dark-text dark:hover:bg-dark-border';
                 };

                 return (
                   <button
                     key={category}
                     type="button"
                     onClick={() => handleCategoryChange(category)}
                     className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${getCategoryStyle(category)}`}
                   >
                     {category === 'all' ? '전체' : category}
                   </button>
                 );
               })}
             </div>
           </div>

          {/* 상용구 목록 */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start mx-auto"></div>
                <p className="mt-2 text-gray-600">상용구를 불러오는 중...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">상용구가 없습니다</h3>
                <p className="text-gray-600">등록된 상용구가 없습니다.</p>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {template.title}
                        </h4>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {template.content.length > 80 
                          ? template.content.substring(0, 80) + '...' 
                          : template.content
                        }
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        {template.content.length}자
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-gray-400 ml-2" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 도움말 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start">
              <Icon name="Info" size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">상용구 사용법</p>
                <ul className="space-y-1 text-xs">
                  <li>• 상용구를 클릭하면 메모에 자동으로 삽입됩니다</li>
                  <li>• 카테고리별로 필터링할 수 있습니다</li>
                  <li>• 검색으로 원하는 상용구를 빠르게 찾을 수 있습니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleClose} variant="outline">
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TemplateSelector; 