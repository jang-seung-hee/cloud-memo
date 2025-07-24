import type { Template, CreateTemplateRequest, UpdateTemplateRequest, TemplateSearchParams, TemplateCategory } from '../types/template';
import { 
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

// ?�용�??�이??검�?
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

// ?�용�?목록 가?�오�?
const getTemplates = (): Template[] => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    // if (!templatesJson) {
    //   return [];
    // }

    // const templates = safeJsonParse<Template[]>(templatesJson, []);
    // return Array.isArray(templates) ? templates : [];
    console.log('로컬?�토리�? ?�용?��? ?�음, �?배열 반환');
    return [];
  } catch (error) {
    console.error('?�용�?목록 가?�오�??�패:', error);
    return [];
  }
};

// ?�용�??�성
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
    }

    // Firebase ?�기??(?�증???�용?�인 경우)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase??직접 ?�??
        await createDocument(COLLECTIONS.TEMPLATES, newTemplate);
      } catch (syncError) {
        console.warn('Firebase ?�기???�패 (?�용�??�성):', syncError);
        // ?�기???�패?�도 로컬 ?�?��? ?�공?�로 처리
      }
    }

    return newTemplate;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?�용�?조회
const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(template => template.id === id) || null;
};

// ?�용�??�정
const updateTemplate = (id: string, request: UpdateTemplateRequest): Template => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const templates = getTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);

  if (templateIndex === -1) {
    throw new StorageError('?�용구�? 찾을 ???�습?�다.', 'TEMPLATE_NOT_FOUND');
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
    }
    return updatedTemplate;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?�용�???��
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
    }
    return true;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?�용�??�용 ?�수 증�?
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
    }
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?�용�?검??
const searchTemplates = (params: TemplateSearchParams): Template[] => {
  let templates = getTemplates();

  // ?�워??검??
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    templates = templates.filter(template => 
      template.title.toLowerCase().includes(keyword) || 
      template.content.toLowerCase().includes(keyword) ||
      template.category.toLowerCase().includes(keyword)
    );
  }

  // 카테고리 ?�터
  if (params.category) {
    templates = templates.filter(template => 
      template.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // ?�렬
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

// 카테고리 목록 가?�오�?
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

// ?�용�??�계
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

// ?�용�?백업
const exportTemplates = (): string => {
  const templates = getTemplates();
  return safeJsonStringify(templates) || '[]';
};

// ?�용�?복원
const importTemplates = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedTemplates = safeJsonParse<Template[]>(jsonData, []);
    
    if (!Array.isArray(importedTemplates)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // ?�이??검�?
    const validTemplates = importedTemplates.filter(template => validateTemplate(template));
    
    const dataSize = safeJsonStringify(validTemplates)?.length || 0;
    if (!validateStorageLimit(dataSize)) {
      throw new StorageError(ERROR_MESSAGES.STORAGE_FULL, 'STORAGE_FULL');
    }

    const templatesJson = safeJsonStringify(validTemplates);
    if (templatesJson) {
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
