import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorageArray } from './useLocalStorage';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, searchTemplates } from '../services';
import type { Template } from '../types/template';

interface UseTemplateOptions {
  autoLoad?: boolean;
  enableSearch?: boolean;
  enableCategories?: boolean;
}

interface UseTemplateReturn {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  selectedTemplate: Template | null;
  filteredTemplates: Template[];
  searchKeyword: string;
  selectedCategory: string;
  categories: string[];
  loadTemplates: () => Promise<void>;
  createTemplate: (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Template | null>;
  updateTemplate: (id: string, templateData: Partial<Template>) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  selectTemplate: (template: Template | null) => void;
  searchTemplates: (keyword: string) => Promise<void>;
  setCategory: (category: string) => void;
  clearSearch: () => void;
  refreshTemplates: () => Promise<void>;
  getTemplatesByCategory: (category: string) => Template[];
}

export function useTemplate(options: UseTemplateOptions = {}): UseTemplateReturn {
  const { autoLoad = true, enableSearch = true, enableCategories = true } = options;

  // 로컬스토리지에서 상용구 목록 관리
  const [templates, setTemplates] = useLocalStorageArray<Template>('templates', []);
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    if (!enableCategories) return [];
    const categorySet = new Set(templates.map(t => t.category));
    return ['all', ...Array.from(categorySet).sort()];
  }, [templates, enableCategories]);

  // 상용구 목록 로드
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const templateList = getTemplates();
      setTemplates(templateList);
      setFilteredTemplates(templateList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상용구 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('상용구 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates]);

  // 상용구 생성
  const createTemplateHandler = useCallback(async (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newTemplate = await createTemplate(templateData);
      if (newTemplate) {
        setTemplates(prev => [newTemplate, ...prev]);
        setFilteredTemplates(prev => [newTemplate, ...prev]);
        return newTemplate;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상용구 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('상용구 생성 실패:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates]);

  // 상용구 수정
  const updateTemplateHandler = useCallback(async (id: string, templateData: Partial<Template>) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await updateTemplate(id, templateData);
      if (success) {
        const updatedTemplate = { ...templateData, updatedAt: new Date().toISOString() };
        setTemplates(prev => prev.map(template => 
          template.id === id 
            ? { ...template, ...updatedTemplate }
            : template
        ));
        setFilteredTemplates(prev => prev.map(template => 
          template.id === id 
            ? { ...template, ...updatedTemplate }
            : template
        ));
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(prev => prev ? { ...prev, ...updatedTemplate } : null);
        }
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상용구 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('상용구 수정 실패:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates, selectedTemplate]);

  // 상용구 삭제
  const deleteTemplateHandler = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await deleteTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        setFilteredTemplates(prev => prev.filter(template => template.id !== id));
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상용구 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('상용구 삭제 실패:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates, selectedTemplate]);

  // 상용구 선택
  const selectTemplate = useCallback((template: Template | null) => {
    setSelectedTemplate(template);
  }, []);

  // 상용구 검색
  const searchTemplatesHandler = useCallback(async (keyword: string) => {
    if (!enableSearch) return;

    setSearchKeyword(keyword);
    
    let filtered = templates;

    // 카테고리 필터링
    if (enableCategories && selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // 키워드 검색
    if (keyword.trim()) {
      try {
        const searchResults = searchTemplates({ keyword });
        filtered = filtered.filter(template => 
          searchResults.some((result: Template) => result.id === template.id)
        );
      } catch (err) {
        console.error('상용구 검색 실패:', err);
        filtered = [];
      }
    }

    setFilteredTemplates(filtered);
  }, [templates, enableSearch, enableCategories, selectedCategory]);

  // 카테고리 설정
  const setCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
    setSelectedCategory('all');
    setFilteredTemplates(templates);
  }, [templates]);

  // 상용구 목록 새로고침
  const refreshTemplates = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  // 카테고리별 상용구 조회
  const getTemplatesByCategory = useCallback((category: string): Template[] => {
    if (category === 'all') return templates;
    return templates.filter(template => template.category === category);
  }, [templates]);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadTemplates();
    }
  }, [autoLoad, loadTemplates]);

  // 검색어 또는 카테고리 변경 시 필터링
  useEffect(() => {
    if (enableSearch) {
      searchTemplatesHandler(searchKeyword);
    }
  }, [templates, searchKeyword, selectedCategory, enableSearch, searchTemplatesHandler]);

  return {
    templates,
    isLoading,
    error,
    selectedTemplate,
    filteredTemplates,
    searchKeyword,
    selectedCategory,
    categories,
    loadTemplates,
    createTemplate: createTemplateHandler,
    updateTemplate: updateTemplateHandler,
    deleteTemplate: deleteTemplateHandler,
    selectTemplate,
    searchTemplates: searchTemplatesHandler,
    setCategory,
    clearSearch,
    refreshTemplates,
    getTemplatesByCategory
  };
} 