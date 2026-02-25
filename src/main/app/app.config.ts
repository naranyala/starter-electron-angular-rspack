/**
 * Application Configuration
 * 
 * Defines the configuration interface and default values for the application.
 * Configuration can be loaded from external JSON files or provided programmatically.
 * 
 * Usage:
 *   import { DEFAULT_CONFIG } from './app.config.js';
 *   const config = { ...DEFAULT_CONFIG, devTools: false };
 */

import { LogLevel } from '../services/logger.service.js';

/**
 * Window configuration
 */
export interface WindowConfig {
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  center: boolean;
  devTools: boolean;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: LogLevel;
  showSource: boolean;
  prettyPrint: boolean;
}

/**
 * Feature flags configuration
 */
export interface FeaturesConfig {
  enableDevTools: boolean;
  enableLogging: boolean;
  enableErrorReporting: boolean;
  enableAutoUpdate: boolean;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Environment name */
  environment: 'development' | 'production' | 'test';
  /** Window settings */
  window: WindowConfig;
  /** Logging settings */
  logging: LoggingConfig;
  /** Feature flags */
  features: FeaturesConfig;
}

/**
 * Default application configuration
 */
export const DEFAULT_CONFIG: AppConfig = {
  name: 'Electron Angular Rspack',
  version: '0.1.2',
  environment: 'development',
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
    minWidth: 400,
    minHeight: 300,
    center: true,
    devTools: true,
  },
  logging: {
    level: LogLevel.INFO,
    showSource: true,
    prettyPrint: true,
  },
  features: {
    enableDevTools: true,
    enableLogging: true,
    enableErrorReporting: true,
    enableAutoUpdate: false,
  },
};

/**
 * Production configuration (extends default)
 */
export const PRODUCTION_CONFIG: Partial<AppConfig> = {
  environment: 'production',
  window: {
    devTools: false,
  },
  logging: {
    level: LogLevel.WARN,
  },
  features: {
    enableDevTools: false,
  },
};

/**
 * Development configuration (extends default)
 */
export const DEVELOPMENT_CONFIG: Partial<AppConfig> = {
  environment: 'development',
  window: {
    devTools: true,
  },
  logging: {
    level: LogLevel.DEBUG,
  },
};

/**
 * Merge configurations (later configs override earlier)
 */
export function mergeConfig(...configs: Array<Partial<AppConfig>>): AppConfig {
  return configs.reduce(
    (acc, config) => ({
      ...acc,
      ...config,
      window: { ...acc.window, ...config.window },
      logging: { ...acc.logging, ...config.logging },
      features: { ...acc.features, ...config.features },
    }),
    DEFAULT_CONFIG
  );
}

/**
 * Get configuration for environment
 */
export function getConfigForEnvironment(
  env: 'development' | 'production' | 'test'
): AppConfig {
  switch (env) {
    case 'production':
      return mergeConfig(PRODUCTION_CONFIG);
    case 'test':
      return mergeConfig({
        environment: 'test',
        logging: { level: LogLevel.ERROR },
      });
    case 'development':
    default:
      return mergeConfig(DEVELOPMENT_CONFIG);
  }
}
