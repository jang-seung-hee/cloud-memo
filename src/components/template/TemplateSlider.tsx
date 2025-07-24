import React, { useState, useEffect, useRef } from 'react';
import { Button, Icon } from '../ui';
import { getTemplates } from '../../services';
import type { Template } from '../../types/template';

interface TemplateSliderProps {
  onTemplateSelect: (template: Template) => void;
  className?: string;
}

const TemplateSlider: React.FC<TemplateSliderProps> = ({
  onTemplateSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 상용구 목록 로드
  const loadTemplates = () => {
    try {
      setIsLoading(true);
      const templateList = getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('상용구 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 슬라이더 열기
  const handleOpen = () => {
    setIsOpen(true);
    loadTemplates();
  };

  // 슬라이더 닫기
  const handleClose = () => {
    setIsOpen(false);
  };

  // 상용구 선택
  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    handleClose();
  };

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // 컴포넌트 마운트 시 상용구 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // 카테고리별 상용구 필터링
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  // 카테고리 목록 추출 - 새로운 카테고리 시스템 적용
  const categories = ['all', '임시', '기억', '보관'];

  return (
    <div className={`template-slider ${className}`}>
      {/* 토글 버튼 */}
      <Button
        onClick={handleOpen}
        variant="outline"
        size="sm"
        className="flex items-center md:hidden"
      >
        <Icon name="FileText" size={16} />
        <span className="ml-2">상용구</span>
      </Button>

      {/* 슬라이더 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">상용구</h3>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

                         {/* 카테고리 필터 */}
             <div className="p-4 border-b">
               <div className="flex gap-2 overflow-x-auto pb-2">
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
                       className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-shrink-0 ${getCategoryStyle(category)}`}
                     >
                       {category === 'all' ? '전체' : category}
                     </button>
                   );
                 })}
               </div>
             </div>

            {/* 상용구 목록 */}
            <div 
              ref={sliderRef}
              className="max-h-96 overflow-y-auto p-4 space-y-3"
            >
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
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
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
                          {template.content.length > 60 
                            ? template.content.substring(0, 60) + '...' 
                            : template.content
                          }
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          {template.content.length}자
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-center text-sm text-gray-600">
                상용구를 탭하여 메모에 삽입하세요
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSlider; 