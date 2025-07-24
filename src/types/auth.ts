/**
 * 인증 관련 타입 정의
 */

import { User as FirebaseUser } from 'firebase/auth';

// 사용자 정보 타입
export interface User {
  /** 사용자 고유 ID */
  uid: string;
  /** 이메일 주소 */
  email: string | null;
  /** 표시 이름 */
  displayName: string | null;
  /** 프로필 이미지 URL */
  photoURL: string | null;
  /** 이메일 인증 여부 */
  emailVerified: boolean;
  /** 계정 생성 시간 */
  createdAt: Date;
  /** 마지막 로그인 시간 */
  lastLoginAt: Date;
}

// 인증 상태 타입
export interface AuthState {
  /** 현재 사용자 정보 */
  user: User | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 오류 메시지 */
  error: string | null;
  /** 초기화 완료 여부 */
  isInitialized: boolean;
}

// 로그인 요청 타입
export interface LoginRequest {
  /** 로그인 방법 */
  method: 'google' | 'email';
  /** 이메일 (email 로그인 시) */
  email?: string;
  /** 비밀번호 (email 로그인 시) */
  password?: string;
}

// 회원가입 요청 타입
export interface SignUpRequest {
  /** 이메일 */
  email: string;
  /** 비밀번호 */
  password: string;
  /** 표시 이름 */
  displayName?: string;
}

// Firebase User를 User 타입으로 변환하는 유틸리티 함수
export const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
  };
}; 