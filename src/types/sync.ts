/**
 * 동기화 관련 타입 정의
 */

// 동기화 상태
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// 동기화 진행률
export interface SyncProgress {
  /** 현재 진행 중인 작업 */
  currentTask: string;
  /** 전체 작업 수 */
  totalTasks: number;
  /** 완료된 작업 수 */
  completedTasks: number;
  /** 진행률 (0-100) */
  percentage: number;
}

// 동기화 상태 정보
export interface SyncState {
  /** 동기화 상태 */
  status: SyncStatus;
  /** 진행률 정보 */
  progress: SyncProgress;
  /** 마지막 동기화 시간 */
  lastSyncTime: Date | null;
  /** 오류 메시지 */
  error: string | null;
  /** 네트워크 상태 */
  isOnline: boolean;
}

// 동기화 작업 타입
export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  UPLOAD = 'upload',
  DOWNLOAD = 'download'
}

// 동기화 작업 항목
export interface SyncItem {
  /** 작업 ID */
  id: string;
  /** 작업 타입 */
  operation: SyncOperation;
  /** 데이터 타입 */
  dataType: 'memo' | 'template' | 'image';
  /** 데이터 ID */
  dataId: string;
  /** 데이터 내용 */
  data: unknown;
  /** 생성 시간 */
  createdAt: Date;
  /** 시도 횟수 */
  retryCount: number;
  /** 최대 시도 횟수 */
  maxRetries: number;
}

// 동기화 설정
export interface SyncConfig {
  /** 자동 동기화 활성화 */
  autoSync: boolean;
  /** 동기화 간격 (밀리초) */
  syncInterval: number;
  /** 최대 재시도 횟수 */
  maxRetries: number;
  /** 충돌 해결 전략 */
  conflictResolution: 'local' | 'remote' | 'manual';
  /** 동기화할 데이터 타입 */
  syncDataTypes: ('memo' | 'template' | 'image')[];
}

// 충돌 해결 전략
export interface ConflictResolution {
  /** 로컬 데이터 */
  local: unknown;
  /** 원격 데이터 */
  remote: unknown;
  /** 로컬 수정 시간 */
  localModifiedAt: Date;
  /** 원격 수정 시간 */
  remoteModifiedAt: Date;
  /** 해결 방법 */
  resolution: 'local' | 'remote' | 'manual';
}

// 네트워크 상태 정보
export interface NetworkState {
  /** 온라인 상태 */
  isOnline: boolean;
  /** 연결 타입 */
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  /** 연결 품질 */
  connectionQuality: 'good' | 'poor' | 'unknown';
  /** 마지막 연결 시간 */
  lastConnectedAt: Date | null;
  /** 마지막 연결 해제 시간 */
  lastDisconnectedAt: Date | null;
} 