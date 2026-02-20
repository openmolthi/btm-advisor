import { useState, useEffect } from 'react';

/**
 * useState wrapper that syncs to localStorage.
 * Reads initial value from localStorage, writes on every change.
 * 
 * @param {string} key - localStorage key
 * @param {*} defaultValue - fallback if nothing stored
 * @param {boolean} isJson - whether to JSON.parse/stringify (default: true for objects/arrays)
 */
export function usePersistedState(key, defaultValue) {
  const isJson = typeof defaultValue === 'object' || Array.isArray(defaultValue);
  
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return isJson ? JSON.parse(saved) : saved;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (isJson) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // localStorage full or unavailable
    }
  }, [key, value, isJson]);

  const clear = () => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  };

  return [value, setValue, clear];
}
