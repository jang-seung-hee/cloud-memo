import { 
  STORAGE_KEYS, 
  ERROR_MESSAGES, 
  generateId, 
  safeJsonParse, 
  safeJsonStringify, 
  StorageError 
} from './localStorageService';
import { 
  isFirebaseAvailable, 
  getCurrentUserId,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  uploadFile,
  deleteFile,
  COLLECTIONS
} from './firebaseService';
import { 
  SyncStatus, 
  SyncProgress, 
  SyncState, 
  SyncOperation, 
  SyncItem, 
  SyncConfig, 
  ConflictResolution,
  NetworkState 
} from '../types/sync';

// 동기화 큐 저장소 키
const SYNC_QUEUE_KEY = 'cloud_memo_sync_queue';
const SYNC_STATE_KEY = 'cloud_memo_sync_state';
const SYNC_CONFIG_KEY = 'cloud_memo_sync_config';

// 기본 동기화 설정
const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30초
  maxRetries: 3,
  conflictResolution: 'remote',
  syncDataTypes: ['memo', 'template', 'image']
};

// 네트워크 상태 감지
const detectNetworkState = (): NetworkState => {
  const isOnline = navigator.onLine;
  
  return {
    isOnline,
    connectionType: 'unknown',
    connectionQuality: 'unknown',
    lastConnectedAt: isOnline ? new Date() : null,
    lastDisconnectedAt: isOnline ? null : new Date()
  };
};

// 동기화 큐 관리
class SyncQueue {
  private queue: SyncItem[] = [];
  private isProcessing = false;

  // 큐에 작업 추가
  addToQueue(item: Omit<SyncItem, 'id' | 'createdAt' | 'retryCount'>): void {
    const syncItem: SyncItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      retryCount: 0
    };

    this.queue.push(syncItem);
    this.saveQueue();
  }

  // 큐에서 작업 가져오기
  getNextItem(): SyncItem | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  // 큐에서 작업 제거
  removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter(item => item.id !== itemId);
    this.saveQueue();
  }

  // 작업 재시도
  retryItem(itemId: string): void {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.retryCount < item.maxRetries) {
      item.retryCount++;
      this.saveQueue();
    }
  }

  // 큐 저장
  private saveQueue(): void {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, safeJsonStringify(this.queue) || '[]');
    } catch (error) {
      console.error('동기화 큐 저장 실패:', error);
    }
  }

  // 큐 로드
  loadQueue(): void {
    try {
      const queueData = localStorage.getItem(SYNC_QUEUE_KEY);
      this.queue = safeJsonParse<SyncItem[]>(queueData || '[]', []);
    } catch (error) {
      console.error('동기화 큐 로드 실패:', error);
      this.queue = [];
    }
  }

  // 큐 크기
  get size(): number {
    return this.queue.length;
  }

  // 큐 비우기
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  // 처리 중 상태 설정
  setProcessing(processing: boolean): void {
    this.isProcessing = processing;
  }

  // 처리 중 상태 확인
  get isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// 동기화 상태 관리
class SyncStateManager {
  private state: SyncState;

  constructor() {
    this.state = this.loadState();
  }

  // 상태 업데이트
  updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  // 진행률 업데이트
  updateProgress(progress: Partial<SyncProgress>): void {
    this.state.progress = { ...this.state.progress, ...progress };
    this.saveState();
  }

  // 상태 가져오기
  getState(): SyncState {
    return { ...this.state };
  }

  // 상태 저장
  private saveState(): void {
    try {
      localStorage.setItem(SYNC_STATE_KEY, safeJsonStringify(this.state) || '{}');
    } catch (error) {
      console.error('동기화 상태 저장 실패:', error);
    }
  }

