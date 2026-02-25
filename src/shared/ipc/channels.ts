/**
 * Centralized IPC Channel Definitions
 * 
 * Usage:
 *   import { IPC_CHANNELS } from '@shared/ipc/channels';
 *   ipcMain.handle(IPC_CHANNELS.LOG.WRITE, handler);
 */

export const IPC_CHANNELS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════════════════════
  LOG: {
    WRITE: 'log:write',
    GET_LEVEL: 'log:get-level',
    SET_LEVEL: 'log:set-level',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WINDOW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
    CLOSE_ALL: 'window:close-all',
    GET_ALL: 'window:get-all',
    GET_STATE: 'window:get-state',
    SET_BOUNDS: 'window:set-bounds',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // APPLICATION
  // ═══════════════════════════════════════════════════════════════════════════
  APP: {
    INFO: 'get-app-info',
    QUIT: 'app:quit',
    SHOW_MESSAGE: 'show-message',
    GET_VERSION: 'app:get-version',
    GET_PATHS: 'app:get-paths',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  FS: {
    READ: 'fs:read',
    WRITE: 'fs:write',
    EXISTS: 'fs:exists',
    DELETE: 'fs:delete',
    LIST_DIR: 'fs:list-dir',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  CONFIG: {
    GET: 'config:get',
    SET: 'config:set',
    RESET: 'config:reset',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  ERROR: {
    REPORT: 'error:report',
    GET_HISTORY: 'error:get-history',
    CLEAR_HISTORY: 'error:clear-history',
  },
} as const;

/**
 * Type-safe channel access
 */
export type IpcChannels = typeof IPC_CHANNELS;
export type LogChannels = typeof IPC_CHANNELS.LOG;
export type WindowChannels = typeof IPC_CHANNELS.WINDOW;
export type AppChannels = typeof IPC_CHANNELS.APP;
export type FsChannels = typeof IPC_CHANNELS.FS;
export type ConfigChannels = typeof IPC_CHANNELS.CONFIG;
export type ErrorChannels = typeof IPC_CHANNELS.ERROR;

/**
 * Get all channel keys as array
 */
export function getAllChannels(): string[] {
  return Object.values(IPC_CHANNELS).flatMap(category =>
    Object.values(category)
  );
}

/**
 * Check if a string is a valid IPC channel
 */
export function isValidChannel(channel: string): boolean {
  return getAllChannels().includes(channel);
}
