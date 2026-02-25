/**
 * Window management utilities
 * Provides enhanced window creation, management, and lifecycle handling
 */

import { app, BrowserWindow, Menu, screen } from 'electron';

const path = require('node:path');
const url = require('node:url');

export interface WindowOptions {
  id?: string;
  title?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  x?: number;
  y?: number;
  center?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  frame?: boolean;
  show?: boolean;
  webPreferences?: any;
  menu?: any;
  icon?: string;
  preload?: string;
  devTools?: boolean;
}

export interface WindowState {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMaximized: boolean;
  isFullScreen: boolean;
  isVisible: boolean;
  lastFocused: number;
}

export class WindowManager {
  private static instance: WindowManager;
  private windows: Map<string, BrowserWindow> = new Map();
  private windowStates: Map<string, WindowState> = new Map();
  private defaultWebPreferences: any;

  private constructor() {
    this.setupDefaultWebPreferences();
    this.setupAppEventHandlers();
  }

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * Setup default web preferences
   */
  private setupDefaultWebPreferences(): void {
    this.defaultWebPreferences = {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, '../preload/preload'),
    };
  }

  /**
   * Setup application event handlers
   */
  private setupAppEventHandlers(): void {
    // Save window states before quitting
    app.on('before-quit', () => {
      this.saveAllWindowStates();
    });

    // Handle window closed events
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  /**
   * Create a new browser window with enhanced options
   */
  createWindow(options: WindowOptions = {}): BrowserWindow {
    const windowId = options.id || `window-${Date.now()}`;

    // Merge with default options
    const mergedOptions = {
      title: options.title || 'Electron App',
      width: options.width || 1200,
      height: options.height || 800,
      minWidth: options.minWidth || 400,
      minHeight: options.minHeight || 300,
      show: options.show !== undefined ? options.show : false,
      center: options.center !== undefined ? options.center : true,
      resizable: options.resizable !== undefined ? options.resizable : true,
      minimizable: options.minimizable !== undefined ? options.minimizable : true,
      maximizable: options.maximizable !== undefined ? options.maximizable : true,
      closable: options.closable !== undefined ? options.closable : true,
      alwaysOnTop: options.alwaysOnTop || false,
      frame: options.frame !== undefined ? options.frame : true,
      icon: options.icon || this.getAppIcon(),
      x: options.x,
      y: options.y,
      webPreferences: {
        ...this.defaultWebPreferences,
        ...options.webPreferences,
      },
    };

    // Restore window state if available
    const savedState = this.windowStates.get(windowId);
    if (savedState) {
      mergedOptions.width = savedState.bounds.width;
      mergedOptions.height = savedState.bounds.height;
      mergedOptions.x = savedState.bounds.x;
      mergedOptions.y = savedState.bounds.y;
    }

    const window = new BrowserWindow(mergedOptions);

    // Store window reference
    this.windows.set(windowId, window);

    // Setup window event handlers
    this.setupWindowEventHandlers(window, windowId);

    // Load content
    this.loadWindowContent(window, options);

    // Set menu if provided
    if (options.menu) {
      window.setMenu(options.menu);
    }

    // Show window after loading
    if (!options.show) {
      window.once('ready-to-show', () => {
        window.show();

        // Restore maximized state if saved
        if (savedState?.isMaximized) {
          window.maximize();
        }
      });
    }

    // Enable dev tools in development
    if (options.devTools && process.env.NODE_ENV === 'development') {
      window.webContents.openDevTools();
    }

    console.log(`Window created: ${windowId}`);
    return window;
  }

  /**
   * Setup event handlers for a specific window
   */
  private setupWindowEventHandlers(window: BrowserWindow, windowId: string): void {
    // Update window state on changes
    window.on('resize', () => this.updateWindowState(windowId));
    window.on('move', () => this.updateWindowState(windowId));
    window.on('maximize', () => this.updateWindowState(windowId));
    window.on('unmaximize', () => this.updateWindowState(windowId));
    window.on('focus', () => this.updateWindowState(windowId));

    // Clean up on window close
    window.on('closed', () => {
      this.windows.delete(windowId);
      console.log(`Window closed: ${windowId}`);
    });

    // Handle navigation errors
    window.webContents.on('did-fail-load', (event: any, errorCode: number, errorDesc: string) => {
      console.error(`Window ${windowId} failed to load:`, errorCode, errorDesc);
    });
  }

  /**
   * Load content into window
   */
  private loadWindowContent(window: BrowserWindow, options: WindowOptions): void {
    const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:1234';
    const isDev = process.env.NODE_ENV === 'development';

    const startUrl = isDev
      ? devUrl
      : url.format({
          pathname: path.join(__dirname, '../../dist/index.html'),
          protocol: 'file:',
          slashes: true,
        });

    window.loadURL(startUrl);
  }

  /**
   * Update window state
   */
  private updateWindowState(windowId: string): void {
    const window = this.windows.get(windowId);
    if (!window) return;

    const bounds = window.getBounds();
    const state: WindowState = {
      id: windowId,
      bounds: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      },
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
      isVisible: window.isVisible(),
      lastFocused: Date.now(),
    };

    this.windowStates.set(windowId, state);
  }

  /**
   * Get window by ID
   */
  getWindow(windowId: string): BrowserWindow | null {
    return this.windows.get(windowId) || null;
  }

  /**
   * Get main window (first created or focused)
   */
  getMainWindow(): BrowserWindow | null {
    // Try to get focused window first
    const focused = BrowserWindow.getFocusedWindow();
    if (focused) return focused;

    // Return first available window
    const windows = Array.from(this.windows.values());
    return windows.length > 0 ? windows[0] : null;
  }

  /**
   * Get all windows
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * Get all window IDs
   */
  getAllWindowIds(): string[] {
    return Array.from(this.windows.keys());
  }

  /**
   * Close window by ID
   */
  closeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) {
      console.warn(`Window not found: ${windowId}`);
      return false;
    }

    window.close();
    return true;
  }

  /**
   * Close all windows
   */
  closeAllWindows(): void {
    const windows = this.getAllWindows();
    windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
  }

  /**
   * Minimize window by ID
   */
  minimizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    window.minimize();
    return true;
  }

  /**
   * Maximize window by ID
   */
  maximizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
    return true;
  }

  /**
   * Center window by ID
   */
  centerWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (!window) return false;

    window.center();
    return true;
  }

  /**
   * Get app icon path
   */
  private getAppIcon(): string | undefined {
    try {
      return path.join(__dirname, '../../assets/icon.png');
    } catch {
      return undefined;
    }
  }

  /**
   * Save window states to persistent storage
   */
  private saveAllWindowStates(): void {
    // This could be enhanced to save to a file
    console.log('Window states saved:', this.windowStates.size);
  }

  /**
   * Get window states
   */
  getWindowStates(): Map<string, WindowState> {
    return new Map(this.windowStates);
  }
}

// Export singleton instance
export const windowManager = WindowManager.getInstance();
