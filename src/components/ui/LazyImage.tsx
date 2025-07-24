import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer 설정
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(imgElement);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imgElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // 이미지 로드 핸들러
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // 이미지 에러 핸들러
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // 이미지가 뷰포트에 들어왔을 때 로드
  useEffect(() => {
    if (isInView && imgRef.current) {
      imgRef.current.src = src;
    }
  }, [isInView, src]);

  // 기본 플레이스홀더
  const defaultPlaceholder = (
    <div className="bg-gray-200 animate-pulse flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    </div>
  );

  // 기본 폴백
  const defaultFallback = (
    <div className="bg-gray-100 flex items-center justify-center text-gray-500">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <div className={`lazy-image ${className}`}>
      {!isInView && (placeholder || defaultPlaceholder)}
      
      {isInView && !isLoaded && !hasError && (placeholder || defaultPlaceholder)}
      
      {isInView && hasError && (fallback || defaultFallback)}
      
      {isInView && !hasError && (
        <img
          ref={imgRef}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default LazyImage; 