/**
 * Main process utilities - index file
 * Exports all main process utilities in a convenient way
 */

export {
  type AppInfo,
  AppManager,
  appManager,
  type DialogOptions,
  type SystemInfo,
} from './app-manager';
export { FileSystemManager, fileSystem } from './filesystem';
export { type IPCChannel, IPCManager, type IPCResponse, ipc } from './ipc';
export {
  WindowManager,
  type WindowOptions,
  type WindowState,
  windowManager,
} from './window-manager';

export {
  ConfigManager,
  FeatureFlagsManager,
  EnvironmentConfig,
  type ConfigOptions,
  type ConfigWatcher,
  type FeatureFlag,
} from './config';

// Re-export commonly used Electron modules
export const electron = {
  app: require('electron').app,
  BrowserWindow: require('electron').BrowserWindow,
  ipcMain: require('electron').ipcMain,
  dialog: require('electron').dialog,
  shell: require('electron').shell,
  Menu: require('electron').Menu,
  MenuItem: require('electron').MenuItem,
  screen: require('electron').screen,
  crashReporter: require('electron').crashReporter,
  nativeImage: require('electron').nativeImage,
  clipboard: require('electron').clipboard,
  globalShortcut: require('electron').globalShortcut,
  autoUpdater: require('electron').autoUpdater,
  net: require('electron').net,
  protocol: require('electron').protocol,
};

// Re-export Node.js modules commonly used in main process
export const node = {
  fs: require('node:fs'),
  path: require('node:path'),
  url: require('node:url'),
  os: require('node:os'),
  crypto: require('node:crypto'),
  util: require('node:util'),
  events: require('node:events'),
  stream: require('node:stream'),
  child_process: require('node:child_process'),
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
   * Get timestamp string
   */
  getTimestamp: (): string => new Date().toISOString(),

  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => JSON.parse(JSON.stringify(obj)),

  /**
   * Retry function with exponential backoff
   */
  retry: async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (attempt === maxAttempts) {
          throw error;
        }

        const delay = baseDelay * 2 ** (attempt - 1);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retry attempts exceeded');
  },
};

// Constants for common values
export const constants = {
  WINDOW_MIN_WIDTH: 400,
  WINDOW_MIN_HEIGHT: 300,
  WINDOW_DEFAULT_WIDTH: 1200,
  WINDOW_DEFAULT_HEIGHT: 800,
  IPC_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
};
