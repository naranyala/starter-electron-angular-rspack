/**
 * Application Bootstrap Module
 * Configures and initializes the DI container with all services
 */

import { container, ServiceRegistry, type ServiceMeta } from '../di/index';
import { LoggerService, LogLevel, type LoggerConfig } from '../services/logger.service';
import { WindowService } from '../services/window.service';
import { IpcHandlerService } from '../services/ipc-handler.service';

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Environment (development/production) */
  environment: 'development' | 'production';
  /** Logger configuration */
  logging: LoggerConfig;
  /** Enable dev tools */
  devTools?: boolean;
}

/**
 * Default application configuration
 */
export const DEFAULT_CONFIG: AppConfig = {
  name: 'Electron App',
  version: '1.0.0',
  environment: 'development',
  logging: {
    level: LogLevel.INFO,
    showSource: true,
    prettyPrint: true,
  },
  devTools: true,
};

/**
 * Service definitions for automatic registration
 */
const SERVICE_DEFINITIONS: ServiceMeta[] = [
  {
    name: 'logger',
    token: LoggerService as any,
    useClass: LoggerService,
    scope: 'singleton',
    order: 1,
    autoInit: true,
    tags: ['core', 'logging'],
  },
  {
    name: 'window',
    token: WindowService as any,
    useClass: WindowService,
    scope: 'singleton',
    deps: [LoggerService as any],
    order: 2,
    autoInit: true,
    tags: ['core', 'ui'],
  },
  {
    name: 'ipc',
    token: IpcHandlerService as any,
    useClass: IpcHandlerService,
    scope: 'singleton',
    deps: [LoggerService as any, WindowService as any],
    order: 3,
    autoInit: true,
    tags: ['core', 'ipc'],
  },
];

/**
 * Application Bootstrap class
 * Manages DI container setup and service initialization
 * 
 * @example
 * const app = new AppBootstrap();
 * await app.initialize();
 * 
 * const logger = container.resolve(LoggerService);
 * const windowService = container.resolve(WindowService);
 */
export class AppBootstrap {
  private registry: ServiceRegistry;
  private config: AppConfig;
  private initialized = false;

  constructor(config?: Partial<AppConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registry = new ServiceRegistry();
  }

  /**
   * Initialize the application and all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Application already initialized');
    }

    console.log(`[AppBootstrap] Initializing ${this.config.name} v${this.config.version}`);

    // Configure logger before registration
    const logger = new LoggerService();
    logger.configure(this.config.logging);

    // Register logger with configured instance
    container.registerValue(LoggerService, logger);

    // Register all services
    this.registry.registerMany(SERVICE_DEFINITIONS);

    // Bootstrap services
    await this.registry.bootstrap(container);

    this.initialized = true;
    console.log('[AppBootstrap] Initialization complete');
    console.log('[AppBootstrap] Services:', this.registry.getStatus());
  }

  /**
   * Get the DI container
   */
  getContainer(): typeof container {
    return container;
  }

  /**
   * Get application configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Check if application is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get service initialization status
   */
  getServiceStatus(): Array<{ name: string; initialized: boolean; scope?: string }> {
    return this.registry.getStatus();
  }

  /**
   * Shutdown the application
   */
  shutdown(): void {
    console.log('[AppBootstrap] Shutting down...');
    container.dispose();
    this.initialized = false;
  }
}

/**
 * Create and initialize the application bootstrap
 * @example
 * const bootstrap = await createAppBootstrap({ devTools: false });
 */
export async function createAppBootstrap(
  config?: Partial<AppConfig>
): Promise<AppBootstrap> {
  const bootstrap = new AppBootstrap(config);
  await bootstrap.initialize();
  return bootstrap;
}
