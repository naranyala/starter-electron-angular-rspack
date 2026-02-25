/**
 * Frontend Error Service
 * 
 * Implements "errors as values" pattern for Angular applications.
 */

import { Injectable, signal, computed } from '@angular/core';
import { getLogger } from '../../viewmodels/logger.viewmodel.js';

export enum ErrorCode {
  Unknown = 'UNKNOWN',
  InternalError = 'INTERNAL_ERROR',
  ValidationFailed = 'VALIDATION_FAILED',
  InvalidInput = 'INVALID_INPUT',
  ResourceNotFound = 'RESOURCE_NOT_FOUND',
  UserNotFound = 'USER_NOT_FOUND',
  AuthenticationFailed = 'AUTHENTICATION_FAILED',
  NetworkError = 'NETWORK_ERROR',
  Timeout = 'TIMEOUT',
}

export interface ErrorValue {
  code: ErrorCode;
  message: string;
  details?: string;
  stack?: string;
  field?: string;
  context?: Record<string, unknown>;
  timestamp?: string;
}

export interface ErrorState {
  id: number;
  error: ErrorValue;
  title: string;
  userMessage: string;
  timestamp: string;
  source: string;
  dismissed: boolean;
}

export interface ErrorContext {
  source?: string;
  title?: string;
  recoverable?: boolean;
}

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E = ErrorValue> = Ok<T> | Err<E>;
export type AsyncResult<T, E = ErrorValue> = Promise<Result<T, E>>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

export function errFromException(
  error: unknown,
  code: ErrorCode = ErrorCode.InternalError
): Err<ErrorValue> {
  const errorValue: ErrorValue = {
    code,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };
  return err(errorValue);
}

export function toUserMessage(error: ErrorValue): string {
  let message = error.message;
  if (error.field) {
    message = `${error.field}: ${message}`;
  }
  return message;
}

@Injectable({ providedIn: 'root' })
export class FrontendErrorService {
  private readonly logger = getLogger('error.service');
  private sequence = 0;
  
  readonly activeError = signal<ErrorState | null>(null);
  readonly errorHistory = signal<ErrorState[]>([]);
  readonly errorCount = computed(() => this.errorHistory().length);
  readonly hasError = computed(() => this.activeError() !== null);

  handleResult<T>(result: Result<T>, context: ErrorContext = {}): T | null {
    if (isOk(result)) {
      return result.value;
    }
    this.report(result.error, context);
    return null;
  }

  async handleAsyncResult<T>(
    result: AsyncResult<T>,
    context: ErrorContext = {}
  ): Promise<T | null> {
    const resolved = await result;
    return this.handleResult(resolved, context);
  }

  async handleAsync<T>(
    promise: Promise<T>,
    errorMessage?: string,
    context: ErrorContext = {}
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      const errorValue: ErrorValue = {
        code: ErrorCode.InternalError,
        message: errorMessage || 'An error occurred',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      };
      this.report(errorValue, context);
      return null;
    }
  }

  handleResultWith<T, E>(
    result: Result<T, E>,
    onError: (error: E) => ErrorValue,
    context: ErrorContext = {}
  ): T | null {
    if (isOk(result)) {
      return result.value;
    }
    const errorValue = onError(result.error);
    this.report(errorValue, context);
    return null;
  }

  report(error: ErrorValue, context: ErrorContext = {}): ErrorState {
    const state = this.createErrorState(error, context);
    this.activeError.set(state);
    this.errorHistory.update(history => [...history, state]);
    this.logError(state, error);
    return state;
  }

  validationError(
    field: string,
    message: string,
    context: ErrorContext = {}
  ): ErrorState {
    const error: ErrorValue = {
      code: ErrorCode.ValidationFailed,
      message,
      field,
      timestamp: new Date().toISOString(),
    };
    return this.report(error, { ...context, source: 'validation' });
  }

  notFoundError(
    resource: string,
    id: string | number,
    context: ErrorContext = {}
  ): ErrorState {
    const error: ErrorValue = {
      code: ErrorCode.ResourceNotFound,
      message: `${resource} not found: ${id}`,
      context: { resource, id: String(id) },
      timestamp: new Date().toISOString(),
    };
    return this.report(error, context);
  }

  fromException(
    exception: unknown,
    defaultCode: ErrorCode = ErrorCode.InternalError
  ): ErrorValue {
    return errFromException(exception, defaultCode).error;
  }

  dismiss(): void {
    const current = this.activeError();
    if (current) {
      this.activeError.update(state => 
        state ? { ...state, dismissed: true } : null
      );
    }
  }

  clear(): void {
    this.activeError.set(null);
    this.errorHistory.set([]);
  }

  clearHistory(): void {
    this.errorHistory.set([]);
  }

  hasActiveError(): boolean {
    return this.activeError() !== null;
  }

  getCurrentErrorCode(): ErrorCode | null {
    const error = this.activeError();
    return error?.error.code ?? null;
  }

  isErrorCode(code: ErrorCode): boolean {
    return this.getCurrentErrorCode() === code;
  }

  getErrorById(id: number): ErrorState | undefined {
    return this.errorHistory().find(e => e.id === id);
  }

  dismissById(id: number): boolean {
    const error = this.getErrorById(id);
    if (error) {
      this.errorHistory.update(history =>
        history.map(e => e.id === id ? { ...e, dismissed: true } : e)
      );
      if (this.activeError()?.id === id) {
        this.dismiss();
      }
      return true;
    }
    return false;
  }

  private createErrorState(error: ErrorValue, context: ErrorContext): ErrorState {
    const timestamp = new Date().toISOString();
    const source = context.source ?? 'unknown';
    const title = context.title ?? this.getDefaultTitle(error.code);
    const userMessage = toUserMessage(error);

    return {
      id: ++this.sequence,
      error,
      title,
      userMessage,
      source,
      timestamp,
      dismissed: false,
    };
  }

  private getDefaultTitle(code: ErrorCode): string {
    const titles: Record<string, string> = {
      [ErrorCode.ValidationFailed]: 'Validation Error',
      [ErrorCode.ResourceNotFound]: 'Not Found',
      [ErrorCode.UserNotFound]: 'User Not Found',
      [ErrorCode.InternalError]: 'System Error',
    };
    return titles[code] || 'Error';
  }

  private logError(state: ErrorState, error: ErrorValue): void {
    this.logger.error(
      'Error reported',
      {
        id: state.id,
        source: state.source,
        title: state.title,
        code: error.code,
      },
      error
    );
  }
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode?: ErrorCode
): AsyncResult<T> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return errFromException(error, errorCode);
  }
}

export function tryCatchSync<T>(
  fn: () => T,
  errorCode?: ErrorCode
): Result<T> {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return errFromException(error, errorCode);
  }
}
