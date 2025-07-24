import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';
import { 
  ERROR_MESSAGES, 
  STORAGE_LIMITS,
  safeJsonStringify, 
  StorageError 
} from './localStorageService';

// Firebase 컬렉션 이름
const COLLECTIONS = {
  MEMOS: 'memos',
  TEMPLATES: 'templates',
  IMAGES: 'images',
  USERS: 'users'
} as const;

// Firebase 에러 메시지
const FIREBASE_ERROR_MESSAGES = {
  ...ERROR_MESSAGES,
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  PERMISSION_DENIED: '접근 권한이 없습니다.',
  NOT_FOUND: '데이터를 찾을 수 없습니다.',
  ALREADY_EXISTS: '이미 존재하는 데이터입니다.',
  UNAUTHENTICATED: '로그인이 필요합니다.',
  UPLOAD_FAILED: '파일 업로드에 실패했습니다.',
  DOWNLOAD_FAILED: '파일 다운로드에 실패했습니다.'
} as const;

// Firebase 제한사항
const FIREBASE_LIMITS = {
  ...STORAGE_LIMITS,
  MAX_BATCH_SIZE: 500,
  MAX_QUERY_LIMIT: 1000,
  MAX_DOCUMENT_SIZE: 1 * 1024 * 1024, // 1MB
  MAX_FIELD_SIZE: 1 * 1024 * 1024 // 1MB
} as const;

// Firebase 유틸리티 함수들
const isFirebaseAvailable = (): boolean => {
  try {
    return !!db && !!storage;
  } catch {
    return false;
  }
};

const getCurrentUserId = (): string | null => {
  // AuthContext에서 사용자 ID를 가져오는 로직
  // Firebase Auth에서 현재 인증된 사용자 ID를 가져옴
  try {
    const currentUser = auth.currentUser;
    return currentUser?.uid || null;
  } catch {
    return null;
  }
};

const validateFirebaseData = (data: unknown): boolean => {
  if (!data) return false;
  
  const dataSize = safeJsonStringify(data)?.length || 0;
  return dataSize <= FIREBASE_LIMITS.MAX_DOCUMENT_SIZE;
};

const convertTimestampToDate = (timestamp: Timestamp | Date | string): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// 네트워크 상태 감지
const isOnline = (): boolean => {
  return navigator.onLine;
};

// 네트워크 상태 변경 리스너
const addNetworkStatusListener = (callback: (isOnline: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Firebase 연결 상태 확인
const checkFirebaseConnection = async (): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    return false;
  }
  
  try {
    // 간단한 쿼리로 연결 상태 확인
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    console.warn('Firebase 연결 확인 실패:', error);
    return false;
  }
};

// Firestore CRUD 기본 함수들
const createDocument = async <T extends { id?: string }>(
  collectionName: string, 
  data: Omit<T, 'id'>
): Promise<T> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (!validateFirebaseData(data)) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.DATA_TOO_LARGE, 'DATA_TOO_LARGE');
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    const docData = {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, collectionName), docData);
    
    return {
      ...data,
      id: docRef.id
    } as T;
  } catch (error) {
    console.error('Firestore 문서 생성 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

const getDocument = async <T>(
  collectionName: string, 
  documentId: string
): Promise<T | null> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.PERMISSION_DENIED, 'PERMISSION_DENIED');
    }

    return {
      id: docSnap.id,
      ...data
    } as T;
  } catch (error) {
    console.error('Firestore 문서 조회 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

const updateDocument = async <T>(
  collectionName: string, 
  documentId: string, 
  data: Partial<T>
): Promise<T> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (!validateFirebaseData(data)) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.DATA_TOO_LARGE, 'DATA_TOO_LARGE');
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.NOT_FOUND, 'NOT_FOUND');
    }

    const existingData = docSnap.data();
    if (existingData.userId !== userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.PERMISSION_DENIED, 'PERMISSION_DENIED');
    }

    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, updateData);

    return {
      id: documentId,
      ...existingData,
      ...data
    } as T;
  } catch (error) {
    console.error('Firestore 문서 업데이트 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

const deleteDocument = async (
  collectionName: string, 
  documentId: string
): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.PERMISSION_DENIED, 'PERMISSION_DENIED');
    }

    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Firestore 문서 삭제 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

const getDocuments = async <T>(
  collectionName: string,
  options?: {
    userId?: string;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  }
): Promise<T[]> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const userId = options?.userId || getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    let q = query(
      collection(db, collectionName),
      where('userId', '==', userId)
    );

    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const querySnapshot = await getDocs(q);
    const documents: T[] = [];

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as T);
    });

    return documents;
  } catch (error) {
    console.error('Firestore 문서 목록 조회 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

// Firebase Storage 함수들
const uploadFile = async (
  file: File, 
  path: string
): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  if (file.size > FIREBASE_LIMITS.MAX_IMAGE_SIZE) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.IMAGE_TOO_LARGE, 'IMAGE_TOO_LARGE');
  }

  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new StorageError(FIREBASE_ERROR_MESSAGES.UNAUTHENTICATED, 'UNAUTHENTICATED');
    }

    const storageRef = ref(storage, `${userId}/${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage 파일 업로드 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.UPLOAD_FAILED,
      'UPLOAD_FAILED'
    );
  }
};

const deleteFile = async (url: string): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Firebase Storage 파일 삭제 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }
};

const getFileDownloadURL = async (path: string): Promise<string> => {
  if (!isFirebaseAvailable()) {
    throw new StorageError(FIREBASE_ERROR_MESSAGES.STORAGE_NOT_AVAILABLE, 'STORAGE_NOT_AVAILABLE');
  }

  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Firebase Storage 파일 다운로드 URL 조회 실패:', error);
    throw new StorageError(
      error instanceof Error ? error.message : FIREBASE_ERROR_MESSAGES.DOWNLOAD_FAILED,
      'DOWNLOAD_FAILED'
    );
  }
};

// Firebase 실시간 리스너 함수들
const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  options?: {
    userId?: string;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limitCount?: number;
  }
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    console.error('Firebase 사용 불가');
    return () => {};
  }

  try {
    const userId = options?.userId || getCurrentUserId();
    if (!userId) {
      console.error('사용자 ID 없음');
      return () => {};
    }

    let q = query(
      collection(db, collectionName),
      where('userId', '==', userId)
    );

    if (options?.orderByField) {
      q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents: T[] = [];
      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        } as T);
      });
      callback(documents);
    }, (error) => {
      console.error('실시간 리스너 오류:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('실시간 리스너 설정 실패:', error);
    return () => {};
  }
};

const subscribeToDocument = <T>(
  collectionName: string,
  documentId: string,
  callback: (data: T | null) => void
): Unsubscribe => {
  if (!isFirebaseAvailable()) {
    console.error('Firebase 사용 불가');
    return () => {};
  }

  try {
    const docRef = doc(db, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = {
          id: doc.id,
          ...doc.data()
        } as T;
        callback(data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('문서 실시간 리스너 오류:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('문서 실시간 리스너 설정 실패:', error);
    return () => {};
  }
};

export {
  COLLECTIONS,
  FIREBASE_ERROR_MESSAGES,
  FIREBASE_LIMITS,
  isFirebaseAvailable,
  getCurrentUserId,
  validateFirebaseData,
  convertTimestampToDate,
  convertDateToTimestamp,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  uploadFile,
  deleteFile,
  getFileDownloadURL,
  subscribeToCollection,
  subscribeToDocument,
  isOnline,
  addNetworkStatusListener,
  checkFirebaseConnection
}; 