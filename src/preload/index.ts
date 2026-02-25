import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  log: (entry: {
    level: string;
    namespace: string;
    message: string;
    context?: Record<string, unknown>;
    error?: { name: string; message: string; stack?: string };
  }) => ipcRenderer.invoke('log:write', entry),

  getLogLevel: () => ipcRenderer.invoke('log:get-level'),

  setLogLevel: (level: string) => ipcRenderer.invoke('log:set-level', level),

  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  showMessage: (options: {
    type: 'none' | 'info' | 'warning' | 'error' | 'question';
    title: string;
    message: string;
  }) => ipcRenderer.invoke('show-message', options),
});
