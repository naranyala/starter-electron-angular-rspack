export * from './error.types';

export interface LogEntryPayload {
  level: string;
  namespace: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface ElectronAPI {
  log: (entry: LogEntryPayload) => Promise<{ success: boolean }>;
  getLogLevel: () => Promise<string>;
  setLogLevel: (level: string) => Promise<{ success: boolean; level: string }>;
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    platform: string;
    arch: string;
  }>;
  showMessage: (options: {
    type: 'none' | 'info' | 'warning' | 'error' | 'question';
    title: string;
    message: string;
  }) => Promise<unknown>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
