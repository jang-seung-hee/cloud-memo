import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import type { Memo } from '../types/memo';
import { subscribeToCollection } from '../services/firebaseService';
import { useAuthContext } from './AuthContext';

// 상태 타입 정의
interface MemoState {
  memos: Memo[];
  selectedMemo: Memo | null;
  isLoading: boolean;
  error: string | null;
  searchKeyword: string;
  filteredMemos: Memo[];
}

// 액션 타입 정의
type MemoAction =
  | { type: 'SET_MEMOS'; payload: Memo[] }
  | { type: 'ADD_MEMO'; payload: Memo }
  | { type: 'UPDATE_MEMO'; payload: { id: string; memo: Partial<Memo> } }
  | { type: 'DELETE_MEMO'; payload: string }
  | { type: 'SELECT_MEMO'; payload: Memo | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_KEYWORD'; payload: string }
  | { type: 'SET_FILTERED_MEMOS'; payload: Memo[] }
  | { type: 'CLEAR_ERROR' };

// 초기 상태
const initialState: MemoState = {
  memos: [],
  selectedMemo: null,
  isLoading: false,
  error: null,
  searchKeyword: '',
  filteredMemos: []
};

// 리듀서
function memoReducer(state: MemoState, action: MemoAction): MemoState {
  switch (action.type) {
    case 'SET_MEMOS':
      return {
        ...state,
        memos: action.payload,
        filteredMemos: action.payload
      };
    
    case 'ADD_MEMO':
      return {
        ...state,
        memos: [action.payload, ...state.memos],
        filteredMemos: [action.payload, ...state.filteredMemos]
      };
    
    case 'UPDATE_MEMO':
      const updatedMemos = state.memos.map(memo =>
        memo.id === action.payload.id
          ? { ...memo, ...action.payload.memo, updatedAt: new Date().toISOString() }
          : memo
      );
      const updatedFilteredMemos = state.filteredMemos.map(memo =>
        memo.id === action.payload.id
          ? { ...memo, ...action.payload.memo, updatedAt: new Date().toISOString() }
          : memo
      );
      return {
        ...state,
        memos: updatedMemos,
        filteredMemos: updatedFilteredMemos,
        selectedMemo: state.selectedMemo?.id === action.payload.id
          ? { ...state.selectedMemo, ...action.payload.memo, updatedAt: new Date().toISOString() }
          : state.selectedMemo
      };
    
    case 'DELETE_MEMO':
      return {
        ...state,
        memos: state.memos.filter(memo => memo.id !== action.payload),
        filteredMemos: state.filteredMemos.filter(memo => memo.id !== action.payload),
        selectedMemo: state.selectedMemo?.id === action.payload ? null : state.selectedMemo
      };
    
    case 'SELECT_MEMO':
      return {
        ...state,
        selectedMemo: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'SET_SEARCH_KEYWORD':
      return {
        ...state,
        searchKeyword: action.payload
      };
    
    case 'SET_FILTERED_MEMOS':
      return {
        ...state,
        filteredMemos: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Context 생성
interface MemoContextType {
  state: MemoState;
  dispatch: React.Dispatch<MemoAction>;
  // 편의 메서드들
  setMemos: (memos: Memo[]) => void;
  addMemo: (memo: Memo) => void;
  updateMemo: (id: string, memo: Partial<Memo>) => void;
  deleteMemo: (id: string) => void;
  selectMemo: (memo: Memo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setFilteredMemos: (memos: Memo[]) => void;
  clearError: () => void;
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

// Provider 컴포넌트
interface MemoProviderProps {
  children: ReactNode;
}

export function MemoProvider({ children }: MemoProviderProps) {
  const [state, dispatch] = useReducer(memoReducer, initialState);
  const { state: authState } = useAuthContext();

  // Firebase 실시간 리스너 설정
  useEffect(() => {
    if (!authState.user) {
      return;
    }

    console.log('Firebase 실시간 리스너 설정 중...');
    const unsubscribe = subscribeToCollection<Memo>(
      'memos',
      (memos) => {
        console.log('실시간 메모 업데이트:', memos);
        dispatch({ type: 'SET_MEMOS', payload: memos });
      },
      {
        userId: authState.user.uid,
        orderByField: 'updatedAt',
        orderDirection: 'desc'
      }
    );

    return () => {
      console.log('Firebase 실시간 리스너 해제');
      unsubscribe();
    };
  }, [authState.user]);

  // 편의 메서드들
  const setMemos = useCallback((memos: Memo[]) => {
    dispatch({ type: 'SET_MEMOS', payload: memos });
  }, []);

  const addMemo = useCallback((memo: Memo) => {
    dispatch({ type: 'ADD_MEMO', payload: memo });
  }, []);

  const updateMemo = useCallback((id: string, memo: Partial<Memo>) => {
    dispatch({ type: 'UPDATE_MEMO', payload: { id, memo } });
  }, []);

  const deleteMemo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MEMO', payload: id });
  }, []);

  const selectMemo = useCallback((memo: Memo | null) => {
    dispatch({ type: 'SELECT_MEMO', payload: memo });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setSearchKeyword = useCallback((keyword: string) => {
    dispatch({ type: 'SET_SEARCH_KEYWORD', payload: keyword });
  }, []);

  const setFilteredMemos = useCallback((memos: Memo[]) => {
    dispatch({ type: 'SET_FILTERED_MEMOS', payload: memos });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: MemoContextType = {
    state,
    dispatch,
    setMemos,
    addMemo,
    updateMemo,
    deleteMemo,
    selectMemo,
    setLoading,
    setError,
    setSearchKeyword,
    setFilteredMemos,
    clearError
  };

  return (
    <MemoContext.Provider value={value}>
      {children}
    </MemoContext.Provider>
  );
}

// Hook
export function useMemoContext() {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemoContext must be used within a MemoProvider');
  }
  return context;
}

// 선택적 Hook (Provider 없이도 사용 가능)
export function useMemoContextOptional() {
  const context = useContext(MemoContext);
  return context;
} 