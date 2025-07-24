// 이미지 처리 관련 타입 정의
export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  aspectRatio: number;
}

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  quality?: number;
}

// 지원하는 이미지 타입
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
] as const;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif'
] as const;

// 기본 설정값
export const DEFAULT_IMAGE_OPTIONS: Required<ImageProcessingOptions> = {
  maxWidth: 1280,
  maxHeight: 720,
  quality: 0.8,
  format: 'jpeg',
  maintainAspectRatio: true
};

export const DEFAULT_THUMBNAIL_OPTIONS: Required<ThumbnailOptions> = {
  width: 200,
  height: 200,
  quality: 0.7,
  format: 'jpeg'
};

export const DEFAULT_CAMERA_OPTIONS: Required<CameraOptions> = {
  facingMode: 'environment',
  width: 1280,
  height: 720,
  quality: 0.8
};

// 에러 메시지
const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: '지원하지 않는 이미지 형식입니다.',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
  PROCESSING_FAILED: '이미지 처리에 실패했습니다.',
  CANVAS_NOT_SUPPORTED: 'Canvas를 지원하지 않는 브라우저입니다.',
  FILE_READ_ERROR: '파일 읽기에 실패했습니다.',
  INVALID_DIMENSIONS: '유효하지 않은 이미지 크기입니다.',
  CAMERA_NOT_SUPPORTED: '카메라를 지원하지 않는 브라우저입니다.',
  CAMERA_PERMISSION_DENIED: '카메라 접근 권한이 거부되었습니다.',
  FILE_SELECTION_CANCELLED: '파일 선택이 취소되었습니다.'
} as const;

// 파일 크기 제한 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 유틸리티 함수들
export const validateImageFile = (file: File): boolean => {
  // 파일 타입 검증
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return false;
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  return true;
};

export const getImageInfo = (file: File): Promise<ImageInfo> => {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        aspectRatio: img.width / img.height
      });
    };

    img.onerror = () => {
      reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  maintainAspectRatio: boolean = true
): { width: number; height: number } => {
  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      if (maxWidth / aspectRatio <= maxHeight) {
        return {
          width: maxWidth,
          height: Math.round(maxWidth / aspectRatio)
        };
      } else {
        return {
          width: Math.round(maxHeight * aspectRatio),
          height: maxHeight
        };
      }
    }
  }

  return {
    width: Math.min(originalWidth, maxWidth),
    height: Math.min(originalHeight, maxHeight)
  };
};

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error(ERROR_MESSAGES.CANVAS_NOT_SUPPORTED);
  }
  return ctx;
};

