import * as path from 'node:path';
import { BrowserWindow, screen } from 'electron';
import { container, Injectable } from '../di/index.js';
import { LoggerService } from './logger.service.js';

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
  devTools?: boolean;
}

export interface WindowState {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  isMaximized: boolean;
  isFullScreen: boolean;
  isVisible: boolean;
  lastFocused: number;
}

@Injectable({ scope: 'singleton', providedIn: 'root' })
export class WindowService {
  private windows = new Map<string, BrowserWindow>();
  private windowStates = new Map<string, WindowState>();
  private mainWindow: BrowserWindow | null = null;

  /**
   * Constructor injection - LoggerService is automatically resolved
   */
  constructor(private logger: LoggerService) {}

  /**
   * Lifecycle hook called after initialization
   */
  onInit(): void {
    this.logger.info('window', 'Window service initialized');
  }

  create(options: WindowOptions = {}): BrowserWindow {
    const windowId = options.id || `window-${Date.now()}`;

    const defaultPrefs = {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      preload: path.join(process.cwd(), 'src/preload/index.js'),
    };

    const mergedOptions = {
      title: options.title || 'Electron App',
      width: options.width || 1200,
      height: options.height || 800,
      minWidth: options.minWidth || 400,
      minHeight: options.minHeight || 300,
      show: options.show !== undefined ? options.show : false,
      center: options.center !== undefined ? options.center : true,
      resizable: options.resizable !== undefined ? options.resizable : true,
      frame: options.frame !== undefined ? options.frame : true,
      webPreferences: defaultPrefs,
    };

    const window = new BrowserWindow(mergedOptions);
    this.windows.set(windowId, window);
    this.mainWindow = window;

    if (!options.show) {
      window.once('ready-to-show', () => window.show());
    }

    if (options.devTools) {
      window.webContents.openDevTools();
    }

    window.on('closed', () => {
      this.windows.delete(windowId);
      this.logger.debug('window', `Window closed: ${windowId}`);
    });

    this.logger.info('window', `Window created: ${windowId}`);
    return window;
  }

  getMain(): BrowserWindow | null {
    return this.mainWindow;
  }

  get(id: string): BrowserWindow | null {
    return this.windows.get(id) || null;
  }

  getAll(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  close(id: string): boolean {
    const win = this.windows.get(id);
    if (!win) return false;
    win.close();
    return true;
  }

  closeAll(): void {
    this.windows.forEach((win) => {
      if (!win.isDestroyed()) win.close();
    });
  }

  /**
   * Set the main window reference (for backward compatibility)
   */
  setMain(window: BrowserWindow): void {
    this.mainWindow = window;
  }
}

// Export convenience instance (optional - prefer container.resolve in new code)
export const windowService = container.resolve(WindowService);
