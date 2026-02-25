/**
 * Core DI Module Index
 * Central export for frontend dependency injection
 */

export {
  APP_CONFIG,
  CoreModule,
  DEFAULT_APP_CONFIG,
  injectService,
  ServiceRegistry,
  type AppConfig,
} from './di.module.js';

export {
  EVENT_BUS_CONFIG,
  initializeFrontendServices,
  injectEventBus,
  injectLogger,
  LoggerService,
  SERVICE_PROVIDERS,
} from './services.js';