// 이미지 압축 함수
export const compressImage = (
  file: File,
  options: Partial<ImageProcessingOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 파일 검증
      if (!validateImageFile(file)) {
        reject(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
        return;
      }

      // 옵션 병합
      const opts = { ...DEFAULT_IMAGE_OPTIONS, ...options };

      // 이미지 정보 가져오기
      const imageInfo = await getImageInfo(file);
      
      // 새로운 크기 계산
      const { width, height } = calculateDimensions(
        imageInfo.width,
        imageInfo.height,
        opts.maxWidth,
        opts.maxHeight,
        opts.maintainAspectRatio
      );

      // Canvas 생성
      const canvas = createCanvas(width, height);
      const ctx = getCanvasContext(canvas);

      // 이미지 로드 및 그리기
      const img = new globalThis.Image();
      img.onload = () => {
        try {
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, width, height);

          // 압축된 이미지 데이터 URL 생성
          const mimeType = `image/${opts.format}`;
          const dataUrl = canvas.toDataURL(mimeType, opts.quality);

          // File 객체 생성
          const compressedFile = dataUrlToFile(dataUrl, file.name, mimeType);

          // 압축된 이미지 정보
          const compressedInfo: ImageInfo = {
            width,
            height,
            size: compressedFile.size,
            type: mimeType,
            aspectRatio: width / height
          };

          resolve({
            dataUrl,
            file: compressedFile,
            info: compressedInfo
          });
        } catch (error) {
          reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
        }
      };

      img.onerror = () => {
        reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// 이미지 리사이징 함수
export const resizeImage = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  options: Partial<ImageProcessingOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 파일 검증
      if (!validateImageFile(file)) {
        reject(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
        return;
      }

      // 크기 검증
      if (targetWidth <= 0 || targetHeight <= 0) {
        reject(new Error(ERROR_MESSAGES.INVALID_DIMENSIONS));
        return;
      }

      // 옵션 병합
      const opts = { ...DEFAULT_IMAGE_OPTIONS, ...options };

      // Canvas 생성
      const canvas = createCanvas(targetWidth, targetHeight);
      const ctx = getCanvasContext(canvas);

      // 이미지 로드 및 그리기
      const img = new globalThis.Image();
      img.onload = () => {
        try {
          // 이미지 그리기 (크기 조정)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // 리사이즈된 이미지 데이터 URL 생성
          const mimeType = `image/${opts.format}`;
          const dataUrl = canvas.toDataURL(mimeType, opts.quality);

          // File 객체 생성
          const resizedFile = dataUrlToFile(dataUrl, file.name, mimeType);

          // 리사이즈된 이미지 정보
          const resizedInfo: ImageInfo = {
            width: targetWidth,
            height: targetHeight,
            size: resizedFile.size,
            type: mimeType,
            aspectRatio: targetWidth / targetHeight
          };

          resolve({
            dataUrl,
            file: resizedFile,
            info: resizedInfo
          });
        } catch (error) {
          reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
        }
      };

      img.onerror = () => {
        reject(new Error(ERROR_MESSAGES.PROCESSING_FAILED));
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// 썸네일 생성 함수
export const generateThumbnail = (
  file: File,
  options: Partial<ThumbnailOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 파일 검증
      if (!validateImageFile(file)) {
        reject(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
        return;
      }

      // 옵션 병합
      const opts = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };

      // 썸네일 생성 (정사각형 크롭)
      const result = await resizeImage(file, opts.width, opts.height, {
        quality: opts.quality,
        format: opts.format,
        maintainAspectRatio: false
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

// Base64 인코딩 함수
export const encodeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.FILE_READ_ERROR));
    };

    reader.readAsDataURL(file);
  });
};

// Base64 디코딩 함수
export const decodeImage = (dataUrl: string): File => {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], 'image.jpg', { type: mime });
  } catch (error) {
    throw new Error(ERROR_MESSAGES.PROCESSING_FAILED);
  }
};

// Data URL을 File 객체로 변환
export const dataUrlToFile = (dataUrl: string, filename: string, mimeType: string): File => {
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mimeType });
};

// 이미지 품질 자동 조정 (파일 크기 기반)
export const autoAdjustQuality = async (
  file: File,
  targetSize: number = 1024 * 1024, // 1MB
  maxAttempts: number = 5
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  let quality = 0.8;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const result = await compressImage(file, { quality });
      
      if (result.file.size <= targetSize) {
        return result;
      }

      // 품질을 10%씩 감소
      quality = Math.max(0.1, quality - 0.1);
      attempt++;
    } catch (error) {
      throw error;
    }
  }

  // 최소 품질로 압축
  return compressImage(file, { quality: 0.1 });
};

