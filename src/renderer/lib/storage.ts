/**
 * Storage utility functions for Electron renderer process
 */

/**
 * Save data to localStorage with error handling
 */
export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Load data from localStorage with error handling
 */
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Failed to load from localStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Save data to sessionStorage with error handling
 */
export function saveToSessionStorage(key: string, data: any): boolean {
  try {
    const serializedData = JSON.stringify(data);
    sessionStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Failed to save to sessionStorage: ${key}`, error);
    return false;
  }
}

/**
 * Load data from sessionStorage with error handling
 */
export function loadFromSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedData = sessionStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Failed to load from sessionStorage: ${key}`, error);
    return defaultValue;
  }
}

/**
 * Remove item from sessionStorage
 */
export function removeFromSessionStorage(key: string): boolean {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from sessionStorage: ${key}`, error);
    return false;
  }
}

/**
 * Clear all localStorage data
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage', error);
    return false;
  }
}

/**
 * Clear all sessionStorage data
 */
export function clearSessionStorage(): boolean {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Failed to clear sessionStorage', error);
    return false;
  }
}

/**
 * Check if storage is available (localStorage or sessionStorage)
 */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get storage usage information
 */
export function getStorageUsage(): {
  localStorage: { used: number; total: number };
  sessionStorage: { used: number; total: number };
} {
  const estimateStorage = (storage: Storage): { used: number; total: number } => {
    let used = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)!;
      const value = storage.getItem(key)!;
      used += new Blob([key]).size + new Blob([value]).size;
    }
    // Approximate total storage (browser dependent, typically 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB as approximation
    return { used, total };
  };

  return {
    localStorage: estimateStorage(localStorage),
    sessionStorage: estimateStorage(sessionStorage),
  };
}
