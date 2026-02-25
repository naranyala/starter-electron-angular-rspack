/**
 * Result Type and Error Value Types
 * 
 * Core types for "errors as values" pattern.
 * Instead of throwing exceptions, functions return Result types.
 * 
 * @module shared/errors
 */

import { type ErrorCode } from './error-codes.js';

// ═══════════════════════════════════════════════════════════════════════════
// ERROR VALUE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base error value structure
 * All errors should conform to this interface
 */
export interface ErrorValue {
  /** Error code for programmatic handling */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional detailed error information */
  details?: string;
  /** Optional stack trace (for exceptions) */
  stack?: string;
  /** Optional field that caused the error */
  field?: string;
  /** Optional additional context */
  context?: Record<string, unknown>;
  /** Optional inner/cause error */
  cause?: ErrorValue;
  /** Optional timestamp when error occurred */
  timestamp?: string;
}

/**
 * Create an error value from an Error object
 */
export function errorFromException(
  error: unknown,
  code: ErrorCode = ErrorCode.InternalError
): ErrorValue {
  if (error instanceof Error) {
    return {
      code,
      message: error.message,
      details: error.stack,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };
  }
  
  if (typeof error === 'string') {
    return {
      code,
      message: error,
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    code,
    message: 'An unknown error occurred',
    details: JSON.stringify(error),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error value from error code and message
 */
export function createError(
  code: ErrorCode,
  message?: string,
  context?: Record<string, unknown>
): ErrorValue {
  return {
    code,
    message: message || code,
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Add context to an error value
 */
export function withContext<T extends ErrorValue>(
  error: T,
  context: Record<string, unknown>
): T {
  return {
    ...error,
    context: {
      ...error.context,
      ...context,
    },
  };
}

/**
 * Chain a cause to an error value
 */
export function withCause<T extends ErrorValue>(
  error: T,
  cause: ErrorValue
): T {
  return {
    ...error,
    cause,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Success result with optional value
 */
export interface Ok<T = void> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Error result with error value
 */
export interface Err<E = ErrorValue> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result type - either Ok or Err
 */
export type Result<T, E = ErrorValue> = Ok<T> | Err<E>;

/**
 * Async result type
 */
export type AsyncResult<T, E = ErrorValue> = Promise<Result<T, E>>;

// ═══════════════════════════════════════════════════════════════════════════
// RESULT CONSTRUCTORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a success result
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Create a success result with no value
 */
export function okVoid(): Ok<void> {
  return { ok: true, value: undefined };
}

/**
 * Create an error result
 */
export function err<E = ErrorValue>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Create an error result from error code
 */
export function errFromCode(
  code: ErrorCode,
  message?: string,
  context?: Record<string, unknown>
): Err<ErrorValue> {
  return err(createError(code, message, context));
}

/**
 * Create an error result from exception
 */
export function errFromException(
  error: unknown,
  code?: ErrorCode
): Err<ErrorValue> {
  return err(errorFromException(error, code));
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if result is Ok
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

/**
 * Check if result is Err
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Check if result is Ok with specific value type
 */
export function isOkWith<T>(result: Result<unknown>, _type: T): result is Ok<T> {
  return result.ok === true;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract value from Ok result or throw error
 */
export function unwrap<T>(result: Result<T>): T {
  if (isOk(result)) {
    return result.value;
  }
  throw new ResultError(result.error);
}

/**
 * Extract value from Ok result or return default
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return isOk(result) ? result.value : defaultValue;
}

/**
 * Extract value from Ok result or compute default
 */
export function unwrapOrElse<T>(result: Result<T>, fn: (error: ErrorValue) => T): T {
  return isOk(result) ? result.value : fn(result.error);
}

/**
 * Extract error from Err result or throw
 */
export function unwrapError<E>(result: Result<unknown, E>): E {
  if (isErr(result)) {
    return result.error;
  }
  throw new Error('Expected Err but got Ok');
}

/**
 * Map value in Ok result
 */
export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (isOk(result)) {
    return ok(fn(result.value));
  }
  return result as Result<U>;
}

/**
 * Map error in Err result
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (isErr(result)) {
    return err(fn(result.error));
  }
  return result as Result<T, F>;
}

/**
 * Chain operations on Ok result
 */
export function andThen<T, U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U> {
  if (isOk(result)) {
    return fn(result.value);
  }
  return result as Result<U>;
}

/**
 * Chain operations on Err result
 */
export function orElse<T, E, F>(result: Result<T, E>, fn: (error: E) => Result<T, F>): Result<T, F> {
  if (isErr(result)) {
    return fn(result.error);
  }
  return result as Result<T, F>;
}

/**
 * Convert Result to Option (Some | None)
 */
export function toOption<T>(result: Result<T>): Option<T> {
  return isOk(result) ? some(result.value) : none();
}

/**
 * Get value or null
 */
export function toNull<T>(result: Result<T>): T | null {
  return isOk(result) ? result.value : null;
}

/**
 * Get value or undefined
 */
export function toUndefined<T>(result: Result<T>): T | undefined {
  return isOk(result) ? result.value : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// OPTION TYPES (for completeness)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Some value
 */
export interface Some<T> {
  readonly some: true;
  readonly value: T;
}

/**
 * No value
 */
export interface None {
  readonly some: false;
}

/**
 * Option type - either Some or None
 */
export type Option<T> = Some<T> | None;

/**
 * Create Some option
 */
export function some<T>(value: T): Some<T> {
  return { some: true, value };
}

/**
 * Create None option
 */
export function none(): None {
  return { some: false };
}

/**
 * Check if option is Some
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option.some === true;
}

/**
 * Check if option is None
 */
export function isNone<T>(option: Option<T>): option is None {
  return option.some === false;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXCEPTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Error thrown when unwrapping Err result
 */
export class ResultError extends Error {
  constructor(
    public readonly error: ErrorValue,
    message?: string
  ) {
    super(message || error.message);
    this.name = 'ResultError';
    this.stack = error.stack || new Error().stack;
  }
}

/**
 * Convert async function that throws to Result
 */
export async function tryAsync<T>(
  fn: () => Promise<T>
): AsyncResult<T> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return errFromException(error);
  }
}

/**
 * Convert sync function that throws to Result
 */
export function trySync<T>(
  fn: () => T
): Result<T> {
  try {
    return ok(fn());
  } catch (error) {
    return errFromException(error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FOR CONVERTING TO USER MESSAGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert error value to user-friendly message
 */
export function toUserMessage(error: ErrorValue, includeCode = false): string {
  let message = error.message;
  
  // Add field info if present
  if (error.field) {
    message = `${error.field}: ${message}`;
  }
  
  // Add code if requested
  if (includeCode) {
    message = `[${error.code}] ${message}`;
  }
  
  // For recoverable errors, add helpful suffix
  if (error.code && [
    'VALIDATION_FAILED',
    'INVALID_INPUT',
    'MISSING_REQUIRED_FIELD',
    'AUTHENTICATION_FAILED',
    'INVALID_CREDENTIALS',
    'TOKEN_EXPIRED',
    'SESSION_EXPIRED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'CONNECTION_LOST',
    'CACHE_MISS',
    'CACHE_EXPIRED',
    'SERVICE_UNAVAILABLE',
    'RATE_LIMIT_EXCEEDED',
  ].includes(error.code)) {
    message = `${message}. Please try again.`;
  }
  
  return message;
}
