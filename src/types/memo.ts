/**
 * 메모 관련 타입 정의
 */

import { Image } from './image';

export interface Memo {
  /** 메모 고유 ID */
  id: string;
  /** 메모 제목 (선택적, 없으면 내용의 첫 줄을 사용) */
  title?: string;
  /** 메모 내용 */
  content: string;
  /** 첨부된 이미지 목록 */
  images: Image[];
  /** 생성일시 */
  createdAt: Date;
  /** 수정일시 */
  updatedAt: string;
}

export interface CreateMemoRequest {
  /** 메모 제목 (선택적) */
  title?: string;
  /** 메모 내용 */
  content: string;
  /** 첨부된 이미지 목록 */
  images?: Image[];
}

export interface UpdateMemoRequest {
  /** 메모 제목 (선택적) */
  title?: string;
  /** 메모 내용 */
  content?: string;
  /** 첨부된 이미지 목록 */
  images?: Image[];
}

export interface MemoListResponse {
  /** 메모 목록 */
  memos: Memo[];
  /** 전체 메모 개수 */
  totalCount: number;
}

export interface MemoSearchParams {
  /** 검색 키워드 */
  keyword?: string;
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  pageSize?: number;
  /** 정렬 기준 */
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  /** 정렬 순서 */
  sortOrder?: 'asc' | 'desc';
} 