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

// ?™ê¸°?????€?¥ì†Œ ??

// ê¸°ë³¸ ?™ê¸°???¤ì •
const DEFAULT_SYNC_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 30000, // 30ì´?
  maxRetries: 3,
  conflictResolution: 'remote',
  syncDataTypes: ['memo', 'template', 'image']
};

// ?¤íŠ¸?Œí¬ ?íƒœ ê°ì?
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

// ?™ê¸°????ê´€ë¦?
class SyncQueue {
  private queue: SyncItem[] = [];
  private isProcessing = false;

  // ?ì— ?‘ì—… ì¶”ê?
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

  // ?ì—???‘ì—… ê°€?¸ì˜¤ê¸?
  getNextItem(): SyncItem | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  // ?ì—???‘ì—… ?œê±°
  removeFromQueue(itemId: string): void {
    this.queue = this.queue.filter(item => item.id !== itemId);
    this.saveQueue();
  }

  // ?‘ì—… ?¬ì‹œ??
  retryItem(itemId: string): void {
    const item = this.queue.find(item => item.id === itemId);
    if (item && item.retryCount < item.maxRetries) {
      item.retryCount++;
      this.saveQueue();
    }
  }

  // ???€??
  private saveQueue(): void {
    try {
    } catch (error) {
      console.error('?™ê¸°?????€???¤íŒ¨:', error);
    }
  }

  // ??ë¡œë“œ
  loadQueue(): void {
    try {
      console.log('ë¡œì»¬?¤í† ë¦¬ì? ?¬ìš©?˜ì? ?ŠìŒ, ë¹??ë¡œ ì´ˆê¸°??);
      this.queue = [];
    } catch (error) {
      console.error('?™ê¸°????ë¡œë“œ ?¤íŒ¨:', error);
      this.queue = [];
    }
  }

  // ???¬ê¸°
  get size(): number {
    return this.queue.length;
  }

  // ??ë¹„ìš°ê¸?
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  // ì²˜ë¦¬ ì¤??íƒœ ?¤ì •
  setProcessing(processing: boolean): void {
    this.isProcessing = processing;
  }

  // ì²˜ë¦¬ ì¤??íƒœ ?•ì¸
  get isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// ?™ê¸°???íƒœ ê´€ë¦?
class SyncStateManager {
  private state: SyncState;

  constructor() {
    this.state = this.loadState();
  }

  // ?íƒœ ?…ë°?´íŠ¸
  updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates };
    this.saveState();
  }

  // ì§„í–‰ë¥??…ë°?´íŠ¸
  updateProgress(progress: Partial<SyncProgress>): void {
    this.state.progress = { ...this.state.progress, ...progress };
    this.saveState();
  }

  // ?íƒœ ê°€?¸ì˜¤ê¸?
  getState(): SyncState {
    return { ...this.state };
  }

  // ?íƒœ ?€??
  private saveState(): void {
    try {
    } catch (error) {
      console.error('?™ê¸°???íƒœ ?€???¤íŒ¨:', error);
    }
  }

