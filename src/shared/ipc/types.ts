/**
 * IPC Type Definitions
 * Type-safe contracts for IPC communication between main and renderer
 */

import type { AppInfo, LogEntryInput, LogLevel, MessageOptions } from '../types/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LogWriteRequest {
  entry: LogEntryInput;
}

export interface LogWriteResponse {
  success: boolean;
}

export interface LogGetLevelResponse {
  level: LogLevel;
}

export interface LogSetLevelRequest {
  level: LogLevel;
}

export interface LogSetLevelResponse {
  success: boolean;
  level: LogLevel;
}

// ═══════════════════════════════════════════════════════════════════════════
// WINDOW TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WindowCreateRequest {
  options: {
    id?: string;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    devTools?: boolean;
  };
}

export interface WindowCreateResponse {
  success: boolean;
  windowId?: string;
  error?: string;
}

export interface WindowCloseRequest {
  windowId: string;
}

export interface WindowCloseResponse {
  success: boolean;
}

export interface WindowGetAllResponse {
  windows: Array<{
    id: string;
    title: string;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AppGetInfoResponse {
  info: AppInfo;
}

export interface AppShowMessageRequest {
  options: MessageOptions;
}

export interface AppShowMessageResponse {
  response: number;
}

export interface AppGetPathsResponse {
  paths: {
    appData: string;
    userData: string;
    temp: string;
    logs: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FILE SYSTEM TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FsReadRequest {
  path: string;
  encoding?: 'utf-8' | 'binary' | 'base64';
}

export interface FsReadResponse {
  content: string;
  success: boolean;
  error?: string;
}

export interface FsWriteRequest {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'binary' | 'base64';
}

export interface FsWriteResponse {
  success: boolean;
  error?: string;
}

export interface FsExistsRequest {
  path: string;
}

export interface FsExistsResponse {
  exists: boolean;
}

export interface FsDeleteRequest {
  path: string;
}

export interface FsDeleteResponse {
  success: boolean;
  error?: string;
}

export interface FsListDirRequest {
  path: string;
}

export interface FsListDirResponse {
  files: string[];
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ConfigGetRequest {
  key: string;
}

export interface ConfigGetResponse {
  value: unknown;
  success: boolean;
}

export interface ConfigSetRequest {
  key: string;
  value: unknown;
}

export interface ConfigSetResponse {
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ErrorReportRequest {
  error: {
    name: string;
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
  };
}

export interface ErrorReportResponse {
  success: boolean;
  errorId?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVTOOLS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DevtoolsGetStatsResponse {
  stats: {
    uptime: number;
    memory: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
    app: {
      name: string;
      version: string;
    };
    runtime: {
      node: string;
      electron: string;
      chrome: string;
    };
    platform: {
      platform: string;
      arch: string;
      pid: number;
    };
    windows: {
      count: number;
    };
    eventBus: {
      totalPublished: number;
      totalReceived: number;
      activeSubscriptions: number;
      historySize: number;
      avgHandlingTime: number;
      eventsByChannel: Record<string, number>;
    };
  };
}

export interface DevtoolsGetLogsRequest {
  limit?: number;
}

export interface DevtoolsGetLogsResponse {
  logs: LogEntry[];
}

export interface ErrorGetHistoryResponse {
  errors: Array<{
    id: number;
    timestamp: string;
    name: string;
    message: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPES FOR REQUESTS AND RESPONSES
// ═══════════════════════════════════════════════════════════════════════════

export type IpcRequest =
  | LogWriteRequest
  | LogSetLevelRequest
  | WindowCreateRequest
  | WindowCloseRequest
  | AppShowMessageRequest
  | FsReadRequest
  | FsWriteRequest
  | FsExistsRequest
  | FsDeleteRequest
  | FsListDirRequest
  | ConfigGetRequest
  | ConfigSetRequest
  | ErrorReportRequest;

export type IpcResponse =
  | LogWriteResponse
  | LogGetLevelResponse
  | LogSetLevelResponse
  | WindowCreateResponse
  | WindowCloseResponse
  | WindowGetAllResponse
  | AppGetInfoResponse
  | AppShowMessageResponse
  | AppGetPathsResponse
  | FsReadResponse
  | FsWriteResponse
  | FsExistsResponse
  | FsDeleteResponse
  | FsListDirResponse
  | ConfigGetResponse
  | ConfigSetResponse
  | ErrorReportResponse
  | ErrorGetHistoryResponse;
