/**
 * Enhanced renderer process utilities - index file
 * Exports all renderer utilities in a convenient way
 */

export {
  AnimationManager,
  type AnimationOptions,
  animations,
  type KeyframeSequence,
  type Transition,
} from './animations';
export {
  ApiClient,
  type ApiError,
  type ApiResponse,
  api,
  apiUtils,
  type CacheEntry,
  type RequestOptions,
} from './api';
export {
  DOMManager,
  dom,
  type ElementAttributes,
  type ElementSelector,
  type ElementStyle,
} from './dom';
export {
  type CustomEventData,
  EventBus,
  EventManager,
  type EventSubscription,
  events,
  type StateChangeEvent,
} from './events';
export {
  type StorageItem,
  StorageManager,
  type StorageOptions,
  type StorageStats,
  storage,
} from './storage';

// Re-export commonly used browser APIs with enhanced functionality
export const browser = {
  // Location utilities
  getLocation: () => ({
    href: window.location.href,
    origin: window.location.origin,
    protocol: window.location.protocol,
    host: window.location.host,
    hostname: window.location.hostname,
    port: window.location.port,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }),

  // Navigation utilities
  navigate: (url: string, newTab: boolean = false) => {
    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },

  // Reload page
  reload: (force: boolean = false) => {
    window.location.reload(force);
  },

  // Viewport utilities
  getViewport: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }),

  // Screen utilities
  getScreen: () => ({
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
  }),

  // User agent info
  getUserAgent: () => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  }),

  // Online/Offline events
  onOnline: (callback: () => void) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },

  onOffline: (callback: () => void) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  },
};

// Performance utilities
export const performance = {
  /**
   * Measure function execution time
   */
  measure: async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Create performance mark
   */
  mark: (name: string) => {
    window.performance.mark(name);
  },

  /**
   * Measure between marks
   */
  measureBetween: (name: string, startMark: string, endMark: string): number => {
    window.performance.measure(name, startMark, endMark);
    const entries = window.performance.getEntriesByName(name, 'measure');
    return entries[entries.length - 1]?.duration || 0;
  },

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage: () => {
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};

// Utility functions for common tasks
export const utils = {
  /**
   * Delay execution
   */
  delay: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Generate unique ID
   */
  generateId: (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map((item) => utils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (Object.hasOwn(obj, key)) {
          clonedObj[key] = utils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    fn: T,
    wait: number,
    immediate: boolean = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          fn(...args);
        }
      }, wait);

      if (callNow) {
        fn(...args);
      }
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  /**
   * Format date
   */
  formatDate: (date: Date | string | number, format: string = 'ISO'): string => {
    const d = new Date(date);

    switch (format) {
      case 'ISO':
        return d.toISOString();
      case 'locale':
        return d.toLocaleDateString();
      case 'locale-time':
        return d.toLocaleString();
      case 'time':
        return d.toLocaleTimeString();
      case 'date':
        return d.toLocaleDateString();
      default:
        return d.toString();
    }
  },

  /**
   * Get timestamp string
   */
  getTimestamp: (): string => new Date().toISOString(),

  /**
   * Validate URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate email
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Sanitize HTML
   */
  sanitizeHtml: (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  /**
   * Copy to clipboard
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  },

  /**
   * Download file
   */
  downloadFile: (content: string, filename: string, mimeType: string = 'text/plain'): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Get element bounding rect with better precision
   */
  getBoundingRect: (element: Element): DOMRect => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      toJSON: rect.toJSON.bind(rect),
    };
  },

  /**
   * Check if element is in viewport
   */
  isInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  },

  /**
   * Get computed style with property fallbacks
   */
  getComputedStyle: (element: Element, property: string, ...fallbacks: string[]): string => {
    const styles = window.getComputedStyle(element);
    let value = styles.getPropertyValue(property);

    if (!value || value === 'initial') {
      for (const fallback of fallbacks) {
        value = styles.getPropertyValue(fallback);
        if (value && value !== 'initial') {
          break;
        }
      }
    }

    return value;
  },
};

// Constants for common values
export const constants = {
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE: 1200,
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
  STORAGE_KEYS: {
    USER_SETTINGS: 'user_settings',
    THEME: 'theme',
    LANGUAGE: 'language',
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
  },
  EVENT_NAMES: {
    RESIZE: 'resize',
    SCROLL: 'scroll',
    CLICK: 'click',
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    MOUSEMOVE: 'mousemove',
    FOCUS: 'focus',
    BLUR: 'blur',
    CHANGE: 'change',
    SUBMIT: 'submit',
  },
};

// Environment detection
export const environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Browser detection
  isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
  isFirefox: /Firefox/.test(navigator.userAgent),
  isSafari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
  isEdge: /Edg/.test(navigator.userAgent),

  // Platform detection
  isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
  isDesktop: !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

  // Feature detection
  supportsWebGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  })(),

  supportsWebAssembly: typeof WebAssembly === 'object',

  supportsServiceWorker: 'serviceWorker' in navigator,

  supportsNotification: 'Notification' in window,

  supportsGeolocation: 'geolocation' in navigator,

  supportsCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
};

export * from './state';
export * from './ui-utils';
// Export enhanced utility functions
export * from './utils-enhanced';
// Note: storage is already exported from the original storage module
