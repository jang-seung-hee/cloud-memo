/**
 * 상용구 관련 타입 정의
 */

export interface Template {
  /** 상용구 고유 ID */
  id: string;
  /** 상용구 제목 */
  title: string;
  /** 상용구 내용 */
  content: string;
  /** 상용구 카테고리 */
  category: string;
  /** 생성일시 */
  createdAt: Date;
  /** 수정일시 */
  updatedAt: string;
  /** 사용 횟수 */
  usageCount: number;
  /** 마지막 사용일시 */
  lastUsedAt?: Date;
}

export interface CreateTemplateRequest {
  /** 상용구 제목 */
  title: string;
  /** 상용구 내용 */
  content: string;
  /** 상용구 카테고리 */
  category: string;
}

export interface UpdateTemplateRequest {
  /** 상용구 제목 */
  title?: string;
  /** 상용구 내용 */
  content?: string;
  /** 상용구 카테고리 */
  category?: string;
}

export interface TemplateCategory {
  /** 카테고리 ID */
  id: string;
  /** 카테고리명 */
  name: string;
  /** 카테고리 설명 */
  description?: string;
  /** 상용구 개수 */
  count: number;
}

export interface TemplateSearchParams {
  /** 검색 키워드 */
  keyword?: string;
  /** 카테고리 필터 */
  category?: string;
  /** 정렬 기준 */
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'usageCount';
  /** 정렬 순서 */
  sortOrder?: 'asc' | 'desc';
} 