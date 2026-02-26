export * from './error.types';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntryPayload {
  timestamp?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  namespace: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface BackendLogEntry extends LogEntryPayload {
  source?: 'backend' | 'frontend';
}

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

export interface MessageOptions {
  type: 'none' | 'info' | 'warning' | 'error' | 'question';
  title: string;
  message: string;
}

export interface BackendStats {
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  app: {
    name: string;
    version: string;
  };
  runtime: {
    node: string;
    electron: string;
    chrome: string;
  };
  platform: {
    platform: string;
    arch: string;
    pid: number;
  };
  windows: {
    count: number;
  };
  eventBus: {
    totalPublished: number;
    totalReceived: number;
    activeSubscriptions: number;
    historySize: number;
    avgHandlingTime: number;
    eventsByChannel: Record<string, number>;
  };
}

export interface ElectronAPI {
  log: (entry: LogEntryPayload) => Promise<{ success: boolean }>;
  getLogLevel: () => Promise<LogLevel>;
  setLogLevel: (level: LogLevel) => Promise<{ success: boolean; level: LogLevel }>;
  getAppInfo: () => Promise<AppInfo>;
  showMessage: (options: MessageOptions) => Promise<unknown>;
  getBackendStats: () => Promise<{ stats: BackendStats }>;
  getBackendLogs: (limit?: number) => Promise<{ logs: BackendLogEntry[] }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
