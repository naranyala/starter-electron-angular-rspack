/**
 * Frontend Services Module
 * Provides factories and providers for frontend services
 */

import { Injectable, inject } from '@angular/core';
import {
  APP_CONFIG,
  type AppConfig,
  ServiceRegistry,
} from './di.module.js';
import { EventBusViewModel } from '../../viewmodels/event-bus.viewmodel.js';
import { GlobalErrorService } from '../global-error.service.js';
import { WinBoxService } from '../winbox.service.js';
import { getLogger, configureLogging, backend } from '../../viewmodels/logger.viewmodel.js';
import type { LoggerOptions } from '../../models/log.model.js';

/**
 * Logger service wrapper for Angular DI
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private config: AppConfig;

  constructor() {
    this.config = inject(APP_CONFIG);
    const logConfig: Partial<LoggerOptions> = {
      enabled: true,
      minLevel: this.config.logging.level,
    };
    configureLogging(logConfig);
  }

  debug(namespace: string, message: string, context?: Record<string, unknown>): void {
    getLogger(namespace).debug(message, context);
  }

  info(namespace: string, message: string, context?: Record<string, unknown>): void {
    getLogger(namespace).info(message, context);
  }

  warn(namespace: string, message: string, context?: Record<string, unknown>): void {
    getLogger(namespace).warn(message, context);
  }

  error(
    namespace: string,
    message: string,
    context?: Record<string, unknown>,
    err?: Error
  ): void {
    getLogger(namespace).error(message, context, err);
  }
}

/**
 * Event bus service configuration
 */
export const EVENT_BUS_CONFIG = {
  namespace: 'app',
  maxHistory: 300,
};

/**
 * Service providers for the application
 */
export const SERVICE_PROVIDERS = [
  // Logger Service
  {
    provide: LoggerService,
    useClass: LoggerService,
  },

  // Global Error Service (already has providedIn: 'root')
  GlobalErrorService,

  // WinBox Service (already has providedIn: 'root')
  WinBoxService,
];

/**
 * Initialize frontend services
 * Call this during application bootstrap
 */
export function initializeFrontendServices(): () => Promise<void> {
  return async () => {
    const registry = inject(ServiceRegistry);
    const config = inject(APP_CONFIG);

    // Configure logging with correct type
    const logConfig: Partial<LoggerOptions> = {
      enabled: true,
      minLevel: config.logging.level,
    };
    configureLogging(logConfig);

    // Initialize event bus
    const eventBus = new EventBusViewModel<Record<string, unknown>>();
    eventBus.init(EVENT_BUS_CONFIG.namespace, EVENT_BUS_CONFIG.maxHistory);

    // Register in debug window for development
    if (typeof window !== 'undefined') {
      (window as any).__FRONTEND_EVENT_BUS__ = eventBus;
    }

    registry.register('eventBus', eventBus);
    registry.markInitialized('eventBus');

    // Register logger
    const logger = getLogger('app');
    registry.register('logger', logger);
    registry.markInitialized('logger');

    logger.info('Frontend services initialized', {
      production: config.production,
      loggingLevel: config.logging.level,
    });
  };
}

/**
 * Helper to get the event bus instance
 */
export function injectEventBus(): EventBusViewModel<Record<string, unknown>> {
  const debugWindow = window as unknown as {
    __FRONTEND_EVENT_BUS__?: EventBusViewModel<Record<string, unknown>>;
  };
  return debugWindow.__FRONTEND_EVENT_BUS__ ?? new EventBusViewModel();
}

/**
 * Helper to get the logger service
 */
export function injectLogger(): LoggerService {
  return inject(LoggerService);
}