  // 상태 로드
  private loadState(): SyncState {
    try {
      const stateData = localStorage.getItem(SYNC_STATE_KEY);
      const savedState = safeJsonParse<SyncState>(stateData || '{}', {
        status: SyncStatus.IDLE,
        progress: {
          currentTask: '',
          totalTasks: 0,
          completedTasks: 0,
          percentage: 0
        },
        lastSyncTime: null,
        error: null,
        isOnline: navigator.onLine
      });
      
      return {
        ...savedState,
        status: SyncStatus.IDLE,
        progress: {
          currentTask: '',
          totalTasks: 0,
          completedTasks: 0,
          percentage: 0
        },
        lastSyncTime: null,
        error: null,
        isOnline: navigator.onLine
      };
    } catch (error) {
      console.error('동기화 상태 로드 실패:', error);
      return {
        status: SyncStatus.IDLE,
        progress: {
          currentTask: '',
          totalTasks: 0,
          completedTasks: 0,
          percentage: 0
        },
        lastSyncTime: null,
        error: null,
        isOnline: navigator.onLine
      };
    }
  }
}

// 동기화 설정 관리
class SyncConfigManager {
  private config: SyncConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  // 설정 가져오기
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // 설정 업데이트
  updateConfig(updates: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // 설정 저장
  private saveConfig(): void {
    try {
      localStorage.setItem(SYNC_CONFIG_KEY, safeJsonStringify(this.config) || '{}');
    } catch (error) {
      console.error('동기화 설정 저장 실패:', error);
    }
  }

  // 설정 로드
  private loadConfig(): SyncConfig {
    try {
      const configData = localStorage.getItem(SYNC_CONFIG_KEY);
      const savedConfig = safeJsonParse<SyncConfig>(configData || '{}', DEFAULT_SYNC_CONFIG);
      
      return { ...DEFAULT_SYNC_CONFIG, ...savedConfig };
    } catch (error) {
      console.error('동기화 설정 로드 실패:', error);
      return { ...DEFAULT_SYNC_CONFIG };
    }
  }
}

// 메인 동기화 서비스
class SyncService {
  private queue: SyncQueue;
  private stateManager: SyncStateManager;
  private configManager: SyncConfigManager;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.queue = new SyncQueue();
    this.stateManager = new SyncStateManager();
    this.configManager = new SyncConfigManager();
    
    this.queue.loadQueue();
    this.setupNetworkListeners();
  }

