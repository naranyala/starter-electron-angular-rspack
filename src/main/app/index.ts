/**
 * Application Module
 * 
 * Central export for main process application functionality.
 * 
 * Usage:
 *   import { appFacade, lifecycleHandlers } from '@main/app';
 */

export { appFacade } from './app.facade.js';
export { lifecycleHandlers } from './app.lifecycle.js';
export {
  DEFAULT_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  getConfigForEnvironment,
  mergeConfig,
} from './app.config.js';
export type { AppConfig, FeaturesConfig, LoggingConfig, WindowConfig } from './app.config.js';
