import path from 'node:path';
import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import { appConfig } from '../../../shared/lib/config';
import type { BrowserWindowConfig } from '../../../shared/lib/types';

let mainWindowRef: BrowserWindow | null = null;

export interface CreateWindowOptions {
  isDev: boolean;
  ref?: BrowserWindow | null;
  baseDir?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  preloadPath?: string;
  devTools?: boolean;
}

const defaultWindowConfig: BrowserWindowConstructorOptions = {
  width: appConfig.window.width,
  height: appConfig.window.height,
  minWidth: appConfig.window.minWidth,
  minHeight: appConfig.window.minHeight,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: '',
  },
};

export function createWindow(options: CreateWindowOptions): BrowserWindow {
  const {
    isDev,
    ref,
    baseDir = process.cwd(),
    width = appConfig.window.width,
    height = appConfig.window.height,
    minWidth = appConfig.window.minWidth,
    minHeight = appConfig.window.minHeight,
    preloadPath = path.join(baseDir, 'src/preload/index.js'),
    devTools = isDev,
  } = options;

  if (ref) {
    mainWindowRef = ref;
    return ref;
  }

  if (mainWindowRef) return mainWindowRef;

  const win = new BrowserWindow({
    ...defaultWindowConfig,
    width,
    height,
    minWidth,
    minHeight,
    webPreferences: {
      ...defaultWindowConfig.webPreferences,
      preload: preloadPath,
    },
  });

  if (devTools) {
    win.webContents.openDevTools();
  }

  const indexPath = isDev
    ? `http://localhost:${appConfig.devServer.port}`
    : `file://${path.join(baseDir, 'dist/index.html')}`;

  win.loadURL(indexPath);

  win.on('closed', () => {
    mainWindowRef = null;
  });

  mainWindowRef = win;
  return win;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindowRef;
}

export function closeMainWindow(): void {
  if (mainWindowRef) {
    mainWindowRef.close();
    mainWindowRef = null;
  }
}

export function focusMainWindow(): void {
  if (mainWindowRef) {
    mainWindowRef.focus();
  }
}

export function isWindowActive(): boolean {
  return mainWindowRef !== null && !mainWindowRef.isDestroyed();
}