  // 네트워크 리스너 설정
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.stateManager.updateState({ isOnline: true });
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.stateManager.updateState({ 
        isOnline: false, 
        status: SyncStatus.OFFLINE 
      });
    });
  }

  // 동기화 작업 추가
  addSyncOperation(
    operation: SyncOperation,
    dataType: 'memo' | 'template' | 'image',
    dataId: string,
    data: unknown
  ): void {
    this.queue.addToQueue({
      operation,
      dataType,
      dataId,
      data,
      maxRetries: this.configManager.getConfig().maxRetries
    });

    if (this.configManager.getConfig().autoSync) {
      this.processQueue();
    }
  }

  // 큐 처리
  async processQueue(): Promise<void> {
    if (this.queue.isCurrentlyProcessing || this.queue.size === 0) {
      return;
    }

    if (!this.stateManager.getState().isOnline) {
      this.stateManager.updateState({ status: SyncStatus.OFFLINE });
      return;
    }

    this.queue.setProcessing(true);
    this.stateManager.updateState({ 
      status: SyncStatus.SYNCING,
      error: null
    });

    const totalTasks = this.queue.size;
    let completedTasks = 0;

    this.stateManager.updateProgress({
      totalTasks,
      completedTasks,
      percentage: 0
    });

    while (this.queue.size > 0) {
      const item = this.queue.getNextItem();
      if (!item) break;

      this.stateManager.updateProgress({
        currentTask: `${item.operation} ${item.dataType} (${item.dataId})`,
        completedTasks
      });

      try {
        await this.processSyncItem(item);
        this.queue.removeFromQueue(item.id);
        completedTasks++;
        
        this.stateManager.updateProgress({
          completedTasks,
          percentage: Math.round((completedTasks / totalTasks) * 100)
        });
      } catch (error) {
        console.error('동기화 작업 실패:', error);
        
        if (item.retryCount >= item.maxRetries) {
          this.queue.removeFromQueue(item.id);
          this.stateManager.updateState({ 
            status: SyncStatus.ERROR,
            error: `동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          });
        } else {
          this.queue.retryItem(item.id);
        }
        
        completedTasks++;
      }
    }

    this.queue.setProcessing(false);
    
    if (this.queue.size === 0) {
      this.stateManager.updateState({ 
        status: SyncStatus.SUCCESS,
        lastSyncTime: new Date()
      });
    }
  }

  // 개별 동기화 작업 처리
  private async processSyncItem(item: SyncItem): Promise<void> {
    switch (item.operation) {
      case SyncOperation.CREATE:
        await this.handleCreate(item);
        break;
      case SyncOperation.UPDATE:
        await this.handleUpdate(item);
        break;
      case SyncOperation.DELETE:
        await this.handleDelete(item);
        break;
      case SyncOperation.UPLOAD:
        await this.handleUpload(item);
        break;
      case SyncOperation.DOWNLOAD:
        await this.handleDownload(item);
        break;
    }
  }

  // 생성 작업 처리
  private async handleCreate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await createDocument(collectionName, item.data as any);
  }

  // 수정 작업 처리
  private async handleUpdate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await updateDocument(collectionName, item.dataId, item.data as any);
  }

  // 삭제 작업 처리
  private async handleDelete(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await deleteDocument(collectionName, item.dataId);
  }

  // 업로드 작업 처리
  private async handleUpload(item: SyncItem): Promise<void> {
    if (item.data instanceof File) {
      const path = `${item.dataType}s`;
      await uploadFile(item.data, path);
    }
  }

  // 다운로드 작업 처리
  private async handleDownload(item: SyncItem): Promise<void> {
    // 다운로드 로직은 추후 구현
    console.log('다운로드 작업:', item);
  }

  // 컬렉션 이름 가져오기
  private getCollectionName(dataType: string): string {
    switch (dataType) {
      case 'memo':
        return COLLECTIONS.MEMOS;
      case 'template':
        return COLLECTIONS.TEMPLATES;
      case 'image':
        return COLLECTIONS.IMAGES;
      default:
        throw new Error(`지원하지 않는 데이터 타입: ${dataType}`);
    }
  }

  // 충돌 해결
  private resolveConflict(
    local: unknown,
    remote: unknown,
    localModifiedAt: Date,
    remoteModifiedAt: Date
  ): ConflictResolution {
    const config = this.configManager.getConfig();
    
    let resolution: 'local' | 'remote' | 'manual' = config.conflictResolution;
    
    if (resolution === 'remote' && remoteModifiedAt > localModifiedAt) {
      resolution = 'remote';
    } else if (resolution === 'local' && localModifiedAt > remoteModifiedAt) {
      resolution = 'local';
    } else {
      resolution = 'manual';
    }

    return {
      local,
      remote,
      localModifiedAt,
      remoteModifiedAt,
      resolution
    };
  }

  // 상태 가져오기
  getState(): SyncState {
    return this.stateManager.getState();
  }

  // 설정 가져오기
  getConfig(): SyncConfig {
    return this.configManager.getConfig();
  }

  // 설정 업데이트
  updateConfig(updates: Partial<SyncConfig>): void {
    this.configManager.updateConfig(updates);
  }

  // 수동 동기화 시작
  async startManualSync(): Promise<void> {
    await this.processQueue();
  }

  // 자동 동기화 시작
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const config = this.configManager.getConfig();
    if (config.autoSync) {
      this.syncInterval = setInterval(() => {
        this.processQueue();
      }, config.syncInterval);
    }
  }

  // 자동 동기화 중지
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // 큐 비우기
  clearQueue(): void {
    this.queue.clear();
  }

  // 네트워크 상태 가져오기
  getNetworkState(): NetworkState {
    return detectNetworkState();
  }
}

// 싱글톤 인스턴스 생성
const syncService = new SyncService();

export default syncService;
export { SyncService, SyncQueue, SyncStateManager, SyncConfigManager }; 