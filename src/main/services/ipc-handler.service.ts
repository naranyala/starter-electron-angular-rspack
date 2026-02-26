import { app, dialog, type IpcMainInvokeEvent, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/ipc/channels';
import { eventBus } from '../events/event-bus';
import type { AppInfo, MessageOptions } from '../../shared/types';
import { container, Injectable } from '../di/index';
import { LoggerService } from './logger.service';
import { WindowService } from './window.service';

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

    ipcMain.handle(IPC_CHANNELS.APP.INFO, async (): Promise<AppInfo> => {
      return {
        name: process.env.npm_package_name || 'Electron App',
        version: process.env.npm_package_version || '1.0.0',
        platform: process.platform,
        arch: process.arch,
      };
    });

    ipcMain.handle(IPC_CHANNELS.APP.SHOW_MESSAGE, async (_event: IpcMainInvokeEvent, options: MessageOptions) => {
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

    ipcMain.handle(IPC_CHANNELS.DEVTOOLS.GET_STATS, async () => {
      const memory = process.memoryUsage();
      const eventStats = eventBus.getStats();
      return {
        stats: {
          uptime: Math.floor(process.uptime()),
          memory: {
            rss: memory.rss,
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
          },
          app: {
            name: app.getName(),
            version: app.getVersion(),
          },
          runtime: {
            node: process.versions.node,
            electron: process.versions.electron,
            chrome: process.versions.chrome,
          },
          platform: {
            platform: process.platform,
            arch: process.arch,
            pid: process.pid,
          },
          windows: {
            count: this.windowService.getAll().length,
          },
          eventBus: eventStats,
        },
      };
    });

    ipcMain.handle(IPC_CHANNELS.DEVTOOLS.GET_LOGS, async (_event: IpcMainInvokeEvent, limit?: number) => {
      return { logs: this.logger.getRecent(limit ?? 50) };
    });

    this.logger.info('ipc', 'IPC handlers registered');
  }

  /**
   * Set window reference (deprecated - use WindowService instead)
   */
  setWindow(): void {
    this.logger.warn('ipc', 'setWindow is deprecated - use WindowService instead');
  }
}

// Export convenience instance (optional - prefer container.resolve in new code)
export const ipcHandlerService = container.resolve(IpcHandlerService);
