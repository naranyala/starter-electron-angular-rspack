/**
 * Application Lifecycle Handlers
 * 
 * Manages Electron app lifecycle events with proper cleanup.
 * 
 * Usage:
 *   import { lifecycleHandlers } from './app.lifecycle.js';
 *   
 *   lifecycleHandlers.register(app);
 */

import { app, type BrowserWindow } from 'electron';
import { appFacade } from './app.facade.js';
import { getLogger } from '../services/logger.service.js';

/**
 * Lifecycle event handlers
 */
export interface LifecycleHandlers {
  /** Called when app is ready to create windows */
  onReady: () => Promise<void>;
  /** Called when all windows are closed */
  onWindowAllClosed: () => void;
  /** Called when app is activated (macOS) */
  onActivate: () => void;
  /** Called before app quits */
  onBeforeQuit: () => void;
  /** Called when app will quit */
  onWillQuit: () => void;
}

/**
 * Application lifecycle manager
 */
class LifecycleManager {
  private readonly logger = getLogger('lifecycle');
  private mainWindow: BrowserWindow | null = null;
  private isQuitting = false;

  /**
   * Register lifecycle handlers with Electron app
   */
  register(): void {
    app.whenReady().then(async () => {
      await this.onReady();
    });

    app.on('window-all-closed', () => {
      this.onWindowAllClosed();
    });

    app.on('activate', () => {
      this.onActivate();
    });

    app.on('before-quit', () => {
      this.onBeforeQuit();
    });

    app.on('will-quit', () => {
      this.onWillQuit();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleUncaughtException(error);
    });

    process.on('unhandledRejection', (reason) => {
      this.handleUnhandledRejection(reason);
    });

    this.logger.info('Lifecycle handlers registered');
  }

  /**
   * Set the main window reference
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
    
    window.on('closed', () => {
      this.mainWindow = null;
      this.logger.debug('Main window closed');
    });
  }

  /**
   * Get the main window
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Check if app is quitting
   */
  isAppQuitting(): boolean {
    return this.isQuitting;
  }

  private async onReady(): Promise<void> {
    this.logger.info('Application ready');

    try {
      // Initialize the application facade
      await appFacade.initialize();

      // Create main window
      this.mainWindow = appFacade.createMainWindow({
        devTools: appFacade.getConfig()?.window.devTools,
      });

      // Load frontend
      await this.loadFrontend();

      this.logger.info('Application startup complete');
    } catch (error) {
      this.logger.error('Failed to start application', {}, error as Error);
      app.quit();
    }
  }

  private onWindowAllClosed(): void {
    this.logger.info('All windows closed');
    
    // On macOS, re-create window when dock icon is clicked
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate(): void {
    this.logger.debug('Application activated');
    
    // Re-create window on macOS if none exist
    if (process.platform === 'darwin' && !this.mainWindow) {
      this.mainWindow = appFacade.createMainWindow();
      this.loadFrontend();
    }
  }

  private onBeforeQuit(): void {
    this.logger.info('Application before quit');
    this.isQuitting = true;
  }

  private onWillQuit(): void {
    this.logger.info('Application will quit');
    appFacade.shutdown();
  }

  private async loadFrontend(): Promise<void> {
    if (!this.mainWindow) return;

    const isDev = process.argv.includes('--start-dev');
    const frontendPath = `${process.cwd()}/frontend/dist/browser/index.html`;

    if (isDev) {
      try {
        await this.mainWindow.loadURL('http://localhost:4200');
        this.logger.info('Loaded from dev server');
      } catch {
        await this.mainWindow.loadFile(frontendPath);
        this.logger.warn('Dev server not available, loaded local file');
      }
    } else {
      await this.mainWindow.loadFile(frontendPath);
      this.logger.info('Loaded from local file');
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.logger.debug('Main window shown');
    });
  }

  private handleUncaughtException(error: Error): void {
    this.logger.error('Uncaught exception', {}, error);
  }

  private handleUnhandledRejection(reason: unknown): void {
    this.logger.error('Unhandled promise rejection', {}, reason as Error);
  }
}

/**
 * Singleton lifecycle manager instance
 */
export const lifecycleHandlers = new LifecycleManager();
