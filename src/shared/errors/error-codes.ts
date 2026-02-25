/**
 * Error Codes Enumeration
 * 
 * Centralized error codes for the entire application.
 * Each error code represents a specific error condition.
 * 
 * @module shared/errors
 */

export enum ErrorCode {
  // ═══════════════════════════════════════════════════════════════════════════
  // GENERAL ERRORS (0-99)
  // ═══════════════════════════════════════════════════════════════════════════
  Unknown = 'UNKNOWN',
  InternalError = 'INTERNAL_ERROR',
  NotImplemented = 'NOT_IMPLEMENTED',
  NotSupported = 'NOT_SUPPORTED',
  Deprecated = 'DEPRECATED',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION ERRORS (100-199)
  // ═══════════════════════════════════════════════════════════════════════════
  ValidationFailed = 'VALIDATION_FAILED',
  InvalidInput = 'INVALID_INPUT',
  InvalidFormat = 'INVALID_FORMAT',
  InvalidRange = 'INVALID_RANGE',
  MissingRequiredField = 'MISSING_REQUIRED_FIELD',
  FieldTooShort = 'FIELD_TOO_SHORT',
  FieldTooLong = 'FIELD_TOO_LONG',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPhone = 'INVALID_PHONE',
  InvalidUrl = 'INVALID_URL',
  InvalidDate = 'INVALID_DATE',
  InvalidType = 'INVALID_TYPE',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION ERRORS (200-299)
  // ═══════════════════════════════════════════════════════════════════════════
  AuthenticationRequired = 'AUTHENTICATION_REQUIRED',
  AuthenticationFailed = 'AUTHENTICATION_FAILED',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidToken = 'INVALID_TOKEN',
  TokenExpired = 'TOKEN_EXPIRED',
  TokenRevoked = 'TOKEN_REVOKED',
  SessionExpired = 'SESSION_EXPIRED',
  SessionInvalid = 'SESSION_INVALID',
  AccessDenied = 'ACCESS_DENIED',
  PermissionDenied = 'PERMISSION_DENIED',
  RoleInsufficient = 'ROLE_INSUFFICIENT',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RESOURCE ERRORS (300-399)
  // ═══════════════════════════════════════════════════════════════════════════
  ResourceNotFound = 'RESOURCE_NOT_FOUND',
  UserNotFound = 'USER_NOT_FOUND',
  EntityNotFound = 'ENTITY_NOT_FOUND',
  FileNotFound = 'FILE_NOT_FOUND',
  DirectoryNotFound = 'DIRECTORY_NOT_FOUND',
  ResourceAlreadyExists = 'RESOURCE_ALREADY_EXISTS',
  DuplicateEntry = 'DUPLICATE_ENTRY',
  ResourceLocked = 'RESOURCE_LOCKED',
  ResourceDeleted = 'RESOURCE_DELETED',
  ResourceModified = 'RESOURCE_MODIFIED',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE ERRORS (400-499)
  // ═══════════════════════════════════════════════════════════════════════════
  DatabaseError = 'DATABASE_ERROR',
  ConnectionFailed = 'CONNECTION_FAILED',
  ConnectionTimeout = 'CONNECTION_TIMEOUT',
  QueryFailed = 'QUERY_FAILED',
  TransactionFailed = 'TRANSACTION_FAILED',
  Deadlock = 'DEADLOCK',
  ConstraintViolation = 'CONSTRAINT_VIOLATION',
  DbAlreadyExists = 'DB_ALREADY_EXISTS',
  DbNotFound = 'DB_NOT_FOUND',
  DbReadOnly = 'DB_READ_ONLY',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FILE SYSTEM ERRORS (500-599)
  // ═══════════════════════════════════════════════════════════════════════════
  FileSystemError = 'FILE_SYSTEM_ERROR',
  FileReadError = 'FILE_READ_ERROR',
  FileWriteError = 'FILE_WRITE_ERROR',
  FileDeleteError = 'FILE_DELETE_ERROR',
  PermissionError = 'PERMISSION_ERROR',
  DiskFull = 'DISK_FULL',
  PathTooLong = 'PATH_TOO_LONG',
  InvalidPath = 'INVALID_PATH',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // NETWORK ERRORS (600-699)
  // ═══════════════════════════════════════════════════════════════════════════
  NetworkError = 'NETWORK_ERROR',
  ConnectionRefused = 'CONNECTION_REFUSED',
  ConnectionLost = 'CONNECTION_LOST',
  Timeout = 'TIMEOUT',
  DnsError = 'DNS_ERROR',
  SslError = 'SSL_ERROR',
  HttpError = 'HTTP_ERROR',
  ServerUnavailable = 'SERVER_UNAVAILABLE',
  RateLimitExceeded = 'RATE_LIMIT_EXCEEDED',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // IPC ERRORS (700-799)
  // ═══════════════════════════════════════════════════════════════════════════
  IpcError = 'IPC_ERROR',
  IpcTimeout = 'IPC_TIMEOUT',
  IpcChannelNotFound = 'IPC_CHANNEL_NOT_FOUND',
  IpcHandlerNotFound = 'IPC_HANDLER_NOT_FOUND',
  IpcInvalidPayload = 'IPC_INVALID_PAYLOAD',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WINDOW ERRORS (800-899)
  // ═══════════════════════════════════════════════════════════════════════════
  WindowError = 'WINDOW_ERROR',
  WindowNotFound = 'WINDOW_NOT_FOUND',
  WindowCreationFailed = 'WINDOW_CREATION_FAILED',
  WindowCloseFailed = 'WINDOW_CLOSE_FAILED',
  WindowAlreadyExists = 'WINDOW_ALREADY_EXISTS',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION ERRORS (900-999)
  // ═══════════════════════════════════════════════════════════════════════════
  ConfigurationError = 'CONFIGURATION_ERROR',
  ConfigNotFound = 'CONFIG_NOT_FOUND',
  ConfigInvalid = 'CONFIG_INVALID',
  ConfigMissing = 'CONFIG_MISSING',
  ConfigReadOnly = 'CONFIG_READ_ONLY',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE ERRORS (1000-1099)
  // ═══════════════════════════════════════════════════════════════════════════
  StateError = 'STATE_ERROR',
  InvalidState = 'INVALID_STATE',
  StateTransitionFailed = 'STATE_TRANSITION_FAILED',
  StateNotFound = 'STATE_NOT_FOUND',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE ERRORS (1100-1199)
  // ═══════════════════════════════════════════════════════════════════════════
  CacheError = 'CACHE_ERROR',
  CacheMiss = 'CACHE_MISS',
  CacheExpired = 'CACHE_EXPIRED',
  CacheInvalid = 'CACHE_INVALID',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL SERVICE ERRORS (1200-1299)
  // ═══════════════════════════════════════════════════════════════════════════
  ExternalServiceError = 'EXTERNAL_SERVICE_ERROR',
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',
  ServiceTimeout = 'SERVICE_TIMEOUT',
  ServiceResponseInvalid = 'SERVICE_RESPONSE_INVALID',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC ERRORS (1300-1399)
  // ═══════════════════════════════════════════════════════════════════════════
  BusinessRuleViolation = 'BUSINESS_RULE_VIOLATION',
  OperationNotAllowed = 'OPERATION_NOT_ALLOWED',
  OperationFailed = 'OPERATION_FAILED',
  OperationCancelled = 'OPERATION_CANCELLED',
  PrerequisiteNotMet = 'PREREQUISITE_NOT_MET',
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOCK ERRORS (1400-1499)
  // ═══════════════════════════════════════════════════════════════════════════
  LockError = 'LOCK_ERROR',
  LockAcquisitionFailed = 'LOCK_ACQUISITION_FAILED',
  LockTimeout = 'LOCK_TIMEOUT',
  LockPoisoned = 'LOCK_POISONED',
  DeadlockDetected = 'DEADLOCK_DETECTED',
}

