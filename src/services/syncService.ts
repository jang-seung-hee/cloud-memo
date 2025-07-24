import { 
  generateId, 
} from './localStorageService';
import { 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  uploadFile, 
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

// ?�기?????�?�소 ??

// 기본 ?�기???�정
const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30�?
  maxRetries: 3,
  conflictResolution: 'remote',
  syncDataTypes: ['memo', 'template', 'image']
};

// ?�트?�크 ?�태 감�?
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

// ?�기????관�?
class SyncQueue {
  private queue: SyncItem[] = [];
  private isProcessing = false;

  // ?�에 ?�업 추�?
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

  // ?�에???�업 가?�오�?
  getNextItem(): SyncItem | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  // ?�에???�업 ?�거
  removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter(item => item.id !== itemId);
    this.saveQueue();
  }

  // ?�업 ?�시??
  retryItem(itemId: string): void {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.retryCount < item.maxRetries) {
      item.retryCount++;
      this.saveQueue();
    }
  }

  // ???�??
  private saveQueue(): void {
    try {
    } catch (error) {
      console.error('?�기?????�???�패:', error);
    }
  }

  // ??로드
  loadQueue(): void {
    try {
      console.log('로컬?�토리�? ?�용?��? ?�음, �??�로 초기??);
      this.queue = [];
    } catch (error) {
      console.error('?�기????로드 ?�패:', error);
      this.queue = [];
    }
  }

  // ???�기
  get size(): number {
    return this.queue.length;
  }

  // ??비우�?
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  // 처리 �??�태 ?�정
  setProcessing(processing: boolean): void {
    this.isProcessing = processing;
  }

  // 처리 �??�태 ?�인
  get isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// ?�기???�태 관�?
class SyncStateManager {
  private state: SyncState;

  constructor() {
    this.state = this.loadState();
  }

  // ?�태 ?�데?�트
  updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  // 진행�??�데?�트
  updateProgress(progress: Partial<SyncProgress>): void {
    this.state.progress = { ...this.state.progress, ...progress };
    this.saveState();
  }

  // ?�태 가?�오�?
  getState(): SyncState {
    return { ...this.state };
  }

  // ?�태 ?�??
  private saveState(): void {
    try {
    } catch (error) {
      console.error('?�기???�태 ?�???�패:', error);
    }
  }

  // ?�태 로드
  private loadState(): SyncState {
    try {
      //   status: SyncStatus.IDLE,
      //   progress: {
      //     currentTask: '',
      //     totalTasks: 0,
      //     completedTasks: 0,
      //     percentage: 0
      //   },
      //   lastSyncTime: null,
      //   error: null,
      //   isOnline: navigator.onLine
      // });
      
      // return {
      //   ...savedState,
      //   status: SyncStatus.IDLE,
      //   progress: {
      //     currentTask: '',
      //     totalTasks: 0,
      //     completedTasks: 0,
      //     percentage: 0
      //   },
      //   lastSyncTime: null,
      //   error: null,
      //   isOnline: navigator.onLine
      // };
      console.log('로컬?�토리�? ?�용?��? ?�음, 기본 ?�태�?초기??);
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
    } catch (error) {
      console.error('?�기???�태 로드 ?�패:', error);
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

// ?�기???�정 관�?
class SyncConfigManager {
  private config: SyncConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  // ?�정 가?�오�?
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // ?�정 ?�데?�트
  updateConfig(updates: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // ?�정 ?�??
  private saveConfig(): void {
    try {
    } catch (error) {
      console.error('?�기???�정 ?�???�패:', error);
    }
  }

  // ?�정 로드
  private loadConfig(): SyncConfig {
    try {
      
      // return { ...DEFAULT_SYNC_CONFIG, ...savedConfig };
      console.log('로컬?�토리�? ?�용?��? ?�음, 기본 ?�정?�로 초기??);
      return { ...DEFAULT_SYNC_CONFIG };
    } catch (error) {
      console.error('?�기???�정 로드 ?�패:', error);
      return { ...DEFAULT_SYNC_CONFIG };
    }
  }
}

// 메인 ?�기???�비??
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

  // ?�트?�크 리스???�정
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

  // ?�기???�업 추�?
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

  // ??처리
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
        console.error('?�기???�업 ?�패:', error);
        
        if (item.retryCount >= item.maxRetries) {
          this.queue.removeFromQueue(item.id);
          this.stateManager.updateState({ 
            status: SyncStatus.ERROR,
            error: `?�기???�패: ${error instanceof Error ? error.message : '?????�는 ?�류'}`
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

  // 개별 ?�기???�업 처리
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

  // ?�성 ?�업 처리
  private async handleCreate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await createDocument(collectionName, item.data as any);
  }

  // ?�정 ?�업 처리
  private async handleUpdate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await updateDocument(collectionName, item.dataId, item.data as any);
  }

  // ??�� ?�업 처리
  private async handleDelete(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await deleteDocument(collectionName, item.dataId);
  }

  // ?�로???�업 처리
  private async handleUpload(item: SyncItem): Promise<void> {
    if (item.data instanceof File) {
      const path = `${item.dataType}s`;
      await uploadFile(item.data, path);
    }
  }

  // ?�운로드 ?�업 처리
  private async handleDownload(item: SyncItem): Promise<void> {
    // ?�운로드 로직?� 추후 구현
    console.log('?�운로드 ?�업:', item);
  }

  // 컬렉???�름 가?�오�?
  private getCollectionName(dataType: string): string {
    switch (dataType) {
      case 'memo':
        return COLLECTIONS.MEMOS;
      case 'template':
        return COLLECTIONS.TEMPLATES;
      case 'image':
        return COLLECTIONS.IMAGES;
      default:
        throw new Error(`지?�하지 ?�는 ?�이???�?? ${dataType}`);
    }
  }

  // 충돌 ?�결
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

  // ?�태 가?�오�?
  getState(): SyncState {
    return this.stateManager.getState();
  }

  // ?�정 가?�오�?
  getConfig(): SyncConfig {
    return this.configManager.getConfig();
  }

  // ?�정 ?�데?�트
  updateConfig(updates: Partial<SyncConfig>): void {
    this.configManager.updateConfig(updates);
  }

  // ?�동 ?�기???�작
  async startManualSync(): Promise<void> {
    await this.processQueue();
  }

  // ?�동 ?�기???�작
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

  // ?�동 ?�기??중�?
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ??비우�?
  clearQueue(): void {
    this.queue.clear();
  }

  // ?�트?�크 ?�태 가?�오�?
  getNetworkState(): NetworkState {
    return detectNetworkState();
  }
}

// ?��????�스?�스 ?�성
const syncService = new SyncService();

export default syncService;
export { SyncService, SyncQueue, SyncStateManager, SyncConfigManager }; 
