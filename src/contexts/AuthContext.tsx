import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User, AuthState, LoginRequest, SignUpRequest } from '../types/auth';
import { mapFirebaseUser } from '../types/auth';

// 액션 타입 정의
type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// 초기 상태
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false
};

// 리듀서
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload
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

// Context 타입 정의
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  // 편의 메서드들
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props 타입
interface AuthProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Google 로그인
  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = mapFirebaseUser(result.user);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // 로그인 메서드
  const login = useCallback(async (request: LoginRequest) => {
    switch (request.method) {
      case 'google':
        await loginWithGoogle();
        break;
      case 'email':
        // 이메일 로그인은 추후 구현
        dispatch({ type: 'SET_ERROR', payload: '이메일 로그인은 아직 지원하지 않습니다.' });
        break;
      default:
        dispatch({ type: 'SET_ERROR', payload: '지원하지 않는 로그인 방법입니다.' });
    }
  }, [loginWithGoogle]);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await signOut(auth);
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '로그아웃에 실패했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // 오류 초기화
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // 인증 상태 변경 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user = mapFirebaseUser(firebaseUser);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Context 사용 훅
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// 선택적 Context 사용 훅 (Provider 외부에서 사용 가능)
export function useAuthContextOptional(): AuthContextType | undefined {
  return useContext(AuthContext);
} 