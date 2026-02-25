import { Injectable } from '@angular/core';
import type { LogEntry, LoggerOptions, LogLevel } from '../models';
import type { LogEntryPayload } from '../types';

type LogSink = (entry: LogEntry) => void;

const DEFAULT_OPTIONS: LoggerOptions = {
  enabled: true,
  minLevel: 'debug',
  maxEntries: 500,
  redactKeys: ['password', 'token', 'secret', 'authorization', 'cookie'],
};

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99,
};

const MAX_SANITIZE_DEPTH = 4;

@Injectable({
  providedIn: 'root',
})
export class LoggingViewModel {
  private options: LoggerOptions = DEFAULT_OPTIONS;
  private sequence = 0;
  private entries: LogEntry[] = [];
  private sinks = new Set<LogSink>();

  configure(partial: Partial<LoggerOptions>): void {
    this.options = {
      ...this.options,
      ...partial,
      redactKeys: partial.redactKeys ?? this.options.redactKeys,
    };
  }

  shouldLog(level: Exclude<LogLevel, 'silent'>): boolean {
    if (!this.options.enabled) {
      return false;
    }
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.options.minLevel];
  }

  emit(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const fullEntry: LogEntry = {
      ...entry,
      id: ++this.sequence,
      timestamp: new Date().toISOString(),
    };

    this.entries.push(fullEntry);
    if (this.entries.length > this.options.maxEntries) {
      this.entries.shift();
    }

    for (const sink of this.sinks) {
      sink(fullEntry);
    }
  }

  sanitize(value: unknown): unknown {
    return sanitizeValue(value, new Set(this.options.redactKeys.map(k => k.toLowerCase())));
  }

  snapshot(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  addSink(sink: LogSink): void {
    this.sinks.add(sink);
  }

  removeSink(sink: LogSink): void {
    this.sinks.delete(sink);
  }

  private consoleSink(entry: LogEntry): void {
    const method = entry.level === 'debug' ? 'debug' 
      : entry.level === 'info' ? 'log' 
      : entry.level === 'warn' ? 'warn' 
      : 'error';
    
    const prefix = `[FRONTEND] [${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.namespace}]`;
    const msg = `${prefix} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      console[method](msg, entry.context);
    } else {
      console[method](msg);
    }

    if (entry.error) {
      console[method](`${prefix} Error: ${entry.error.name}: ${entry.error.message}`);
      if (entry.error.stack) {
        console[method](entry.error.stack);
      }
    }
  }

  private async backendSink(entry: LogEntry): Promise<void> {
    try {
      const api = (window as unknown as { electronAPI?: { log: (entry: LogEntryPayload) => Promise<{ success: boolean }> } }).electronAPI;
      if (api?.log) {
        await api.log({
          level: entry.level,
          namespace: entry.namespace,
          message: entry.message,
          context: entry.context,
          error: entry.error,
        });
      }
    } catch {
      // Silently fail if IPC is not available
    }
  }

  enableConsoleSink(): void {
    this.addSink(entry => this.consoleSink(entry));
  }

  enableBackendSink(): void {
    this.addSink(entry => this.backendSink(entry));
  }

  disableBackendSink(): void {
    const sinksToRemove: LogSink[] = [];
    this.sinks.forEach(sink => {
      if (sink.name === 'bound backendSink') {
        sinksToRemove.push(sink);
      }
    });
    sinksToRemove.forEach(sink => this.sinks.delete(sink));
  }
}

function sanitizeValue(value: unknown, redactKeys: Set<string>, depth = 0): unknown {
  if (depth > MAX_SANITIZE_DEPTH) {
    return '[Truncated]';
  }

  if (value == null || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > 2000 ? `${value.slice(0, 2000)}…` : value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, redactKeys, depth + 1));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(record)) {
      sanitized[key] = redactKeys.has(key.toLowerCase())
        ? '[REDACTED]'
        : sanitizeValue(raw, redactKeys, depth + 1);
    }
    return sanitized;
  }

  return String(value);
}
