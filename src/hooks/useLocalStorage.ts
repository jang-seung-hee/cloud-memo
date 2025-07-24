import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  key: string;
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: Partial<UseLocalStorageOptions<T>>
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse
  } = options || {};

  // 초기값 로드
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // 로컬스토리지에 값 저장
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serializer, storedValue]);

  // 로컬스토리지에서 값 제거
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // 다른 탭에서의 변경사항 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer]);

  return [storedValue, setValue, removeValue];
}

// 배열 형태의 로컬스토리지 훅
export function useLocalStorageArray<T>(
  key: string,
  defaultValue: T[] = []
): [T[], (value: T[] | ((prev: T[]) => T[])) => void, () => void] {
  return useLocalStorage<T[]>(key, defaultValue);
}

// 객체 형태의 로컬스토리지 훅
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useLocalStorage<T>(key, defaultValue);
}

// 문자열 형태의 로컬스토리지 훅
export function useLocalStorageString(
  key: string,
  defaultValue: string = ''
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  return useLocalStorage<string>(key, defaultValue, {
    serializer: (value) => value,
    deserializer: (value) => value
  });
}

// 숫자 형태의 로컬스토리지 훅
export function useLocalStorageNumber(
  key: string,
  defaultValue: number = 0
): [number, (value: number | ((prev: number) => number)) => void, () => void] {
  return useLocalStorage<number>(key, defaultValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => Number(value)
  });
}

// 불린 형태의 로컬스토리지 훅
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean = false
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void, () => void] {
  return useLocalStorage<boolean>(key, defaultValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => value === 'true'
  });
} 