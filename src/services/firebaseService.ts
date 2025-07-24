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
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
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
  // 실제 구현에서는 AuthContext와 연동 필요
  // 임시로 localStorage에서 가져오지만, 추후 AuthContext와 연동 예정
  return localStorage.getItem('current_user_id');
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
  getFileDownloadURL
}; 