import type { Template, CreateTemplateRequest, UpdateTemplateRequest, TemplateSearchParams, TemplateCategory } from '../types/template';
import { 
  STORAGE_KEYS, 
  ERROR_MESSAGES, 
  STORAGE_LIMITS,
  generateId, 
  isStorageAvailable, 
  validateStorageLimit, 
  safeJsonParse, 
  safeJsonStringify, 
  StorageError 
} from './localStorageService';
import { 
  isFirebaseAvailable, 
  getCurrentUserId,
  createDocument,
  COLLECTIONS
} from './firebaseService';

// 상용구 데이터 검증
const validateTemplate = (template: Partial<Template>): boolean => {
  if (!template.title || template.title.trim().length === 0) {
    return false;
  }
  if (!template.content || template.content.trim().length === 0) {
    return false;
  }
  if (!template.category || template.category.trim().length === 0) {
    return false;
  }
  if (template.content.length > STORAGE_LIMITS.MAX_TEMPLATE_LENGTH) {
    return false;
  }
  return true;
};

// 상용구 목록 가져오기
const getTemplates = (): Template[] => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    // const templatesJson = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    // if (!templatesJson) {
    //   return [];
    // }

    // const templates = safeJsonParse<Template[]>(templatesJson, []);
    // return Array.isArray(templates) ? templates : [];
    console.log('로컬스토리지 사용하지 않음, 빈 배열 반환');
    return [];
  } catch (error) {
    console.error('상용구 목록 가져오기 실패:', error);
    return [];
  }
};

// 상용구 생성
const createTemplate = async (request: CreateTemplateRequest): Promise<Template> => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (!validateTemplate(request)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  const newTemplate: Template = {
    id: generateId(),
    title: request.title.trim(),
    content: request.content.trim(),
    category: request.category.trim(),
    createdAt: new Date(),
    updatedAt: new Date().toISOString(),
    usageCount: 0
  };

  const templates = getTemplates();
  const dataSize = safeJsonStringify([...templates, newTemplate])?.length || 0;

  if (!validateStorageLimit(dataSize)) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
  }

  try {
    templates.push(newTemplate);
    const templatesJson = safeJsonStringify(templates);
    if (templatesJson) {
      // localStorage.setItem(STORAGE_KEYS.TEMPLATES, templatesJson);
    }

    // Firebase 동기화 (인증된 사용자인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase에 직접 저장
        await createDocument(COLLECTIONS.TEMPLATES, newTemplate);
      } catch (syncError) {
        console.warn('Firebase 동기화 실패 (상용구 생성):', syncError);
        // 동기화 실패해도 로컬 저장은 성공으로 처리
      }
    }

    return newTemplate;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 상용구 조회
const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(template => template.id === id) || null;
};

// 상용구 수정
const updateTemplate = (id: string, request: UpdateTemplateRequest): Template => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const templates = getTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);

  if (templateIndex === -1) {
    throw new StorageError('상용구를 찾을 수 없습니다.', 'TEMPLATE_NOT_FOUND');
  }

  const updatedTemplate: Template = {
    ...templates[templateIndex],
    ...(request.title && { title: request.title.trim() }),
    ...(request.content && { content: request.content.trim() }),
    ...(request.category && { category: request.category.trim() }),
    updatedAt: new Date().toISOString()
  };

  if (!validateTemplate(updatedTemplate)) {
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }

  const dataSize = safeJsonStringify([...templates.slice(0, templateIndex), updatedTemplate, ...templates.slice(templateIndex + 1)])?.length || 0;

  if (!validateStorageLimit(dataSize)) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
  }

  try {
    templates[templateIndex] = updatedTemplate;
    const templatesJson = safeJsonStringify(templates);
    if (templatesJson) {
      // localStorage.setItem(STORAGE_KEYS.TEMPLATES, templatesJson);
    }
    return updatedTemplate;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 상용구 삭제
const deleteTemplate = (id: string): boolean => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const templates = getTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);

  if (templateIndex === -1) {
    return false;
  }

  try {
    templates.splice(templateIndex, 1);
    const templatesJson = safeJsonStringify(templates);
    if (templatesJson) {
      // localStorage.setItem(STORAGE_KEYS.TEMPLATES, templatesJson);
    }
    return true;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 상용구 사용 횟수 증가
const incrementUsageCount = (id: string): void => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const templates = getTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);

  if (templateIndex === -1) {
    return;
  }

  try {
    templates[templateIndex].usageCount += 1;
    templates[templateIndex].lastUsedAt = new Date();
    templates[templateIndex].updatedAt = new Date().toISOString();

    const templatesJson = safeJsonStringify(templates);
    if (templatesJson) {
      // localStorage.setItem(STORAGE_KEYS.TEMPLATES, templatesJson);
    }
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// 상용구 검색
const searchTemplates = (params: TemplateSearchParams): Template[] => {
  let templates = getTemplates();

  // 키워드 검색
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    templates = templates.filter(template => 
      template.title.toLowerCase().includes(keyword) || 
      template.content.toLowerCase().includes(keyword) ||
      template.category.toLowerCase().includes(keyword)
    );
  }

  // 카테고리 필터
  if (params.category) {
    templates = templates.filter(template => 
      template.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // 정렬
  const sortBy = params.sortBy || 'updatedAt';
  const sortOrder = params.sortOrder || 'desc';

  templates.sort((a, b) => {
    let aValue: string | Date | number;
    let bValue: string | Date | number;

    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'usageCount':
        aValue = a.usageCount;
        bValue = b.usageCount;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'updatedAt':
      default:
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
    }

    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return templates;
};

// 카테고리 목록 가져오기
const getTemplateCategories = (): TemplateCategory[] => {
  const templates = getTemplates();
  const categoryMap = new Map<string, number>();

  templates.forEach(template => {
    const count = categoryMap.get(template.category) || 0;
    categoryMap.set(template.category, count + 1);
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count
  }));
};

// 상용구 통계
const getTemplateStats = () => {
  const templates = getTemplates();
  const totalTemplates = templates.length;
  const totalCharacters = templates.reduce((sum, template) => sum + template.content.length, 0);
  const totalUsage = templates.reduce((sum, template) => sum + template.usageCount, 0);
  const todayTemplates = templates.filter(template => {
    const today = new Date();
    const templateDate = new Date(template.createdAt);
    return templateDate.toDateString() === today.toDateString();
  }).length;

  const categories = getTemplateCategories();

  return {
    totalTemplates,
    totalCharacters,
    totalUsage,
    todayTemplates,
    categories
  };
};

// 상용구 백업
const exportTemplates = (): string => {
  const templates = getTemplates();
  return safeJsonStringify(templates) || '[]';
};

// 상용구 복원
const importTemplates = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedTemplates = safeJsonParse<Template[]>(jsonData, []);
    
    if (!Array.isArray(importedTemplates)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // 데이터 검증
    const validTemplates = importedTemplates.filter(template => validateTemplate(template));
    
    const dataSize = safeJsonStringify(validTemplates)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const templatesJson = safeJsonStringify(validTemplates);
    if (templatesJson) {
      // localStorage.setItem(STORAGE_KEYS.TEMPLATES, templatesJson);
    }

    return validTemplates.length;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
  }
};

export {
  getTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsageCount,
  searchTemplates,
  getTemplateCategories,
  getTemplateStats,
  exportTemplates,
  importTemplates,
  validateTemplate
}; 