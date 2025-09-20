import { useCallback, useEffect, useState } from 'react';

const storageAvailable = typeof window !== 'undefined' && 'localStorage' in window;

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback((): T => {
    if (!storageAvailable) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;

        if (storageAvailable) {
          try {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          } catch (error) {
            console.error('Gegevens konden niet opgeslagen worden in localStorage', error);
          }
        }

        return nextValue;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