// 카메라로 이미지 촬영
export const captureImage = (
  options: Partial<CameraOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 카메라 지원 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error(ERROR_MESSAGES.CAMERA_NOT_SUPPORTED));
        return;
      }

      const opts = { ...DEFAULT_CAMERA_OPTIONS, ...options };

      // 카메라 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: opts.facingMode,
          width: { ideal: opts.width },
          height: { ideal: opts.height }
        }
      });

      // 비디오 요소 생성
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;

      // 비디오 로드 완료 대기
      await new Promise<void>((resolveVideo) => {
        video.onloadedmetadata = () => resolveVideo();
      });

      // Canvas 생성
      const canvas = createCanvas(video.videoWidth, video.videoHeight);
      const ctx = getCanvasContext(canvas);

      // 비디오 프레임을 Canvas에 그리기
      ctx.drawImage(video, 0, 0);

      // 스트림 정지
      stream.getTracks().forEach(track => track.stop());

      // 이미지 데이터 URL 생성
      const dataUrl = canvas.toDataURL(`image/${DEFAULT_IMAGE_OPTIONS.format}`, opts.quality);

      // File 객체 생성
      const file = dataUrlToFile(dataUrl, `camera_${Date.now()}.jpg`, `image/${DEFAULT_IMAGE_OPTIONS.format}`);

      // 이미지 정보
      const info: ImageInfo = {
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        type: `image/${DEFAULT_IMAGE_OPTIONS.format}`,
        aspectRatio: video.videoWidth / video.videoHeight
      };

      resolve({
        dataUrl,
        file,
        info
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        reject(new Error(ERROR_MESSAGES.CAMERA_PERMISSION_DENIED));
      } else {
        reject(error);
      }
    }
  });
};

// 갤러리에서 이미지 선택
export const selectImage = (
  options: Partial<ImageProcessingOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise((resolve, reject) => {
    try {
      // 파일 입력 요소 생성
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = SUPPORTED_IMAGE_TYPES.join(',');
      // capture 속성은 설정하지 않음 (갤러리 선택)

      input.onchange = async (event) => {
        try {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];

          if (!file) {
            reject(new Error(ERROR_MESSAGES.FILE_SELECTION_CANCELLED));
            return;
          }

          // 파일 검증
          if (!validateImageFile(file)) {
            reject(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
            return;
          }

          // 이미지 압축 처리
          const result = await compressImage(file, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new Error(ERROR_MESSAGES.FILE_SELECTION_CANCELLED));
      };

      // 파일 선택 다이얼로그 열기
      input.click();
    } catch (error) {
      reject(error);
    }
  });
};

// 카메라로 직접 촬영 (capture 속성 사용)
export const captureImageDirect = (
  options: Partial<ImageProcessingOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo }> => {
  return new Promise((resolve, reject) => {
    try {
      // 파일 입력 요소 생성 (카메라 캡처)
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // 후면 카메라

      input.onchange = async (event) => {
        try {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];

          if (!file) {
            reject(new Error(ERROR_MESSAGES.FILE_SELECTION_CANCELLED));
            return;
          }

          // 파일 검증
          if (!validateImageFile(file)) {
            reject(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
            return;
          }

          // 이미지 압축 처리
          const result = await compressImage(file, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new Error(ERROR_MESSAGES.FILE_SELECTION_CANCELLED));
      };

      // 카메라 앱 열기
      input.click();
    } catch (error) {
      reject(error);
    }
  });
};

// 이미지 처리 통합 함수
export const processImage = async (
  source: File | 'camera' | 'gallery' | 'capture',
  options: Partial<ImageProcessingOptions> = {}
): Promise<{ dataUrl: string; file: File; info: ImageInfo; thumbnail?: { dataUrl: string; file: File; info: ImageInfo } }> => {
  try {
    let result: { dataUrl: string; file: File; info: ImageInfo };

    // 소스에 따른 이미지 가져오기
    if (source instanceof File) {
      // 파일이 직접 전달된 경우
      if (!validateImageFile(source)) {
        throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
      }
      result = await compressImage(source, options);
    } else {
      switch (source) {
        case 'camera':
          result = await captureImage();
          break;
        case 'gallery':
          result = await selectImage(options);
          break;
        case 'capture':
          result = await captureImageDirect(options);
          break;
        default:
          throw new Error('지원하지 않는 이미지 소스입니다.');
      }
    }

    // 썸네일 생성
    const thumbnail = await generateThumbnail(result.file);

    return {
      ...result,
      thumbnail
    };
  } catch (error) {
    throw error;
  }
}; 