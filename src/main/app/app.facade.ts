/**
 * Application Facade
 * 
 * Simplifies access to main process functionality by providing a unified API.
 * Encapsulates the complexity of the DI container and service orchestration.
 * 
 * Usage:
 *   import { appFacade } from './app.facade';
 *   
 *   await appFacade.initialize();
 *   appFacade.windows.create({...});
 */

import type { BrowserWindow } from 'electron';
import { container } from '../di/index';
import { LoggerService } from '../services/logger.service';
import { WindowService } from '../services/window.service';
import { IpcHandlerService } from '../services/ipc-handler.service';
import type { AppConfig } from './app.config';

/**
 * Window management API through facade
 */
export interface WindowFacadeAPI {
  create: typeof WindowService.prototype.create;
  getMain: typeof WindowService.prototype.getMain;
  get: typeof WindowService.prototype.get;
  getAll: typeof WindowService.prototype.getAll;
  close: typeof WindowService.prototype.close;
  closeAll: typeof WindowService.prototype.closeAll;
}

/**
 * IPC management API through facade
 */
export interface IpcFacadeAPI {
  registerHandlers: typeof IpcHandlerService.prototype.registerHandlers;
}

/**
 * Logging API through facade
 */
export interface LoggerFacadeAPI {
  configure: typeof LoggerService.prototype.configure;
  getLevel: typeof LoggerService.prototype.getLevel;
  setLevel: typeof LoggerService.prototype.setLevel;
  info: typeof LoggerService.prototype.info;
  debug: typeof LoggerService.prototype.debug;
  warn: typeof LoggerService.prototype.warn;
  error: typeof LoggerService.prototype.error;
}

/**
 * Main Process Facade
 * 
 * Provides a simplified, unified API for main process functionality.
 * Hides DI container complexity from application code.
 */
export class AppFacade {
  private _initialized = false;
  private _config: AppConfig | null = null;

  constructor(private appContainer = container) {}

  /**
   * Get the logger service
   */
  get logger(): LoggerFacadeAPI {
    return this.appContainer.resolve(LoggerService);
  }

  /**
   * Get the window service
   */
  get windows(): WindowFacadeAPI {
    return this.appContainer.resolve(WindowService);
  }

  /**
   * Get the IPC handler service
   */
  get ipc(): IpcFacadeAPI {
    return this.appContainer.resolve(IpcHandlerService);
  }

  /**
   * Get the underlying container (for advanced usage)
   */
  getContainer(): typeof container {
    return this.appContainer;
  }

  /**
   * Check if the application is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Get the current configuration
   */
  getConfig(): AppConfig | null {
    return this._config;
  }

  /**
   * Initialize the application
   * Sets up all services and registers IPC handlers
   */
  async initialize(config?: AppConfig): Promise<void> {
    if (this._initialized) {
      this.logger.warn('app', 'Application already initialized');
      return;
    }

    this._config = config || null;
    
    try {
      // Create and register services manually to ensure proper dependency order
      const logger = new LoggerService();
      this.appContainer.registerValue(LoggerService, logger);
      
      const windowService = new WindowService(logger);
      this.appContainer.registerValue(WindowService, windowService);
      
      const ipcHandler = new IpcHandlerService(logger, windowService);
      this.appContainer.registerValue(IpcHandlerService, ipcHandler);
      
      // Now initialize
      this.logger.info('app', 'Application initializing', {
        environment: config?.environment || 'unknown'
      });

      // Register IPC handlers
      this.ipc.registerHandlers();

      this._initialized = true;
      this.logger.info('app', 'Application initialized successfully');
    } catch (error) {
      this.logger.error('app', 'Failed to initialize application', {}, error as Error);
      throw error;
    }
  }

  /**
   * Create the main application window
   */
  createMainWindow(options?: {
    title?: string;
    width?: number;
    height?: number;
    devTools?: boolean;
  }): BrowserWindow {
    const window = this.windows.create({
      id: 'main',
      title: options?.title || 'Electron Angular Rspack',
      width: options?.width || 1200,
      height: options?.height || 800,
      minWidth: 400,
      minHeight: 300,
      center: true,
      show: false,
      devTools: options?.devTools || false,
    });

    this.logger.info('window', 'Main window created', {
      windowId: 'main',
      title: options?.title,
    });

    return window;
  }

  /**
   * Shutdown the application
   * Cleans up resources and closes all windows
   */
  async shutdown(): Promise<void> {
    this.logger.info('app', 'Application shutting down');

    try {
      // Close all windows
      this.windows.closeAll();
      
      this._initialized = false;
      this.logger.info('app', 'Application shutdown complete');
    } catch (error) {
      this.logger.error('app', 'Error during shutdown', {}, error as Error);
    }
  }

  /**
   * Get application status
   */
  getStatus(): {
    initialized: boolean;
    windowCount: number;
    config: AppConfig | null;
  } {
    return {
      initialized: this._initialized,
      windowCount: this.windows.getAll().length,
      config: this._config,
    };
  }
}

/**
 * Singleton instance of the application facade
 */
export const appFacade = new AppFacade();
