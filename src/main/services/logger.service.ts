import { type IpcMainInvokeEvent, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import type { LogEntry, LogEntryInput } from '../../shared/types';
import { LogLevel } from '../../shared/types';
import { container, Injectable } from '../di/index';

export interface LoggerConfig {
  level: LogLevel;
  showSource?: boolean;
  prettyPrint?: boolean;
}

const LEVEL_PRIORITY: Record<string, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

@Injectable({ scope: 'singleton', providedIn: 'root' })
export class LoggerService {
  private config: LoggerConfig;
  private history: LogEntry[] = [];
  private historyLimit = 200;

  constructor() {
    this.config = {
      level: LogLevel.INFO,
      showSource: true,
      prettyPrint: true,
    };
  }

  /**
   * Configure the logger
   */
  configure(cfg: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...cfg };
  }

  /**
   * Lifecycle hook called after initialization
   */
  onInit(): void {
    this.info('logger', 'Logger service initialized', { level: this.config.level });
  }

  private getLevelPriority(level: string): number {
    return LEVEL_PRIORITY[level] ?? 0;
  }

  private shouldLog(level: string): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.config.level);
  }

  private formatLogEntry(entry: LogEntry): string {
    const parts: string[] = [];

    if (this.config.showSource) {
      parts.push(`[${entry.source.toUpperCase()}]`);
    }

    const timestamp = entry.timestamp ?? new Date().toISOString();
    parts.push(`[${timestamp}]`);
    parts.push(`[${entry.level.toUpperCase()}]`);
    parts.push(`[${entry.namespace}]`);

    let line = parts.join(' ') + ' ' + entry.message;

    if (entry.context && Object.keys(entry.context).length > 0) {
      if (this.config.prettyPrint) {
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

  log(
    level: LogLevel | string,
    namespace: string,
    message: string,
    context: Record<string, unknown> = {},
    error?: { name: string; message: string; stack?: string }
  ): void {
    const normalizedLevel = level.toLowerCase() as LogEntry['level'];

    if (!this.shouldLog(normalizedLevel)) {
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

    this.recordEntry(entry);

    const formatted = this.formatLogEntry(entry);

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

  getRecent(limit: number = 50): LogEntry[] {
    return this.history.slice(-limit);
  }

  private recordEntry(entry: LogEntry): void {
    this.history.push(entry);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
  }

  debug(namespace: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, namespace, message, context);
  }

  info(namespace: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, namespace, message, context);
  }

  warn(namespace: string, message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, namespace, message, context);
  }

  error(
    namespace: string,
    message: string,
    context?: Record<string, unknown>,
    err?: Error | { name: string; message: string; stack?: string }
  ): void {
    const errorObj =
      err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    this.log(LogLevel.ERROR, namespace, message, context, errorObj);
  }

  setupIPC(): void {
    ipcMain.handle(IPC_CHANNELS.LOG.WRITE, async (_event: IpcMainInvokeEvent, entry: LogEntryInput) => {
      const frontendEntry: LogEntry = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
        source: 'frontend',
        context: entry.context || {},
      };

      if (!this.shouldLog(frontendEntry.level)) {
        return { success: true };
      }

      const formatted = this.formatLogEntry(frontendEntry);

      this.recordEntry(frontendEntry);

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

    ipcMain.handle(IPC_CHANNELS.LOG.GET_LEVEL, async () => {
      return this.config.level;
    });

    ipcMain.handle(IPC_CHANNELS.LOG.SET_LEVEL, async (_event: IpcMainInvokeEvent, level: LogLevel) => {
      this.config.level = level;
      return { success: true, level: this.config.level };
    });
  }

  getLevel(): LogLevel {
    return this.config.level;
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// Export convenience instance (optional - prefer container.resolve in new code)
export const loggerService = container.resolve(LoggerService);
