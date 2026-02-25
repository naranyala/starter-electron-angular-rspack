import { type BrowserWindow, dialog, type IpcMainInvokeEvent, ipcMain } from 'electron';

interface MessageOptions {
  type: 'none' | 'info' | 'warning' | 'error' | 'question';
  title: string;
  message: string;
}

export function setupIPC(win: BrowserWindow | null): void {
  if (!win) return;

  ipcMain.handle('get-app-info', async () => {
    return {
      name: process.env.npm_package_name || 'Electron App',
      version: process.env.npm_package_version || '1.0.0',
      platform: process.platform,
      arch: process.arch,
    };
  });

  ipcMain.handle('show-message', async (_event: IpcMainInvokeEvent, options: MessageOptions) => {
    return dialog.showMessageBox(win!, {
      type: options.type,
      title: options.title,
      message: options.message,
    });
  });
}
