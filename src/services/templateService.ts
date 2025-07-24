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

// ?ÅÏö©Íµ??∞Ïù¥??Í≤ÄÏ¶?
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

// ?ÅÏö©Íµ?Î™©Î°ù Í∞Ä?∏Ïò§Í∏?
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
    console.log('Î°úÏª¨?§ÌÜ†Î¶¨Ï? ?¨Ïö©?òÏ? ?äÏùå, Îπ?Î∞∞Ïó¥ Î∞òÌôò');
    return [];
  } catch (error) {
    console.error('?ÅÏö©Íµ?Î™©Î°ù Í∞Ä?∏Ïò§Í∏??§Ìå®:', error);
    return [];
  }
};

// ?ÅÏö©Íµ??ùÏÑ±
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

    // Firebase ?ôÍ∏∞??(?∏Ï¶ù???¨Ïö©?êÏù∏ Í≤ΩÏö∞)
    if (isFirebaseAvailable() && getCurrentUserId()) {
      try {
        // Firebase??ÏßÅÏ†ë ?Ä??
        await createDocument(COLLECTIONS.TEMPLATES, newTemplate);
      } catch (syncError) {
        console.warn('Firebase ?ôÍ∏∞???§Ìå® (?ÅÏö©Íµ??ùÏÑ±):', syncError);
        // ?ôÍ∏∞???§Ìå®?¥ÎèÑ Î°úÏª¨ ?Ä?•Ï? ?±Í≥µ?ºÎ°ú Ï≤òÎ¶¨
      }
    }

    return newTemplate;
  } catch (error) {
    throw new StorageError(ERROR_MESSAGES.QUOTA_EXCEEDED, 'QUOTA_EXCEEDED');
  }
};

// ?ÅÏö©Íµ?Ï°∞Ìöå
const getTemplate = (id: string): Template | null => {
  const templates = getTemplates();
  return templates.find(template => template.id === id) || null;
};

// ?ÅÏö©Íµ??òÏ†ï
const updateTemplate = (id: string, request: UpdateTemplateRequest): Template => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  const templates = getTemplates();
  const templateIndex = templates.findIndex(template => template.id === id);

  if (templateIndex === -1) {
    throw new StorageError('?ÅÏö©Íµ¨Î? Ï∞æÏùÑ ???ÜÏäµ?àÎã§.', 'TEMPLATE_NOT_FOUND');
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

// ?ÅÏö©Íµ???†ú
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

// ?ÅÏö©Íµ??¨Ïö© ?üÏàò Ï¶ùÍ?
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

// ?ÅÏö©Íµ?Í≤Ä??
const searchTemplates = (params: TemplateSearchParams): Template[] => {
  let templates = getTemplates();

  // ?§Ïõå??Í≤Ä??
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    templates = templates.filter(template => 
      template.title.toLowerCase().includes(keyword) || 
      template.content.toLowerCase().includes(keyword) ||
      template.category.toLowerCase().includes(keyword)
    );
  }

  // Ïπ¥ÌÖåÍ≥†Î¶¨ ?ÑÌÑ∞
  if (params.category) {
    templates = templates.filter(template => 
      template.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // ?ïÎ†¨
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

// Ïπ¥ÌÖåÍ≥†Î¶¨ Î™©Î°ù Í∞Ä?∏Ïò§Í∏?
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

// ?ÅÏö©Íµ??µÍ≥Ñ
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

// ?ÅÏö©Íµ?Î∞±ÏóÖ
const exportTemplates = (): string => {
  const templates = getTemplates();
  return safeJsonStringify(templates) || '[]';
};

// ?ÅÏö©Íµ?Î≥µÏõê
const importTemplates = (jsonData: string): number => {
  if (!isStorageAvailable()) {
    throw new StorageError(ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const importedTemplates = safeJsonParse<Template[]>(jsonData, []);
    
    if (!Array.isArray(importedTemplates)) {
      throw new StorageError(ERROR_MESSAGES.INVALID_DATA, 'INVALID_DATA');
    }

    // ?∞Ïù¥??Í≤ÄÏ¶?
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
