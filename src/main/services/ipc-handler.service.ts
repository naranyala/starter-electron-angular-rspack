import { type BrowserWindow, dialog, type IpcMainInvokeEvent, ipcMain } from 'electron';
import { container, Injectable } from '../di/index.js';
import { LoggerService } from './logger.service.js';
import { WindowService } from './window.service.js';

interface MessageOptions {
  type: 'none' | 'info' | 'warning' | 'error' | 'question';
  title: string;
  message: string;
}

interface AppInfo {
  name: string;
  version: string;
  platform: string;
  arch: string;
}

@Injectable({ scope: 'singleton', providedIn: 'root' })
export class IpcHandlerService {
  /**
   * Constructor injection with multiple dependencies
   * Dependencies are resolved in order by the container
   */
  constructor(
    private logger: LoggerService,
    private windowService: WindowService
  ) {}

  /**
   * Lifecycle hook called after initialization
   */
  onInit(): void {
    this.registerHandlers();
  }

  /**
   * Register all IPC handlers
   */
  registerHandlers(): void {
    this.logger.info('ipc', 'Registering IPC handlers');

    ipcMain.handle('get-app-info', async (): Promise<AppInfo> => {
      return {
        name: process.env.npm_package_name || 'Electron App',
        version: process.env.npm_package_version || '1.0.0',
        platform: process.platform,
        arch: process.arch,
      };
    });

    ipcMain.handle('show-message', async (_event: IpcMainInvokeEvent, options: MessageOptions) => {
      const window = this.windowService.getMain();
      if (!window) {
        this.logger.warn('ipc', 'No window available for show-message');
        return null;
      }
      return dialog.showMessageBox(window, {
        type: options.type,
        title: options.title,
        message: options.message,
      });
    });

    this.logger.info('ipc', 'IPC handlers registered');
  }

  /**
   * Set window reference (deprecated - use WindowService instead)
   */
  setWindow(win: BrowserWindow | null): void {
    this.logger.warn('ipc', 'setWindow is deprecated - use WindowService instead');
  }
}

// Export convenience instance (optional - prefer container.resolve in new code)
export const ipcHandlerService = container.resolve(IpcHandlerService);
