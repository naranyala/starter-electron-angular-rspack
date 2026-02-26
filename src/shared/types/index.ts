export interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface MessageOptions {
  type: 'none' | 'info' | 'warning' | 'error' | 'question';
  title: string;
  message: string;
}

export interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

export interface SearchResult {
  matches: boolean;
  highlighted: string;
}

export interface Theme {
  name: string;
  bg: string;
  color: string;
}

export interface ThemeColors {
  color: string;
  bg: string;
}

export interface ContentTemplate {
  [key: string]: string[];
}

export interface KeywordMap {
  [key: string]: string;
}

export interface WindowConfig {
  width: number;
  height: number;
  x: string | number;
  y: string | number;
  background: string;
  border: number;
  html: string;
}

export interface BrowserWindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  webPreferences: {
    nodeIntegration: boolean;
    contextIsolation: boolean;
    preload: string;
  };
}

export interface PlatformInfo {
  isDev: boolean;
  platform: string;
  arch: string;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
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
  source: 'backend' | 'frontend';
}

export type LogEntryInput = Omit<LogEntry, 'source'>;
