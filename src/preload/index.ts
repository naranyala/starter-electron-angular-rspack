import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc/channels';
import type { LogEntryInput, LogLevel, MessageOptions } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  log: (entry: LogEntryInput) => ipcRenderer.invoke(IPC_CHANNELS.LOG.WRITE, entry),

  getLogLevel: () => ipcRenderer.invoke(IPC_CHANNELS.LOG.GET_LEVEL),

  setLogLevel: (level: LogLevel) => ipcRenderer.invoke(IPC_CHANNELS.LOG.SET_LEVEL, level),

  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.APP.INFO),

  showMessage: (options: MessageOptions) => ipcRenderer.invoke(IPC_CHANNELS.APP.SHOW_MESSAGE, options),

  getBackendStats: () => ipcRenderer.invoke(IPC_CHANNELS.DEVTOOLS.GET_STATS),

  getBackendLogs: (limit: number = 50) =>
    ipcRenderer.invoke(IPC_CHANNELS.DEVTOOLS.GET_LOGS, limit),
});
