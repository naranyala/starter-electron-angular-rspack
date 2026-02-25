#!/usr/bin/env node
/**
 * Logger Utility
 * Provides structured logging with different levels and styles
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

export interface LoggerOptions {
  prefix?: string;
  level?: LogLevel;
  timestamps?: boolean;
}

const ICONS = {
  debug: '🔍',
  info: 'ℹ️',
  success: '✓',
  warn: '⚠️',
  error: '✗',
  rocket: '🚀',
  hammer: '🔨',
  package: '📦',
  broom: '🧹',
  check: '✅',
  cross: '❌',
  sparkles: '✨',
  folder: '📂',
  gear: '⚙️',
  timer: '⏱️',
  stop: '🛑',
  wave: '👋',
  pointer: '👉',
  bulb: '💡',
};

export class Logger {
  private prefix: string;
  private level: LogLevel;
  private timestamps: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '';
    this.level = options.level ?? LogLevel.DEBUG;
    this.timestamps = options.timestamps ?? false;
  }

  private format(message: string, icon?: string): string {
    const parts: string[] = [];

    if (this.timestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    if (icon) {
      parts.push(icon);
    }

    parts.push(message);

    return parts.join(' ');
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.format(message, ICONS.debug));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.format(message, ICONS.info));
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.SUCCESS) {
      console.log(this.format(message, ICONS.success));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format(message, ICONS.warn));
    }
  }

  error(message: string, error?: Error): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format(message, ICONS.error));
      if (error?.message) {
        console.error(`  ${ICONS.pointer} ${error.message}`);
      }
    }
  }

  // Specialized logging methods
  start(task: string): void {
    console.log(this.format(`Starting ${task}...`, ICONS.rocket));
  }

  complete(task: string): void {
    console.log(this.format(`${task} completed`, ICONS.success));
  }

  skip(task: string, reason: string): void {
    console.log(this.format(`${task} skipped: ${reason}`, ICONS.bulb));
  }

  found(item: string): void {
    console.log(this.format(`${item} found`, ICONS.check));
  }

  missing(item: string, action?: string): void {
    const msg = action ? `${item} missing, ${action}` : `${item} missing`;
    console.log(this.format(msg, ICONS.cross));
  }

  installing(packageName: string): void {
    console.log(this.format(`Installing ${packageName}...`, ICONS.package));
  }

  installed(packageName: string): void {
    console.log(this.format(`${packageName} installed`, ICONS.success));
  }

  building(): void {
    console.log(this.format('Building project...', ICONS.hammer));
  }

  built(): void {
    console.log(this.format('Build successful', ICONS.sparkles));
  }

  cleaning(): void {
    console.log(this.format('Cleaning...', ICONS.broom));
  }

  cleaned(): void {
    console.log(this.format('Cleaned', ICONS.success));
  }

  checking(item: string): void {
    console.log(this.format(`Checking ${item}...`, ICONS.gear));
  }

  copying(from: string, to: string): void {
    console.log(this.format(`Copying ${from} → ${to}`, ICONS.folder));
  }

  copied(from: string, to: string): void {
    console.log(this.format(`Copied ${from} → ${to}`, ICONS.success));
  }

  timing(label: string): void {
    console.log(this.format(label, ICONS.timer));
  }

  stop(message: string): void {
    console.log(this.format(message, ICONS.stop));
  }

  bye(): void {
    console.log(this.format('Goodbye!', ICONS.wave));
  }

  // Group related logs
  group(label: string): void {
    console.log(`\n${ICONS.folder} ${label}`);
    console.log('─'.repeat(50));
  }

  groupEnd(): void {
    console.log('─'.repeat(50) + '\n');
  }

  // Create child logger with prefix
  child(prefix: string): Logger {
    return new Logger({
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      level: this.level,
      timestamps: this.timestamps,
    });
  }
}

// Default logger instance
export const logger = new Logger({ prefix: 'main' });

// Create specialized loggers
export const buildLogger = new Logger({ prefix: 'build' });
export const devLogger = new Logger({ prefix: 'dev' });
export const depsLogger = new Logger({ prefix: 'deps' });
export const cleanLogger = new Logger({ prefix: 'clean' });
