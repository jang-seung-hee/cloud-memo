import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Template } from '../types/template';

// 상태 타입 정의
interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
  searchKeyword: string;
  selectedCategory: string;
  filteredTemplates: Template[];
}

// 액션 타입 정의
type TemplateAction =
  | { type: 'SET_TEMPLATES'; payload: Template[] }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; template: Partial<Template> } }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'SELECT_TEMPLATE'; payload: Template | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_KEYWORD'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_FILTERED_TEMPLATES'; payload: Template[] }
  | { type: 'CLEAR_ERROR' };

// 초기 상태
const initialState: TemplateState = {
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,
  searchKeyword: '',
  selectedCategory: 'all',
  filteredTemplates: []
};

// 리듀서
function templateReducer(state: TemplateState, action: TemplateAction): TemplateState {
  switch (action.type) {
    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.payload,
        filteredTemplates: action.payload
      };
    
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [action.payload, ...state.templates],
        filteredTemplates: [action.payload, ...state.filteredTemplates]
      };
    
    case 'UPDATE_TEMPLATE':
      const updatedTemplates = state.templates.map(template =>
        template.id === action.payload.id
          ? { ...template, ...action.payload.template, updatedAt: new Date().toISOString() }
          : template
      );
      const updatedFilteredTemplates = state.filteredTemplates.map(template =>
        template.id === action.payload.id
          ? { ...template, ...action.payload.template, updatedAt: new Date().toISOString() }
          : template
      );
      return {
        ...state,
        templates: updatedTemplates,
        filteredTemplates: updatedFilteredTemplates,
        selectedTemplate: state.selectedTemplate?.id === action.payload.id
          ? { ...state.selectedTemplate, ...action.payload.template, updatedAt: new Date().toISOString() }
          : state.selectedTemplate
      };
    
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload),
        filteredTemplates: state.filteredTemplates.filter(template => template.id !== action.payload),
        selectedTemplate: state.selectedTemplate?.id === action.payload ? null : state.selectedTemplate
      };
    
    case 'SELECT_TEMPLATE':
      return {
        ...state,
        selectedTemplate: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'SET_SEARCH_KEYWORD':
      return {
        ...state,
        searchKeyword: action.payload
      };
    
    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload
      };
    
    case 'SET_FILTERED_TEMPLATES':
      return {
        ...state,
        filteredTemplates: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Context 생성
interface TemplateContextType {
  state: TemplateState;
  dispatch: React.Dispatch<TemplateAction>;
  // 편의 메서드들
  setTemplates: (templates: Template[]) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (template: Template | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setCategory: (category: string) => void;
  setFilteredTemplates: (templates: Template[]) => void;
  clearError: () => void;
  getTemplatesByCategory: (category: string) => Template[];
  getCategories: () => string[];
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Provider 컴포넌트
interface TemplateProviderProps {
  children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
  const [state, dispatch] = useReducer(templateReducer, initialState);

  // 편의 메서드들
  const setTemplates = useCallback((templates: Template[]) => {
    dispatch({ type: 'SET_TEMPLATES', payload: templates });
  }, []);

  const addTemplate = useCallback((template: Template) => {
    dispatch({ type: 'ADD_TEMPLATE', payload: template });
  }, []);

  const updateTemplate = useCallback((id: string, template: Partial<Template>) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, template } });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEMPLATE', payload: id });
  }, []);

  const selectTemplate = useCallback((template: Template | null) => {
    dispatch({ type: 'SELECT_TEMPLATE', payload: template });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setSearchKeyword = useCallback((keyword: string) => {
    dispatch({ type: 'SET_SEARCH_KEYWORD', payload: keyword });
  }, []);

  const setCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  const setFilteredTemplates = useCallback((templates: Template[]) => {
    dispatch({ type: 'SET_FILTERED_TEMPLATES', payload: templates });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const getTemplatesByCategory = useCallback((category: string): Template[] => {
    if (category === 'all') return state.templates;
    return state.templates.filter(template => template.category === category);
  }, [state.templates]);

  const getCategories = useCallback((): string[] => {
    const categorySet = new Set(state.templates.map(t => t.category));
    return ['all', ...Array.from(categorySet).sort()];
  }, [state.templates]);

  const value: TemplateContextType = {
    state,
    dispatch,
    setTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    setLoading,
    setError,
    setSearchKeyword,
    setCategory,
    setFilteredTemplates,
    clearError,
    getTemplatesByCategory,
    getCategories
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

// Hook
export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
}

// 선택적 Hook (Provider 없이도 사용 가능)
export function useTemplateContextOptional() {
  const context = useContext(TemplateContext);
  return context;
} 