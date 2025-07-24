import { useState, useCallback, useEffect } from 'react';
import { useLocalStorageArray } from './useLocalStorage';
import { getMemos, createMemo, updateMemo, deleteMemo, searchMemos } from '../services';
import type { Memo } from '../types/memo';

interface UseMemoOptions {
  autoLoad?: boolean;
  enableSearch?: boolean;
}

interface UseMemoReturn {
  memos: Memo[];
  isLoading: boolean;
  error: string | null;
  selectedMemo: Memo | null;
  filteredMemos: Memo[];
  searchKeyword: string;
  loadMemos: () => Promise<void>;
  createMemo: (memoData: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Memo | null>;
  updateMemo: (id: string, memoData: Partial<Memo>) => Promise<boolean>;
  deleteMemo: (id: string) => Promise<boolean>;
  selectMemo: (memo: Memo | null) => void;
  searchMemos: (keyword: string) => Promise<void>;
  clearSearch: () => void;
  refreshMemos: () => Promise<void>;
}

export function useMemo(options: UseMemoOptions = {}): UseMemoReturn {
  const { autoLoad = true, enableSearch = true } = options;

  // 로컬스토리지에서 메모 목록 관리
  const [memos, setMemos] = useLocalStorageArray<Memo>('memos', []);
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);

  // 메모 목록 로드
  const loadMemos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const memoList = await getMemos();
      setMemos(memoList);
      setFilteredMemos(memoList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('메모 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setMemos]);

  // 메모 생성
  const createMemoHandler = useCallback(async (memoData: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newMemo = await createMemo(memoData);
      if (newMemo) {
        setMemos(prev => [newMemo, ...prev]);
        setFilteredMemos(prev => [newMemo, ...prev]);
        return newMemo;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('메모 생성 실패:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setMemos]);

  // 메모 수정
  const updateMemoHandler = useCallback(async (id: string, memoData: Partial<Memo>) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await updateMemo(id, memoData);
      if (success) {
        setMemos(prev => prev.map(memo => 
          memo.id === id 
            ? { ...memo, ...memoData, updatedAt: new Date().toISOString() }
            : memo
        ));
        setFilteredMemos(prev => prev.map(memo => 
          memo.id === id 
            ? { ...memo, ...memoData, updatedAt: new Date().toISOString() }
            : memo
        ));
        if (selectedMemo?.id === id) {
          setSelectedMemo(prev => prev ? { ...prev, ...memoData, updatedAt: new Date().toISOString() } : null);
        }
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('메모 수정 실패:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setMemos, selectedMemo]);

  // 메모 삭제
  const deleteMemoHandler = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await deleteMemo(id);
      if (success) {
        setMemos(prev => prev.filter(memo => memo.id !== id));
        setFilteredMemos(prev => prev.filter(memo => memo.id !== id));
        if (selectedMemo?.id === id) {
          setSelectedMemo(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('메모 삭제 실패:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setMemos, selectedMemo]);

  // 메모 선택
  const selectMemo = useCallback((memo: Memo | null) => {
    setSelectedMemo(memo);
  }, []);

  // 메모 검색
  const searchMemosHandler = useCallback(async (keyword: string) => {
    if (!enableSearch) return;

    setSearchKeyword(keyword);
    
    if (keyword.trim()) {
      try {
        const searchResults = await searchMemos({ keyword });
        setFilteredMemos(searchResults.memos);
      } catch (err) {
        console.error('메모 검색 실패:', err);
        setFilteredMemos([]);
      }
    } else {
      setFilteredMemos(memos);
    }
  }, [memos, enableSearch]);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
    setFilteredMemos(memos);
  }, [memos]);

  // 메모 목록 새로고침
  const refreshMemos = useCallback(async () => {
    await loadMemos();
  }, [loadMemos]);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadMemos();
    }
  }, [autoLoad, loadMemos]);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (enableSearch) {
      searchMemosHandler(searchKeyword);
    }
  }, [memos, searchKeyword, enableSearch, searchMemosHandler]);

  return {
    memos,
    isLoading,
    error,
    selectedMemo,
    filteredMemos,
    searchKeyword,
    loadMemos,
    createMemo: createMemoHandler,
    updateMemo: updateMemoHandler,
    deleteMemo: deleteMemoHandler,
    selectMemo,
    searchMemos: searchMemosHandler,
    clearSearch,
    refreshMemos
  };
} 