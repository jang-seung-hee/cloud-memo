import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Image } from '../types/image';

// 상태 타입 정의
interface ImageState {
  images: Image[];
  isUploading: boolean;
  error: string | null;
  selectedImage: Image | null;
}

// 액션 타입 정의
type ImageAction =
  | { type: 'SET_IMAGES'; payload: Image[] }
  | { type: 'ADD_IMAGES'; payload: Image[] }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'REPLACE_IMAGE'; payload: { id: string; image: Image } }
  | { type: 'CLEAR_IMAGES' }
  | { type: 'SELECT_IMAGE'; payload: Image | null }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// 초기 상태
const initialState: ImageState = {
  images: [],
  isUploading: false,
  error: null,
  selectedImage: null
};

// 리듀서
function imageReducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'SET_IMAGES':
      return {
        ...state,
        images: action.payload
      };
    
    case 'ADD_IMAGES':
      return {
        ...state,
        images: [...state.images, ...action.payload]
      };
    
    case 'REMOVE_IMAGE':
      return {
        ...state,
        images: state.images.filter(img => img.id !== action.payload),
        selectedImage: state.selectedImage?.id === action.payload ? null : state.selectedImage
      };
    
    case 'REPLACE_IMAGE':
      return {
        ...state,
        images: state.images.map(img => 
          img.id === action.payload.id ? action.payload.image : img
        ),
        selectedImage: state.selectedImage?.id === action.payload.id 
          ? action.payload.image 
          : state.selectedImage
      };
    
    case 'CLEAR_IMAGES':
      return {
        ...state,
        images: [],
        selectedImage: null
      };
    
    case 'SELECT_IMAGE':
      return {
        ...state,
        selectedImage: action.payload
      };
    
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
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
interface ImageContextType {
  state: ImageState;
  dispatch: React.Dispatch<ImageAction>;
  // 편의 메서드들
  setImages: (images: Image[]) => void;
  addImages: (images: Image[]) => void;
  removeImage: (imageId: string) => void;
  replaceImage: (imageId: string, image: Image) => void;
  clearImages: () => void;
  selectImage: (image: Image | null) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getImageById: (imageId: string) => Image | undefined;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

// Provider 컴포넌트
interface ImageProviderProps {
  children: ReactNode;
}

export function ImageProvider({ children }: ImageProviderProps) {
  const [state, dispatch] = useReducer(imageReducer, initialState);

  // 편의 메서드들
  const setImages = useCallback((images: Image[]) => {
    dispatch({ type: 'SET_IMAGES', payload: images });
  }, []);

  const addImages = useCallback((images: Image[]) => {
    dispatch({ type: 'ADD_IMAGES', payload: images });
  }, []);

  const removeImage = useCallback((imageId: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: imageId });
  }, []);

  const replaceImage = useCallback((imageId: string, image: Image) => {
    dispatch({ type: 'REPLACE_IMAGE', payload: { id: imageId, image } });
  }, []);

  const clearImages = useCallback(() => {
    dispatch({ type: 'CLEAR_IMAGES' });
  }, []);

  const selectImage = useCallback((image: Image | null) => {
    dispatch({ type: 'SELECT_IMAGE', payload: image });
  }, []);

  const setUploading = useCallback((uploading: boolean) => {
    dispatch({ type: 'SET_UPLOADING', payload: uploading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const getImageById = useCallback((imageId: string): Image | undefined => {
    return state.images.find(img => img.id === imageId);
  }, [state.images]);

  const value: ImageContextType = {
    state,
    dispatch,
    setImages,
    addImages,
    removeImage,
    replaceImage,
    clearImages,
    selectImage,
    setUploading,
    setError,
    clearError,
    getImageById
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
}

// Hook
export function useImageContext() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
}

// 선택적 Hook (Provider 없이도 사용 가능)
export function useImageContextOptional() {
  const context = useContext(ImageContext);
  return context;
} 