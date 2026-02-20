import { useState, useEffect } from 'react';

/**
 * useState wrapper with automatic localStorage persistence.
 * @param {string} key - localStorage key
 * @param {any} defaultValue - default value if nothing in storage
 * @returns {[any, Function]} - [state, setState]
 */
export function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return defaultValue;
      return JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }, [key, state]);

  return [state, setState];
}
