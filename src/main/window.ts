import path from 'node:path';
import { BrowserWindow } from 'electron';

let mainWindowRef: BrowserWindow | null = null;

export function createWindow(
  isDev: boolean,
  ref: BrowserWindow | null | undefined,
  baseDir: string
): BrowserWindow {
  if (ref) {
    mainWindowRef = ref;
    return ref;
  }

  if (mainWindowRef) return mainWindowRef;

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(baseDir, 'src/preload/index.js'),
    },
  });

  // Optionally open DevTools in development (comment out to disable auto-open)
  // if (isDev) {
  //   win.webContents.openDevTools();
  // }

  const indexPath = isDev
    ? process.env.ELECTRON_START_URL || 'http://localhost:4200'
    : `file://${path.join(baseDir, 'frontend', 'dist', 'browser', 'index.html')}`;

  win.loadURL(indexPath);

  win.on('closed', () => {
    mainWindowRef = null;
  });

  mainWindowRef = win;
  return win;
}
