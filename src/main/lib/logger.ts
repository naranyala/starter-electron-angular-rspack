import { app, type BrowserWindow, type IpcMainInvokeEvent, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id?: number;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  namespace: string;
  message: string;
  context: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  source: 'backend' | 'frontend';
}

export interface LoggerConfig {
  level: LogLevel;
  showSource?: boolean;
  prettyPrint?: boolean;
}

let config: LoggerConfig = {
  level: LogLevel.INFO,
  showSource: true,
  prettyPrint: true,
};

const LEVEL_PRIORITY: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getLevelPriority(level: string): number {
  return LEVEL_PRIORITY[level] ?? 0;
}

function shouldLog(level: string): boolean {
  return getLevelPriority(level) >= getLevelPriority(config.level);
}

function formatLogEntry(entry: LogEntry): string {
  const parts: string[] = [];

  if (config.showSource) {
    parts.push(`[${entry.source.toUpperCase()}]`);
  }

  parts.push(`[${entry.timestamp}]`);
  parts.push(`[${entry.level.toUpperCase()}]`);
  parts.push(`[${entry.namespace}]`);

  let line = parts.join(' ') + ' ' + entry.message;

  if (entry.context && Object.keys(entry.context).length > 0) {
    if (config.prettyPrint) {
      line += '\n  Context: ' + JSON.stringify(entry.context, null, 2).replace(/\n/g, '\n  ');
    } else {
      line += ' ' + JSON.stringify(entry.context);
    }
  }

  if (entry.error) {
    line += '\n  Error: ' + entry.error.name + ': ' + entry.error.message;
    if (entry.error.stack) {
      line += '\n  Stack: ' + entry.error.stack;
    }
  }

  return line;
}

export function initLogger(cfg: Partial<LoggerConfig>): void {
  config = { ...config, ...cfg };
}

export function log(
  level: LogLevel | string,
  namespace: string,
  message: string,
  context: Record<string, unknown> = {},
  error?: { name: string; message: string; stack?: string }
): void {
  const normalizedLevel = level.toLowerCase() as LogEntry['level'];

  if (!shouldLog(normalizedLevel)) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: normalizedLevel,
    namespace,
    message,
    context,
    error,
    source: 'backend',
  };

  const formatted = formatLogEntry(entry);

  switch (normalizedLevel) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function debug(namespace: string, message: string, context?: Record<string, unknown>): void {
  log(LogLevel.DEBUG, namespace, message, context);
}

export function info(namespace: string, message: string, context?: Record<string, unknown>): void {
  log(LogLevel.INFO, namespace, message, context);
}

export function warn(namespace: string, message: string, context?: Record<string, unknown>): void {
  log(LogLevel.WARN, namespace, message, context);
}

export function error(
  namespace: string,
  message: string,
  context?: Record<string, unknown>,
  err?: Error | { name: string; message: string; stack?: string }
): void {
  const errorObj =
    err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
  log(LogLevel.ERROR, namespace, message, context, errorObj);
}

export function setupLogIPC(win: BrowserWindow | null): void {
  ipcMain.handle('log:write', async (_event: IpcMainInvokeEvent, entry: LogEntry) => {
    const frontendEntry: LogEntry = {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      source: 'frontend',
    };

    if (!shouldLog(frontendEntry.level)) {
      return { success: true };
    }

    const formatted = formatLogEntry(frontendEntry);

    switch (frontendEntry.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }

    return { success: true };
  });

  ipcMain.handle('log:get-level', async () => {
    return config.level;
  });

  ipcMain.handle('log:set-level', async (_event: IpcMainInvokeEvent, level: LogLevel) => {
    config.level = level;
    return { success: true, level: config.level };
  });
}

export function getLogLevel(): LogLevel {
  return config.level;
}

export function setLogLevel(level: LogLevel): void {
  config.level = level;
}