  // ?íƒœ ë¡œë“œ
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
      console.log('ë¡œì»¬?¤í† ë¦¬ì? ?¬ìš©?˜ì? ?ŠìŒ, ê¸°ë³¸ ?íƒœë¡?ì´ˆê¸°??);
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
      console.error('?™ê¸°???íƒœ ë¡œë“œ ?¤íŒ¨:', error);
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

// ?™ê¸°???¤ì • ê´€ë¦?
class SyncConfigManager {
  private config: SyncConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  // ?¤ì • ê°€?¸ì˜¤ê¸?
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // ?¤ì • ?…ë°?´íŠ¸
  updateConfig(updates: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  // ?¤ì • ?€??
  private saveConfig(): void {
    try {
    } catch (error) {
      console.error('?™ê¸°???¤ì • ?€???¤íŒ¨:', error);
    }
  }

  // ?¤ì • ë¡œë“œ
  private loadConfig(): SyncConfig {
    try {
      
      // return { ...DEFAULT_SYNC_CONFIG, ...savedConfig };
      console.log('ë¡œì»¬?¤í† ë¦¬ì? ?¬ìš©?˜ì? ?ŠìŒ, ê¸°ë³¸ ?¤ì •?¼ë¡œ ì´ˆê¸°??);
      return { ...DEFAULT_SYNC_CONFIG };
    } catch (error) {
      console.error('?™ê¸°???¤ì • ë¡œë“œ ?¤íŒ¨:', error);
      return { ...DEFAULT_SYNC_CONFIG };
    }
  }
}

// ë©”ì¸ ?™ê¸°???œë¹„??
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

  // ?¤íŠ¸?Œí¬ ë¦¬ìŠ¤???¤ì •
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

  // ?™ê¸°???‘ì—… ì¶”ê?
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

  // ??ì²˜ë¦¬
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
        console.error('?™ê¸°???‘ì—… ?¤íŒ¨:', error);
        
        if (item.retryCount >= item.maxRetries) {
          this.queue.removeFromQueue(item.id);
          this.stateManager.updateState({ 
            status: SyncStatus.ERROR,
            error: `?™ê¸°???¤íŒ¨: ${error instanceof Error ? error.message : '?????†ëŠ” ?¤ë¥˜'}`
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

  // ê°œë³„ ?™ê¸°???‘ì—… ì²˜ë¦¬
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

  // ?ì„± ?‘ì—… ì²˜ë¦¬
  private async handleCreate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await createDocument(collectionName, item.data as any);
  }

  // ?˜ì • ?‘ì—… ì²˜ë¦¬
  private async handleUpdate(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await updateDocument(collectionName, item.dataId, item.data as any);
  }

  // ?? œ ?‘ì—… ì²˜ë¦¬
  private async handleDelete(item: SyncItem): Promise<void> {
    const collectionName = this.getCollectionName(item.dataType);
    await deleteDocument(collectionName, item.dataId);
  }

  // ?…ë¡œ???‘ì—… ì²˜ë¦¬
  private async handleUpload(item: SyncItem): Promise<void> {
    if (item.data instanceof File) {
      const path = `${item.dataType}s`;
      await uploadFile(item.data, path);
    }
  }

  // ?¤ìš´ë¡œë“œ ?‘ì—… ì²˜ë¦¬
  private async handleDownload(item: SyncItem): Promise<void> {
    // ?¤ìš´ë¡œë“œ ë¡œì§?€ ì¶”í›„ êµ¬í˜„
    console.log('?¤ìš´ë¡œë“œ ?‘ì—…:', item);
  }

  // ì»¬ë ‰???´ë¦„ ê°€?¸ì˜¤ê¸?
  private getCollectionName(dataType: string): string {
    switch (dataType) {
      case 'memo':
        return COLLECTIONS.MEMOS;
      case 'template':
        return COLLECTIONS.TEMPLATES;
      case 'image':
        return COLLECTIONS.IMAGES;
      default:
        throw new Error(`ì§€?í•˜ì§€ ?ŠëŠ” ?°ì´???€?? ${dataType}`);
    }
  }

  // ì¶©ëŒ ?´ê²°
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

  // ?íƒœ ê°€?¸ì˜¤ê¸?
  getState(): SyncState {
    return this.stateManager.getState();
  }

  // ?¤ì • ê°€?¸ì˜¤ê¸?
  getConfig(): SyncConfig {
    return this.configManager.getConfig();
  }

  // ?¤ì • ?…ë°?´íŠ¸
  updateConfig(updates: Partial<SyncConfig>): void {
    this.configManager.updateConfig(updates);
  }

  // ?˜ë™ ?™ê¸°???œì‘
  async startManualSync(): Promise<void> {
    await this.processQueue();
  }

  // ?ë™ ?™ê¸°???œì‘
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

  // ?ë™ ?™ê¸°??ì¤‘ì?
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ??ë¹„ìš°ê¸?
  clearQueue(): void {
    this.queue.clear();
  }

  // ?¤íŠ¸?Œí¬ ?íƒœ ê°€?¸ì˜¤ê¸?
  getNetworkState(): NetworkState {
    return detectNetworkState();
  }
}

// ?±ê????¸ìŠ¤?´ìŠ¤ ?ì„±
const syncService = new SyncService();

export default syncService;
export { SyncService, SyncQueue, SyncStateManager, SyncConfigManager }; 
