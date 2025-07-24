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

  // 메모리 기반 상태 관리 (로컬스토리지 비활성화)
  const [storedValue, setStoredValue] = useState<T>(() => {
    console.log(`메모리 기반 상태 관리 사용: ${key}`);
    return defaultValue;
  });

  // 값 설정 (메모리만)
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      console.log(`메모리 상태 업데이트: ${key}`, valueToStore);
    } catch (error) {
      console.error(`Error setting memory state for key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 값 제거 (메모리만)
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      console.log(`메모리 상태 초기화: ${key}`);
    } catch (error) {
      console.error(`Error resetting memory state for key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // 다른 탭에서의 변경사항 감지 비활성화
  useEffect(() => {
    console.log(`메모리 기반 상태 관리 활성화: ${key}`);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// 배열 형태의 메모리 상태 훅
export function useLocalStorageArray<T>(
  key: string,
  defaultValue: T[] = []
): [T[], (value: T[] | ((prev: T[]) => T[])) => void, () => void] {
  return useLocalStorage<T[]>(key, defaultValue);
}

// 객체 형태의 메모리 상태 훅
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useLocalStorage<T>(key, defaultValue);
}

// 문자열 형태의 메모리 상태 훅
export function useLocalStorageString(
  key: string,
  defaultValue: string = ''
): [string, (value: string | ((prev: string) => string)) => void, () => void] {
  return useLocalStorage<string>(key, defaultValue, {
    serializer: (value) => value,
    deserializer: (value) => value
  });
}

// 숫자 형태의 메모리 상태 훅
export function useLocalStorageNumber(
  key: string,
  defaultValue: number = 0
): [number, (value: number | ((prev: number) => number)) => void, () => void] {
  return useLocalStorage<number>(key, defaultValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => Number(value)
  });
}

// 불린 형태의 메모리 상태 훅
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean = false
): [boolean, (value: boolean | ((prev: boolean) => boolean)) => void, () => void] {
  return useLocalStorage<boolean>(key, defaultValue, {
    serializer: (value) => value.toString(),
    deserializer: (value) => value === 'true'
  });
} 