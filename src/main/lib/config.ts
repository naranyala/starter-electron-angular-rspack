/**
 * Enhanced configuration management utilities for main process
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface ConfigOptions {
  fileName?: string;
  format?: 'json' | 'yaml' | 'toml';
  watch?: boolean;
  encryption?: boolean;
}

export interface ConfigWatcher {
  onChange: (callback: (newConfig: any) => void) => () => void;
  reload: () => Promise<void>;
}

export class ConfigManager {
  private config: Record<string, any> = {};
  private configPath: string;
  private options: ConfigOptions;
  private watchers: Array<(newConfig: any) => void> = [];
  private fileWatcher: fs.FSWatcher | null = null;

  constructor(options: ConfigOptions = {}) {
    this.options = {
      fileName: 'app-config.json',
      format: 'json',
      watch: false,
      encryption: false,
      ...options
    };

    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, this.options.fileName!);

    // Load initial config
    this.loadConfig();
  }

  get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value === null || value === undefined) {
        return defaultValue as T;
      }
      value = value[k];
    }

    return value !== undefined ? value : defaultValue as T;
  }

  set(key: string, value: any): void {
    const keys = key.split('.');
    let current: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (current[k] === undefined || current[k] === null) {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    this.saveConfig();
  }

  getAll(): Record<string, any> {
    return { ...this.config };
  }

  async update(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveConfig();
    this.notifyWatchers();
  }

  async reset(): Promise<void> {
    this.config = {};
    await this.saveConfig();
    this.notifyWatchers();
  }

  watch(): ConfigWatcher {
    if (this.options.watch && !this.fileWatcher) {
      this.setupFileWatcher();
    }

    return {
      onChange: (callback: (newConfig: any) => void): () => void => {
        this.watchers.push(callback);
        return () => {
          const index = this.watchers.indexOf(callback);
          if (index > -1) {
            this.watchers.splice(index, 1);
          }
        };
      },
      reload: async (): Promise<void> => {
        await this.loadConfig();
      }
    };
  }

  private async loadConfig(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = await fs.promises.readFile(this.configPath, 'utf-8');
        
        if (this.options.encryption) {
          // In a real implementation, you would decrypt the content
          // For now, we'll just parse it directly
        }
        
        switch (this.options.format) {
          case 'json':
            this.config = JSON.parse(content);
            break;
          case 'yaml':
            // Would require yaml parser in a real implementation
            this.config = JSON.parse(content);
            break;
          case 'toml':
            // Would require toml parser in a real implementation
            this.config = JSON.parse(content);
            break;
        }
      } else {
        // Create default config file
        await this.saveConfig();
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      // Use empty config as fallback
      this.config = {};
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      let content: string;
      
      switch (this.options.format) {
        case 'json':
          content = JSON.stringify(this.config, null, 2);
          break;
        case 'yaml':
          // Would require yaml serializer in a real implementation
          content = JSON.stringify(this.config, null, 2);
          break;
        case 'toml':
          // Would require toml serializer in a real implementation
          content = JSON.stringify(this.config, null, 2);
          break;
      }
      
      if (this.options.encryption) {
        // In a real implementation, you would encrypt the content
        // For now, we'll just save it directly
      }
      
      await fs.promises.writeFile(this.configPath, content, 'utf-8');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  private setupFileWatcher(): void {
    try {
      this.fileWatcher = fs.watch(this.configPath, (eventType) => {
        if (eventType === 'change') {
          // Debounce to avoid multiple rapid reloads
          setTimeout(async () => {
            await this.loadConfig();
            this.notifyWatchers();
          }, 100);
        }
      });
    } catch (error) {
      console.error('Failed to setup config file watcher:', error);
    }
  }

  private notifyWatchers(): void {
    this.watchers.forEach(callback => {
      try {
        callback({ ...this.config });
      } catch (error) {
        console.error('Config watcher error:', error);
      }
    });
  }

  destroy(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }
    this.watchers = [];
  }
}

/**
 * Feature flags management
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
}

export class FeatureFlagsManager {
  private flags: Map<string, FeatureFlag>;
  private configManager: ConfigManager;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.flags = new Map();

    // Load flags from config
    this.loadFlagsFromConfig();
  }

  private loadFlagsFromConfig(): void {
    const flags = this.configManager.get<FeatureFlag[]>('featureFlags', []);
    flags.forEach(flag => {
      this.flags.set(flag.name, flag);
    });
  }

  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // Check rollout percentage if specified
    if (flag.rolloutPercentage !== undefined && userId) {
      const hash = this.simpleHash(userId + flagName);
      const percentage = (hash % 100);
      if (percentage > flag.rolloutPercentage) {
        return false;
      }
    }

    // Check conditions if specified
    if (flag.conditions) {
      for (const [key, value] of Object.entries(flag.conditions)) {
        if (this.configManager.get(key) !== value) {
          return false;
        }
      }
    }

    return flag.enabled;
  }

  setFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
    this.saveFlagsToConfig();
  }

  removeFlag(flagName: string): void {
    this.flags.delete(flagName);
    this.saveFlagsToConfig();
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  private saveFlagsToConfig(): void {
    const flags = Array.from(this.flags.values());
    this.configManager.set('featureFlags', flags);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Environment-specific configuration
 */
export class EnvironmentConfig {
  static getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  static isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  static isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  static isTest(): boolean {
    return this.getEnvironment() === 'test';
  }

  static getApiBaseUrl(): string {
    const env = this.getEnvironment();
    
    switch (env) {
      case 'production':
        return process.env.API_BASE_URL || 'https://api.production.com';
      case 'staging':
        return process.env.API_BASE_URL || 'https://api.staging.com';
      default:
        return process.env.API_BASE_URL || 'http://localhost:3000';
    }
  }

  static getWebSocketUrl(): string {
    const env = this.getEnvironment();
    
    switch (env) {
      case 'production':
        return process.env.WS_URL || 'wss://ws.production.com';
      case 'staging':
        return process.env.WS_URL || 'wss://ws.staging.com';
      default:
        return process.env.WS_URL || 'ws://localhost:3001';
    }
  }
}