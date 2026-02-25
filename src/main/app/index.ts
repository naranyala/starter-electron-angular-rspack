/**
 * Application Module
 *
 * Central export for main process application functionality.
 *
 * Usage:
 *   import { appFacade, lifecycleHandlers } from '@main/app';
 */

export { appFacade } from './app.facade';
export { lifecycleHandlers } from './app.lifecycle';
export {
  DEFAULT_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  getConfigForEnvironment,
  mergeConfig,
} from './app.config';
export type { AppConfig, FeaturesConfig, LoggingConfig, WindowConfig } from './app.config';
