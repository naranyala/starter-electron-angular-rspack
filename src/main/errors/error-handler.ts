/**
 * Backend Error Handling Utilities
 * 
 * Utilities for handling errors in the main process using "errors as values" pattern.
 */

import type { ErrorValue, Result, AsyncResult } from '@shared/errors/index';
import { ErrorCode, errFromCode, errFromException, ok, tryAsync } from '@shared/errors/index';
import { LoggerService } from '../services/logger.service';

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  /** Log errors automatically */
  logErrors: boolean;
  /** Include stack traces in logs */
  includeStack: boolean;
  /** Default error code for unknown errors */
  defaultCode: ErrorCode;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logErrors: true,
  includeStack: true,
  defaultCode: ErrorCode.InternalError,
};

/**
 * Backend Error Handler
 * 
 * Provides utilities for handling errors in the main process.
 */
export class ErrorHandler {
  private logger: LoggerService;
  private config: ErrorHandlerConfig;

  constructor(logger: LoggerService, config?: Partial<ErrorHandlerConfig>) {
    this.logger = logger;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle a promise that might reject, converting to Result
   */
  async handle<T>(
    promise: Promise<T>,
    errorCode?: ErrorCode,
    context?: Record<string, unknown>
  ): AsyncResult<T> {
    return tryAsync(async () => {
      return await promise;
    }).then(result => {
      if (result.ok === false) {
        const error: ErrorValue = {
          ...result.error,
          code: errorCode || result.error.code,
          context: {
            ...result.error.context,
            ...context,
          },
        };
        
        if (this.config.logErrors) {
          this.logError(error);
        }
        
        return { ok: false, error };
      }
      return result;
    });
  }

  /**
   * Handle a function that might throw, converting to Result
   */
  handleSync<T>(
    fn: () => T,
    errorCode?: ErrorCode,
    context?: Record<string, unknown>
  ): Result<T> {
    try {
      return ok(fn());
    } catch (error) {
      const errorValue: ErrorValue = errorFromException(error, errorCode).error;
      const enrichedError: ErrorValue = {
        ...errorValue,
        context: {
          ...errorValue.context,
          ...context,
        },
      };
      
      if (this.config.logErrors) {
        this.logError(enrichedError);
      }
      
      return { ok: false, error: enrichedError };
    }
  }

  /**
   * Handle IPC handler with error conversion
   */
  handleIpc<T>(
    handler: () => Promise<T>,
    channel: string
  ): Promise<Result<T>> {
    return this.handle(
      handler(),
      ErrorCode.IpcError,
      { channel }
    );
  }

  /**
   * Log an error value
   */
  logError(error: ErrorValue, namespace = 'error-handler'): void {
    this.logger.error(namespace, error.message, {
      code: error.code,
      context: error.context,
      field: error.field,
    }, error);
  }

  /**
   * Create a validation error
   */
  validationError(
    field: string,
    message: string,
    context?: Record<string, unknown>
  ): ErrorValue {
    return {
      code: ErrorCode.ValidationFailed,
      message,
      field,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a not found error
   */
  notFoundError(
    resource: string,
    id: string | number,
    context?: Record<string, unknown>
  ): ErrorValue {
    return {
      code: ErrorCode.ResourceNotFound,
      message: `${resource} not found: ${id}`,
      context: {
        resource,
        id: String(id),
        ...context,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create an invalid input error
   */
  invalidInputError(
    message: string,
    context?: Record<string, unknown>
  ): ErrorValue {
    return {
      code: ErrorCode.InvalidInput,
      message,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Wrap a service method with error handling
   */
  wrapService<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    defaultCode: ErrorCode = ErrorCode.OperationFailed
  ): (...args: Parameters<T>) => ReturnType<T> {
    return async (...args: Parameters<T>): Promise<Result<Awaited<ReturnType<T>>>> => {
      try {
        const result = await fn(...args);
        return ok(result);
      } catch (error) {
        const errorValue = errorFromException(error, defaultCode);
        if (this.config.logErrors) {
          this.logError(errorValue);
        }
        return { ok: false, error: errorValue };
      }
    };
  }
}

/**
 * Create error handler with logger
 */
export function createErrorHandler(logger: LoggerService): ErrorHandler {
  return new ErrorHandler(logger);
}

/**
 * Type-safe IPC handler wrapper
 */
export function createIpcHandler<TRequest, TResponse>(
  handler: (request: TRequest) => AsyncResult<TResponse>,
  errorHandler: ErrorHandler,
  channel: string
) {
  return async (request: TRequest): Promise<Result<TResponse>> => {
    return errorHandler.handleIpc(
      () => handler(request),
      channel
    );
  };
}
