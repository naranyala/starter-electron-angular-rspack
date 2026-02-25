/**
 * IPC (Inter-Process Communication) utilities
 * Handles communication between main and renderer processes
 */

import { BrowserWindow, ipcMain } from 'electron';

export interface IPCChannel {
  channel: string;
  handler: (...args: any[]) => any | Promise<any>;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export class IPCManager {
  private static instance: IPCManager;
  private handlers: Map<string, Function> = new Map();

  private constructor() {
    this.setupDefaultHandlers();
  }

  static getInstance(): IPCManager {
    if (!IPCManager.instance) {
      IPCManager.instance = new IPCManager();
    }
    return IPCManager.instance;
  }

  /**
   * Set up default IPC handlers
   */
  private setupDefaultHandlers(): void {
    // System info handler
    this.register('system-info', () => {
      const os = require('node:os');
      return {
        platform: os.platform(),
        arch: os.arch(),
        version: os.version(),
        nodeVersion: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
      };
    });

    // App info handler
    this.register('app-info', () => {
      const { app } = require('electron');
      return {
        name: app.getName(),
        version: app.getVersion(),
        path: app.getAppPath(),
        userDataPath: app.getPath('userData'),
      };
    });

    // Window actions handler
    this.register('window-action', (action: string, windowId?: number) => {
      const targetWindow = windowId
        ? BrowserWindow.fromId(windowId)
        : BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

      if (!targetWindow) {
        throw new Error('No target window found');
      }

      switch (action) {
        case 'minimize':
          targetWindow.minimize();
          break;
        case 'maximize':
          targetWindow.maximize();
          break;
        case 'unmaximize':
          targetWindow.unmaximize();
          break;
        case 'close':
          targetWindow.close();
          break;
        case 'reload':
          targetWindow.reload();
          break;
        case 'devtools':
          targetWindow.webContents.toggleDevTools();
          break;
        case 'center':
          targetWindow.center();
          break;
        default:
          throw new Error(`Unknown window action: ${action}`);
      }

      return { success: true };
    });
  }

  /**
   * Register an IPC handler
   */
  register(channel: string, handler: Function): void {
    if (this.handlers.has(channel)) {
      console.warn(`IPC handler already registered for channel: ${channel}`);
      return;
    }

    this.handlers.set(channel, handler);

    ipcMain.handle(channel, async (event: any, ...args: any[]) => {
      try {
        const result = await handler(...args, {
          sender: event.sender,
          frameId: event.frameId,
          processId: event.processId,
        });

        return {
          success: true,
          data: result,
          timestamp: Date.now(),
        } as IPCResponse;
      } catch (error: any) {
        console.error(`IPC Error on channel '${channel}':`, error);
        return {
          success: false,
          error: error.message || 'Unknown error',
          timestamp: Date.now(),
        } as IPCResponse;
      }
    });

    console.log(`IPC handler registered: ${channel}`);
  }

  /**
   * Unregister an IPC handler
   */
  unregister(channel: string): void {
    if (!this.handlers.has(channel)) {
      console.warn(`No IPC handler found for channel: ${channel}`);
      return;
    }

    this.handlers.delete(channel);
    ipcMain.removeAllListeners(channel);
    console.log(`IPC handler unregistered: ${channel}`);
  }

  /**
   * Send message to renderer process
   */
  send(channel: string, data: any, targetWindow?: BrowserWindow): boolean {
    try {
      const window =
        targetWindow || BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

      if (!window) {
        console.error('No target window available for IPC send');
        return false;
      }

      window.webContents.send(channel, {
        success: true,
        data,
        timestamp: Date.now(),
      } as IPCResponse);

      return true;
    } catch (error: any) {
      console.error(`Failed to send IPC message to channel '${channel}':`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all renderer processes
   */
  broadcast(channel: string, data: any): void {
    const windows = BrowserWindow.getAllWindows();
    let successCount = 0;

    windows.forEach((window: Electron.BrowserWindow) => {
      if (this.send(channel, data, window)) {
        successCount++;
      }
    });

    console.log(
      `Broadcast sent to ${successCount}/${windows.length} windows on channel: ${channel}`
    );
  }

  /**
   * Get list of registered handlers
   */
  getRegisteredChannels(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if channel is registered
   */
  isChannelRegistered(channel: string): boolean {
    return this.handlers.has(channel);
  }

  /**
   * Clear all handlers (useful for cleanup)
   */
  clearAllHandlers(): void {
    const channels = this.getRegisteredChannels();
    channels.forEach((channel) => this.unregister(channel));
    console.log('All IPC handlers cleared');
  }
}

// Export singleton instance
export const ipc = IPCManager.getInstance();
