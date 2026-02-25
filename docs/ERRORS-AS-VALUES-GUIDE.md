# Errors as Values Pattern Guide

A comprehensive guide to implementing "errors as values" pattern in this Electron + Angular application.

## Table of Contents

- [Overview](#overview)
- [Why Errors as Values](#why-errors-as-values)
- [Core Concepts](#core-concepts)
- [Shared Error Types](#shared-error-types)
- [Backend Usage](#backend-usage)
- [Frontend Usage](#frontend-usage)
- [Error Codes](#error-codes)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Examples](#examples)

## Overview

The "errors as values" pattern treats errors as regular return values instead of exceptions. This approach provides:

- **Type Safety**: Errors are part of the function signature
- **Explicit Handling**: Callers must handle both success and error cases
- **No Hidden Control Flow**: No unexpected try-catch blocks needed
- **Better Composability**: Easy to chain operations with error handling
- **Predictable**: No stack unwinding, no hidden performance costs

## Why Errors as Values

### Traditional Exception Approach

```typescript
// Problem: Hidden error path
async function loadData(id: string): Promise<Data> {
  const data = await db.find(id); // Might throw
  return data;
}

// Caller might forget to handle errors
const data = await loadData('123'); // What if it fails?
```

### Errors as Values Approach

```typescript
// Clear error path in type signature
async function loadData(id: string): AsyncResult<Data> {
  const data = await db.find(id);
  if (!data) {
    return errFromCode(ErrorCode.ResourceNotFound, 'Data not found');
  }
  return ok(data);
}

// Caller must handle both cases
const result = await loadData('123');
if (isOk(result)) {
  useData(result.value);
} else {
  handleError(result.error);
}
```

## Core Concepts

### Result Type

The `Result<T, E>` type represents either success (`Ok<T>`) or failure (`Err<E>`):

```typescript
type Result<T, E = ErrorValue> = Ok<T> | Err<E>;

interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

interface Err<E> {
  readonly ok: false;
  readonly error: E;
}
```

### ErrorValue Type

All errors conform to the `ErrorValue` interface:

```typescript
interface ErrorValue {
  code: ErrorCode;           // Programmatic error code
  message: string;            // Human-readable message
  details?: string;           // Detailed information
  stack?: string;             // Stack trace (if from exception)
  field?: string;             // Field that caused error
  context?: Record<string, unknown>; // Additional context
  cause?: ErrorValue;         // Inner/cause error
  timestamp?: string;         // When error occurred
}
```

### Type Guards

Use type guards to narrow Result types:

```typescript
import { isOk, isErr } from '@shared/errors';

function handleResult(result: Result<Data>) {
  if (isOk(result)) {
    // TypeScript knows result is Ok<Data>
    console.log(result.value);
  } else if (isErr(result)) {
    // TypeScript knows result is Err<ErrorValue>
    console.error(result.error);
  }
}
```

## Shared Error Types

### Importing Error Utilities

```typescript
// Import everything from shared
import {
  // Types
  type Result,
  type AsyncResult,
  type ErrorValue,
  type ErrorCode,
  
  // Constructors
  ok,
  err,
  okVoid,
  errFromCode,
  errFromException,
  
  // Type guards
  isOk,
  isErr,
  
  // Utilities
  unwrap,
  unwrapOr,
  map,
  andThen,
} from '@shared/errors';
```

### Creating Results

```typescript
// Success with value
const success: Result<string> = ok('Hello');

// Success without value
const successVoid: Result<void> = okVoid();

// Error from code
const error: Result<never> = errFromCode(
  ErrorCode.ValidationFailed,
  'Invalid email format'
);

// Error from exception
try {
  riskyOperation();
} catch (error) {
  const result: Result<never> = errFromException(error);
}
```

### Transforming Results

```typescript
// Map value (only transforms Ok)
const uppercased = map(result, (value) => value.toUpperCase());

// Chain operations (flattens nested Results)
const chained = andThen(result, (value) => 
  fetchMoreData(value) // Returns Result<MoreData>
);

// Handle error transformation
const transformed = mapErr(result, (error) => ({
  ...error,
  message: `Wrapped: ${error.message}`,
}));
```

### Extracting Values

```typescript
// Unwrap or throw (use sparingly)
const value = unwrap(result); // Throws ResultError if Err

// Unwrap with default
const value = unwrapOr(result, 'default value');

// Unwrap with function
const value = unwrapOrElse(result, (error) => {
  logger.error(error);
  return 'default value';
});

// Convert to null
const valueOrNull = toNull(result);

// Convert to undefined
const valueOrUndefined = toUndefined(result);
```

## Backend Usage

### Using ErrorHandler

```typescript
import { ErrorHandler } from '@main/errors';
import { LoggerService } from '@main/services';

@Injectable({ scope: 'singleton' })
export class DataService {
  private errorHandler: ErrorHandler;

  constructor(logger: LoggerService) {
    this.errorHandler = new ErrorHandler(logger);
  }

  async getData(id: string): AsyncResult<Data> {
    return this.errorHandler.handle(
      this.db.findById(id),
      ErrorCode.ResourceNotFound,
      { id }
    );
  }

  syncOperation(): Result<Data> {
    return this.errorHandler.handleSync(
      () => this.parseData(rawData),
      ErrorCode.InvalidFormat
    );
  }
}
```

### IPC Handlers

```typescript
import { createIpcHandler } from '@main/errors';

// Type-safe IPC handler
const getDataHandler = createIpcHandler(
  async (request: { id: string }) => {
    const data = await service.getData(request.id);
    return data; // Returns AsyncResult<Data>
  },
  errorHandler,
  'data:get'
);

// Register handler
ipcMain.handle('data:get', async (event, request) => {
  const result = await getDataHandler(request);
  return result; // Always returns Result, never throws
});
```

### Wrapping Service Methods

```typescript
class UserService {
  private errorHandler: ErrorHandler;

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
  }

  // Wrap method with automatic error handling
  createUser = this.errorHandler.wrapService(
    async (data: CreateUserData) => {
      // Your implementation
      const user = await this.db.insert(data);
      return user;
    },
    ErrorCode.OperationFailed
  );
}
```

### Creating Custom Errors

```typescript
class UserService {
  private errorHandler: ErrorHandler;

  validateEmail(email: string): Result<void> {
    if (!isValidEmail(email)) {
      return err(this.errorHandler.validationError(
        'email',
        'Invalid email format',
        { value: email }
      ));
    }
    return okVoid();
  }

  async getUser(id: string): AsyncResult<User> {
    const user = await this.db.find(id);
    if (!user) {
      return err(this.errorHandler.notFoundError(
        'User',
        id
      ));
    }
    return ok(user);
  }
}
```

## Frontend Usage

### Using FrontendErrorService

```typescript
import { FrontendErrorService } from '@core/errors';
import { isOk } from '@shared/errors';

@Component({...})
export class DataComponent implements OnInit {
  data = signal<Data | null>(null);

  constructor(private errorService: FrontendErrorService) {}

  async ngOnInit() {
    const result = await this.errorService.handleAsync(
      this.api.loadData(),
      'Failed to load data'
    );

    if (result) {
      this.data.set(result);
    }
    // Error automatically reported and shown in UI
  }
}
```

### Handling Results

```typescript
@Component({...})
export class FormComponent {
  constructor(private errorService: FrontendErrorService) {}

  async submitForm(formData: FormData) {
    // Handle async operation
    const result = await this.errorService.handleAsync(
      this.api.submit(formData),
      'Submission failed'
    );

    if (result) {
      this.success();
    }
  }

  handleValidation() {
    // Handle Result directly
    const result = this.validateForm();
    const value = this.errorService.handleResult(result, {
      source: 'form',
      title: 'Validation Error'
    });

    if (value === null) {
      // Error was reported
      return;
    }

    // Use value
    this.process(value);
  }

  private validateForm(): Result<FormData> {
    if (!this.form.valid) {
      return errFromCode(ErrorCode.ValidationFailed, 'Form invalid');
    }
    return ok(this.form.value);
  }
}
```

### Reactive Error Handling

```typescript
@Component({...})
export class DashboardComponent {
  // Subscribe to error signals
  hasError = this.errorService.hasError;
  errorCount = this.errorService.errorCount;
  activeError = this.errorService.activeError;

  constructor(private errorService: FrontendErrorService) {}

  dismissError() {
    this.errorService.dismiss();
  }

  clearAllErrors() {
    this.errorService.clear();
  }
}
```

### Form Validation

```typescript
@Component({...})
export class UserFormComponent {
  constructor(private errorService: FrontendErrorService) {}

  validateEmail(email: string): boolean {
    if (!isValidEmail(email)) {
      this.errorService.validationError(
        'email',
        'Please enter a valid email address'
      );
      return false;
    }
    return true;
  }

  async checkEmailUnique(email: string): Promise<boolean> {
    const result = await this.errorService.handleAsync(
      this.api.checkEmail(email),
      'Failed to check email'
    );

    if (result === null) {
      return false;
    }

    if (!result.available) {
      this.errorService.validationError(
        'email',
        'This email is already registered'
      );
      return false;
    }

    return true;
  }
}
```

### Custom Error Transformation

```typescript
@Component({...})
export class ApiComponent {
  constructor(private errorService: FrontendErrorService) {}

  async loadData() {
    const result = await this.errorService.handleAsyncWith(
      this.api.loadData(),
      (error: ApiError) => ({
        code: this.mapApiErrorCode(error.code),
        message: error.message,
        details: error.details,
      })
    );

    if (result) {
      this.data.set(result);
    }
  }

  private mapApiErrorCode(code: string): ErrorCode {
    const mapping: Record<string, ErrorCode> = {
      'NOT_FOUND': ErrorCode.ResourceNotFound,
      'UNAUTHORIZED': ErrorCode.AuthenticationFailed,
      'INVALID_INPUT': ErrorCode.ValidationFailed,
    };
    return mapping[code] || ErrorCode.InternalError;
  }
}
```

## Error Codes

### Built-in Error Codes

The application includes comprehensive error codes organized by category:

```typescript
enum ErrorCode {
  // General (0-99)
  Unknown = 'UNKNOWN',
  InternalError = 'INTERNAL_ERROR',
  
  // Validation (100-199)
  ValidationFailed = 'VALIDATION_FAILED',
  InvalidInput = 'INVALID_INPUT',
  
  // Authentication (200-299)
  AuthenticationRequired = 'AUTHENTICATION_REQUIRED',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  
  // Resource (300-399)
  ResourceNotFound = 'RESOURCE_NOT_FOUND',
  UserNotFound = 'USER_NOT_FOUND',
  
  // Database (400-499)
  DatabaseError = 'DATABASE_ERROR',
  ConnectionFailed = 'CONNECTION_FAILED',
  
  // File System (500-599)
  FileSystemError = 'FILE_SYSTEM_ERROR',
  FileReadError = 'FILE_READ_ERROR',
  
  // Network (600-699)
  NetworkError = 'NETWORK_ERROR',
  Timeout = 'TIMEOUT',
  
  // IPC (700-799)
  IpcError = 'IPC_ERROR',
  IpcTimeout = 'IPC_TIMEOUT',
  
  // Window (800-899)
  WindowError = 'WINDOW_ERROR',
  WindowCreationFailed = 'WINDOW_CREATION_FAILED',
  
  // Configuration (900-999)
  ConfigurationError = 'CONFIGURATION_ERROR',
  ConfigNotFound = 'CONFIG_NOT_FOUND',
}
```

### Creating Custom Error Codes

Extend the `ErrorCode` enum in your application:

```typescript
// In your shared types
declare module '@shared/errors' {
  enum ErrorCode {
    // Add your custom codes
    CustomError = 'CUSTOM_ERROR',
    FeatureNotAvailable = 'FEATURE_NOT_AVAILABLE',
  }
}
```

## Best Practices

### 1. Always Return Results from Service Methods

```typescript
// Good
async getData(id: string): AsyncResult<Data> {
  // ...
}

// Avoid
async getData(id: string): Promise<Data> {
  // Might throw
}
```

### 2. Handle Results Explicitly

```typescript
// Good
const result = await service.getData();
if (isOk(result)) {
  useData(result.value);
} else {
  handleError(result.error);
}

// Avoid - ignoring error case
const result = await service.getData();
useData(result.value); // Error if result is Err!
```

### 3. Use Appropriate Error Codes

```typescript
// Good - specific
return errFromCode(ErrorCode.ResourceNotFound, 'User not found');

// Avoid - too generic
return errFromCode(ErrorCode.Unknown, 'Something went wrong');
```

### 4. Add Context to Errors

```typescript
// Good
return errFromCode(
  ErrorCode.ValidationFailed,
  'Invalid email',
  { field: 'email', value: email }
);

// Avoid - no context
return errFromCode(ErrorCode.ValidationFailed, 'Invalid email');
```

### 5. Chain Operations with andThen

```typescript
// Good - clean chaining
const result = await getUser(id)
  .andThen(user => validatePermissions(user))
  .andThen(permissions => loadData(permissions));

// Avoid - nested conditionals
const user = await getUser(id);
if (isOk(user)) {
  const permissions = await validatePermissions(user.value);
  if (isOk(permissions)) {
    // ...
  }
}
```

### 6. Convert Exceptions at Boundaries

```typescript
// At API boundary
async function apiCall(): AsyncResult<Data> {
  return tryAsync(async () => {
    return await fetch('/api/data');
  });
}

// At service boundary
class Service {
  private errorHandler: ErrorHandler;
  
  operation() {
    return this.errorHandler.handleSync(
      () => riskyOperation(),
      ErrorCode.OperationFailed
    );
  }
}
```

### 7. Use FrontendErrorService in Components

```typescript
// Good
constructor(private errorService: FrontendErrorService) {}

async loadData() {
  const data = await this.errorService.handleAsync(
    this.api.load(),
    'Failed to load'
  );
  // Error automatically shown in UI
}

// Avoid - manual error handling
async loadData() {
  try {
    const data = await this.api.load();
  } catch (error) {
    this.showError(error); // Manual UI update
  }
}
```

## Migration Guide

### Step 1: Add Error Types

Start by importing error types in new code:

```typescript
import { Result, AsyncResult, ok, err } from '@shared/errors';
```

### Step 2: Update Service Signatures

Change return types to use Result:

```typescript
// Before
async getUser(id: string): Promise<User>;

// After
async getUser(id: string): AsyncResult<User>;
```

### Step 3: Return Results

Update function bodies:

```typescript
// Before
async getUser(id: string): Promise<User> {
  const user = await db.find(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

// After
async getUser(id: string): AsyncResult<User> {
  const user = await db.find(id);
  if (!user) {
    return errFromCode(ErrorCode.ResourceNotFound, 'User not found');
  }
  return ok(user);
}
```

### Step 4: Handle Results

Update callers to handle Results:

```typescript
// Before
try {
  const user = await getUser(id);
  useUser(user);
} catch (error) {
  handleError(error);
}

// After
const result = await getUser(id);
if (isOk(result)) {
  useUser(result.value);
} else {
  handleError(result.error);
}
```

### Step 5: Use Error Services

Integrate with error handling services:

```typescript
// Backend
const result = await errorHandler.handle(
  getUser(id),
  ErrorCode.UserNotFound
);

// Frontend
const user = await errorService.handleAsync(
  getUser(id),
  'Failed to load user'
);
```

## Examples

### Complete Backend Service

```typescript
import { Injectable } from '@main/di';
import { ErrorHandler } from '@main/errors';
import { ErrorCode, ok, errFromCode } from '@shared/errors';
import { LoggerService } from '@main/services';

@Injectable({ scope: 'singleton' })
export class UserService {
  private errorHandler: ErrorHandler;

  constructor(logger: LoggerService) {
    this.errorHandler = new ErrorHandler(logger);
  }

  async createUser(data: CreateUserData): AsyncResult<User> {
    // Validate
    const validation = this.validateUser(data);
    if (validation.ok === false) {
      return validation;
    }

    // Check existing
    const existing = await this.findByEmail(data.email);
    if (isOk(existing) && existing.value) {
      return errFromCode(
        ErrorCode.DuplicateEntry,
        'Email already registered',
        { field: 'email' }
      );
    }

    // Create user
    return this.errorHandler.handle(
      this.db.insert(data),
      ErrorCode.DatabaseError,
      { operation: 'createUser' }
    );
  }

  async getUser(id: string): AsyncResult<User> {
    const result = await this.db.findById(id);
    
    if (!result) {
      return errFromCode(
        ErrorCode.UserNotFound,
        `User with ID ${id} not found`
      );
    }

    return ok(result);
  }

  private validateUser(data: CreateUserData): Result<void> {
    if (!data.email) {
      return err(this.errorHandler.validationError(
        'email',
        'Email is required'
      ));
    }

    if (!isValidEmail(data.email)) {
      return err(this.errorHandler.validationError(
        'email',
        'Invalid email format'
      ));
    }

    if (!data.password || data.password.length < 8) {
      return err(this.errorHandler.validationError(
        'password',
        'Password must be at least 8 characters'
      ));
    }

    return okVoid();
  }
}
```

### Complete Frontend Component

```typescript
import { Component, signal } from '@angular/core';
import { FrontendErrorService } from '@core/errors';
import { isOk } from '@shared/errors';

@Component({
  selector: 'app-user-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="email" name="email" placeholder="Email" />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" />
      
      @if (errorService.hasError()) {
        <div class="error">
          {{ errorService.activeError()?.userMessage }}
        </div>
      }
      
      <button type="submit">Create User</button>
    </form>
  `
})
export class UserFormComponent {
  email = signal('');
  password = signal('');

  constructor(public errorService: FrontendErrorService) {}

  async onSubmit() {
    // Validate locally first
    if (!this.validateLocal()) {
      return;
    }

    // Submit to API
    const result = await this.errorService.handleAsync(
      this.api.createUser({
        email: this.email(),
        password: this.password(),
      }),
      'Failed to create user'
    );

    if (result) {
      this.success();
    }
    // Error automatically shown in UI
  }

  private validateLocal(): boolean {
    if (!this.email().includes('@')) {
      this.errorService.validationError(
        'email',
        'Please enter a valid email'
      );
      return false;
    }

    if (this.password().length < 8) {
      this.errorService.validationError(
        'password',
        'Password must be at least 8 characters'
      );
      return false;
    }

    return true;
  }

  private success() {
    this.email.set('');
    this.password.set('');
    this.errorService.dismiss();
  }
}
```

---

For more information, see:
- `src/shared/errors/` - Shared error types and utilities
- `src/main/errors/` - Backend error handling
- `frontend/src/core/errors/` - Frontend error handling
