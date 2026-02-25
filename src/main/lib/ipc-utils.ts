/**
 * IPC (Inter-Process Communication) utility functions for Electron main process
 */

import { BrowserWindow, type IpcMainEvent, ipcMain, type WebContents } from 'electron';

/**
 * Send a message to a specific webContents
 */
export function sendMessageToWebContents(
  webContents: WebContents,
  channel: string,
  ...args: any[]
): boolean {
  if (webContents.isDestroyed()) {
    return false;
  }
  webContents.send(channel, ...args);
  return true;
}

/**
 * Send a message to all windows
 */
export function broadcastMessage(channel: string, ...args: any[]): void {
  const allWindows = BrowserWindow.getAllWindows();

  allWindows.forEach((window: any) => {
    if (!window.webContents.isDestroyed()) {
      window.webContents.send(channel, ...args);
    }
  });
}

/**
 * Handle an IPC request once
 */
export function handleOnce(
  channel: string,
  listener: (event: IpcMainEvent, ...args: any[]) => void
): void {
  ipcMain.once(channel, listener);
}

/**
 * Remove an IPC handler
 */
export function removeHandler(channel: string): void {
  ipcMain.removeHandler(channel);
}

/**
 * Create a promise-based IPC handler
 */
export function createAsyncIpcHandler<T>(
  channel: string,
  handler: (event: any, ...args: any[]) => Promise<T> // Using 'any' to avoid type mismatch
): void {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error(`Error in IPC handler for ${channel}:`, error);
      throw error;
    }
  });
}

/**
 * Send a response back to the renderer with a unique response channel
 */
export function sendResponse(event: IpcMainEvent, responseChannel: string, response: any): void {
  event.sender.send(responseChannel, response);
}

/**
 * Create a timeout-based response mechanism
 */
export function createTimeoutResponse<T>(
  event: IpcMainEvent,
  responseChannel: string,
  timeout: number = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const listener = (event: IpcMainEvent, response: T) => {
      cleanup();
      resolve(response);
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`IPC response timeout for channel: ${responseChannel}`));
    }, timeout);

    const cleanup = () => {
      ipcMain.removeListener(responseChannel, listener as any);
      clearTimeout(timeoutId);
    };

    ipcMain.on(responseChannel, listener as any);
  });
}
