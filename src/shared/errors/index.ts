/**
 * Shared Errors Module
 * 
 * Central export for error handling types and utilities.
 */

export { ErrorCode, getErrorMessage, isRecoverableError, isClientError, isServerError } from './error-codes.js';
export type { ErrorValue } from './result.js';
export {
  // Types
  type Result,
  type AsyncResult,
  type Ok,
  type Err,
  type Option,
  type Some,
  type None,
  
  // Constructors
  ok,
  okVoid,
  err,
  errFromCode,
  errFromException,
  createError,
  errorFromException,
  some,
  none,
  
  // Type guards
  isOk,
  isErr,
  isOkWith,
  isSome,
  isNone,
  
  // Utilities
  unwrap,
  unwrapOr,
  unwrapOrElse,
  unwrapError,
  map,
  mapErr,
  andThen,
  orElse,
  toOption,
  toNull,
  toUndefined,
  toUserMessage,
  withContext,
  withCause,
  
  // Async utilities
  tryAsync,
  trySync,
  
  // Exception wrapper
  ResultError,
} from './result.js';
