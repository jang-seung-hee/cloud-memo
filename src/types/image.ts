/**
 * 이미지 관련 타입 정의
 */

export interface Image {
  /** 이미지 고유 ID */
  id: string;
  /** 이미지 데이터 (Base64 인코딩) */
  data: string;
  /** 이미지 파일명 */
  name: string;
  /** 이미지 파일 크기 (bytes) */
  size: number;
  /** 이미지 MIME 타입 */
  type: string;
  /** 썸네일 데이터 (Base64 인코딩) */
  thumbnail?: string;
  /** 업로드 일시 */
  uploadedAt: Date;
}

export interface ImageUploadRequest {
  /** 이미지 파일 */
  file: File;
  /** 압축 품질 (0-1) */
  quality?: number;
  /** 최대 너비 */
  maxWidth?: number;
  /** 최대 높이 */
  maxHeight?: number;
}

export interface ImageUploadResponse {
  /** 업로드된 이미지 */
  image: Image;
  /** 업로드 성공 여부 */
  success: boolean;
  /** 에러 메시지 */
  error?: string;
}

export interface ImageCompressionOptions {
  /** 압축 품질 (0-1) */
  quality: number;
  /** 최대 너비 */
  maxWidth: number;
  /** 최대 높이 */
  maxHeight: number;
  /** 썸네일 생성 여부 */
  generateThumbnail: boolean;
  /** 썸네일 크기 */
  thumbnailSize: number;
} 