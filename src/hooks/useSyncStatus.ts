import { useState, useEffect, useCallback } from 'react';
import syncService from '../services/syncService';
import type { SyncState, NetworkState } from '../types/sync';

export const useSyncStatus = () => {
  const [syncState, setSyncState] = useState<SyncState>(syncService.getState());
  const [networkState, setNetworkState] = useState<NetworkState>(syncService.getNetworkState());

  // 동기화 상태 업데이트
  const updateSyncState = useCallback(() => {
    setSyncState(syncService.getState());
  }, []);

  // 네트워크 상태 업데이트
  const updateNetworkState = useCallback(() => {
    setNetworkState(syncService.getNetworkState());
  }, []);

  // 수동 동기화 시작
  const startManualSync = useCallback(async () => {
    try {
      await syncService.startManualSync();
      updateSyncState();
    } catch (error) {
      console.error('수동 동기화 실패:', error);
    }
  }, [updateSyncState]);

  // 동기화 재시도
  const retrySync = useCallback(async () => {
    try {
      await syncService.startManualSync();
      updateSyncState();
    } catch (error) {
      console.error('동기화 재시도 실패:', error);
    }
  }, [updateSyncState]);

  // 자동 동기화 토글
  const toggleAutoSync = useCallback(() => {
    const config = syncService.getConfig();
    syncService.updateConfig({ autoSync: !config.autoSync });
    
    if (!config.autoSync) {
      syncService.startAutoSync();
    } else {
      syncService.stopAutoSync();
    }
    
    updateSyncState();
  }, [updateSyncState]);

  // 상태 폴링 (1초마다 업데이트)
  useEffect(() => {
    const interval = setInterval(() => {
      updateSyncState();
      updateNetworkState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateSyncState, updateNetworkState]);

  // 네트워크 상태 변경 감지
  useEffect(() => {
    const handleOnline = () => {
      updateNetworkState();
      updateSyncState();
    };

    const handleOffline = () => {
      updateNetworkState();
      updateSyncState();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkState, updateSyncState]);

  return {
    syncState,
    networkState,
    startManualSync,
    retrySync,
    toggleAutoSync,
    isOnline: networkState.isOnline,
    isSyncing: syncState.status === 'syncing',
    hasError: syncState.status === 'error',
    progress: syncState.progress,
    lastSyncTime: syncState.lastSyncTime,
    error: syncState.error
  };
}; 