/**
 * Get human-readable message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.Unknown]: 'An unknown error occurred',
    [ErrorCode.InternalError]: 'An internal error occurred',
    [ErrorCode.NotImplemented]: 'This feature is not implemented',
    [ErrorCode.NotSupported]: 'This operation is not supported',
    [ErrorCode.Deprecated]: 'This feature is deprecated',
    
    [ErrorCode.ValidationFailed]: 'Validation failed',
    [ErrorCode.InvalidInput]: 'Invalid input provided',
    [ErrorCode.InvalidFormat]: 'Invalid format',
    [ErrorCode.InvalidRange]: 'Value out of valid range',
    [ErrorCode.MissingRequiredField]: 'Required field is missing',
    [ErrorCode.FieldTooShort]: 'Field value is too short',
    [ErrorCode.FieldTooLong]: 'Field value is too long',
    [ErrorCode.InvalidEmail]: 'Invalid email address',
    [ErrorCode.InvalidPhone]: 'Invalid phone number',
    [ErrorCode.InvalidUrl]: 'Invalid URL',
    [ErrorCode.InvalidDate]: 'Invalid date',
    [ErrorCode.InvalidType]: 'Invalid type',
    
    [ErrorCode.AuthenticationRequired]: 'Authentication required',
    [ErrorCode.AuthenticationFailed]: 'Authentication failed',
    [ErrorCode.InvalidCredentials]: 'Invalid credentials',
    [ErrorCode.InvalidToken]: 'Invalid token',
    [ErrorCode.TokenExpired]: 'Token has expired',
    [ErrorCode.TokenRevoked]: 'Token has been revoked',
    [ErrorCode.SessionExpired]: 'Session has expired',
    [ErrorCode.SessionInvalid]: 'Invalid session',
    [ErrorCode.AccessDenied]: 'Access denied',
    [ErrorCode.PermissionDenied]: 'Permission denied',
    [ErrorCode.RoleInsufficient]: 'Insufficient role permissions',
    
    [ErrorCode.ResourceNotFound]: 'Resource not found',
    [ErrorCode.UserNotFound]: 'User not found',
    [ErrorCode.EntityNotFound]: 'Entity not found',
    [ErrorCode.FileNotFound]: 'File not found',
    [ErrorCode.DirectoryNotFound]: 'Directory not found',
    [ErrorCode.ResourceAlreadyExists]: 'Resource already exists',
    [ErrorCode.DuplicateEntry]: 'Duplicate entry',
    [ErrorCode.ResourceLocked]: 'Resource is locked',
    [ErrorCode.ResourceDeleted]: 'Resource has been deleted',
    [ErrorCode.ResourceModified]: 'Resource has been modified',
    
    [ErrorCode.DatabaseError]: 'Database error',
    [ErrorCode.ConnectionFailed]: 'Connection failed',
    [ErrorCode.ConnectionTimeout]: 'Connection timeout',
    [ErrorCode.QueryFailed]: 'Query failed',
    [ErrorCode.TransactionFailed]: 'Transaction failed',
    [ErrorCode.Deadlock]: 'Deadlock detected',
    [ErrorCode.ConstraintViolation]: 'Constraint violation',
    [ErrorCode.DbAlreadyExists]: 'Database already exists',
    [ErrorCode.DbNotFound]: 'Database not found',
    [ErrorCode.DbReadOnly]: 'Database is read-only',
    
    [ErrorCode.FileSystemError]: 'File system error',
    [ErrorCode.FileReadError]: 'Failed to read file',
    [ErrorCode.FileWriteError]: 'Failed to write file',
    [ErrorCode.FileDeleteError]: 'Failed to delete file',
    [ErrorCode.PermissionError]: 'Permission denied',
    [ErrorCode.DiskFull]: 'Disk is full',
    [ErrorCode.PathTooLong]: 'Path is too long',
    [ErrorCode.InvalidPath]: 'Invalid path',
    
    [ErrorCode.NetworkError]: 'Network error',
    [ErrorCode.ConnectionRefused]: 'Connection refused',
    [ErrorCode.ConnectionLost]: 'Connection lost',
    [ErrorCode.Timeout]: 'Operation timed out',
    [ErrorCode.DnsError]: 'DNS error',
    [ErrorCode.SslError]: 'SSL error',
    [ErrorCode.HttpError]: 'HTTP error',
    [ErrorCode.ServerUnavailable]: 'Server unavailable',
    [ErrorCode.RateLimitExceeded]: 'Rate limit exceeded',
    
    [ErrorCode.IpcError]: 'IPC error',
    [ErrorCode.IpcTimeout]: 'IPC timeout',
    [ErrorCode.IpcChannelNotFound]: 'IPC channel not found',
    [ErrorCode.IpcHandlerNotFound]: 'IPC handler not found',
    [ErrorCode.IpcInvalidPayload]: 'Invalid IPC payload',
    
    [ErrorCode.WindowError]: 'Window error',
    [ErrorCode.WindowNotFound]: 'Window not found',
    [ErrorCode.WindowCreationFailed]: 'Window creation failed',
    [ErrorCode.WindowCloseFailed]: 'Window close failed',
    [ErrorCode.WindowAlreadyExists]: 'Window already exists',
    
    [ErrorCode.ConfigurationError]: 'Configuration error',
    [ErrorCode.ConfigNotFound]: 'Configuration not found',
    [ErrorCode.ConfigInvalid]: 'Invalid configuration',
    [ErrorCode.ConfigMissing]: 'Configuration missing',
    [ErrorCode.ConfigReadOnly]: 'Configuration is read-only',
    
    [ErrorCode.StateError]: 'State error',
    [ErrorCode.InvalidState]: 'Invalid state',
    [ErrorCode.StateTransitionFailed]: 'State transition failed',
    [ErrorCode.StateNotFound]: 'State not found',
    
    [ErrorCode.CacheError]: 'Cache error',
    [ErrorCode.CacheMiss]: 'Cache miss',
    [ErrorCode.CacheExpired]: 'Cache expired',
    [ErrorCode.CacheInvalid]: 'Cache invalid',
    
    [ErrorCode.ExternalServiceError]: 'External service error',
    [ErrorCode.ServiceUnavailable]: 'Service unavailable',
    [ErrorCode.ServiceTimeout]: 'Service timeout',
    [ErrorCode.ServiceResponseInvalid]: 'Invalid service response',
    
    [ErrorCode.BusinessRuleViolation]: 'Business rule violation',
    [ErrorCode.OperationNotAllowed]: 'Operation not allowed',
    [ErrorCode.OperationFailed]: 'Operation failed',
    [ErrorCode.OperationCancelled]: 'Operation cancelled',
    [ErrorCode.PrerequisiteNotMet]: 'Prerequisite not met',
    
    [ErrorCode.LockError]: 'Lock error',
    [ErrorCode.LockAcquisitionFailed]: 'Lock acquisition failed',
    [ErrorCode.LockTimeout]: 'Lock timeout',
    [ErrorCode.LockPoisoned]: 'Lock poisoned',
    [ErrorCode.DeadlockDetected]: 'Deadlock detected',
  };
  
  return messages[code] || 'An error occurred';
}

/**
 * Check if error code is recoverable
 */
