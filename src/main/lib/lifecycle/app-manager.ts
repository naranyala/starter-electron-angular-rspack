import { app, type BrowserWindow } from 'electron';
import { getPlatformInfo, isDevelopment, isMacOS } from '../../../shared/lib/platform';
import { setupIPC } from '../../ipc';
import { createWindow } from '../window/index';

let mainWindow: BrowserWindow | null = null;
let isReady = false;
let isQuitting = false;

export interface AppLifecycleOptions {
  createWindow?: boolean;
  setupIPC?: boolean;
  windowOptions?: {
    width?: number;
    height?: number;
  };
}

export function initializeApp(options: AppLifecycleOptions = {}): void {
  const {
    createWindow: shouldCreateWindow = true,
    setupIPC: shouldSetupIPC = true,
    windowOptions = {},
  } = options;

  const isDev = isDevelopment();
  const platformInfo = getPlatformInfo();

  app.whenReady().then(() => {
    isReady = true;

    if (shouldCreateWindow) {
      mainWindow = createWindow({
        isDev,
        ref: mainWindow,
        ...windowOptions,
      });

      if (shouldSetupIPC) {
        setupIPC(mainWindow);
      }
    }

    console.log(`🚀 App ready on ${platformInfo.platform} (${platformInfo.arch})`);
    console.log(`📦 Mode: ${isDev ? 'Development' : 'Production'}`);
  });
}

export function setupLifecycleHandlers(customHandlers?: {
  onWindowAllClosed?: () => void;
  onActivate?: () => void;
  onWillQuit?: () => void;
}): void {
  const onWindowAllClosed =
    customHandlers?.onWindowAllClosed ||
    (() => {
      if (!isMacOS()) app.quit();
    });

  const onActivate =
    customHandlers?.onActivate ||
    (() => {
      if (!mainWindow) {
        const isDev = isDevelopment();
        mainWindow = createWindow({ isDev, ref: mainWindow });
      }
    });

  const onWillQuit =
    customHandlers?.onWillQuit ||
    (() => {
      isQuitting = true;
    });

  app.on('window-all-closed', onWindowAllClosed);
  app.on('activate', onActivate);
  app.on('will-quit', onWillQuit);
}

export function startApp(options: AppLifecycleOptions = {}): void {
  initializeApp(options);
  setupLifecycleHandlers();
}

export function quitApp(): void {
  isQuitting = true;
  app.quit();
}

export function relaunchApp(): void {
  app.relaunch();
  quitApp();
}

export function isAppReady(): boolean {
  return isReady;
}

export function isAppQuitting(): boolean {
  return isQuitting;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function setMainWindow(win: BrowserWindow | null): void {
  mainWindow = win;
}