export function isRecoverableError(code: ErrorCode): boolean {
  const recoverableCodes: ErrorCode[] = [
    ErrorCode.ValidationFailed,
    ErrorCode.InvalidInput,
    ErrorCode.MissingRequiredField,
    ErrorCode.AuthenticationFailed,
    ErrorCode.InvalidCredentials,
    ErrorCode.TokenExpired,
    ErrorCode.SessionExpired,
    ErrorCode.NetworkError,
    ErrorCode.Timeout,
    ErrorCode.ConnectionLost,
    ErrorCode.CacheMiss,
    ErrorCode.CacheExpired,
    ErrorCode.ServiceUnavailable,
    ErrorCode.RateLimitExceeded,
  ];
  
  return recoverableCodes.includes(code);
}

/**
 * Check if error code is a client error
 */
export function isClientError(code: ErrorCode): boolean {
  const clientErrorCodes: ErrorCode[] = [
    ErrorCode.ValidationFailed,
    ErrorCode.InvalidInput,
    ErrorCode.InvalidFormat,
    ErrorCode.MissingRequiredField,
    ErrorCode.AuthenticationRequired,
    ErrorCode.AuthenticationFailed,
    ErrorCode.InvalidCredentials,
    ErrorCode.AccessDenied,
    ErrorCode.PermissionDenied,
    ErrorCode.ResourceNotFound,
  ];
  
  return clientErrorCodes.includes(code);
}

/**
 * Check if error code is a server error
 */
export function isServerError(code: ErrorCode): boolean {
  const serverErrorCodes: ErrorCode[] = [
    ErrorCode.InternalError,
    ErrorCode.DatabaseError,
    ErrorCode.ConnectionFailed,
    ErrorCode.FileSystemError,
    ErrorCode.NetworkError,
    ErrorCode.IpcError,
    ErrorCode.ConfigurationError,
  ];
  
  return serverErrorCodes.includes(code);
}
