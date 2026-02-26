# Errors as Values

Comprehensive guide to type-safe error handling using Result types instead of exceptions.

## Overview

Instead of throwing exceptions, this project uses Result types that explicitly represent success or failure. This pattern makes error handling explicit, type-safe, and easier to reason about.

## Core Concepts

### The Problem with Exceptions

Traditional exception handling has several issues:

1. **Implicit**: Functions may throw without indication
2. **Unsafe**: Try-catch blocks can be forgotten
3. **Unpredictable**: Control flow is hard to follow
4. **Hard to Test**: Exceptions break test flow

### The Result Pattern

Result types make errors explicit:

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

### Benefits

1. **Explicit**: Function signature shows it can fail
2. **Type-Safe**: TypeScript enforces handling
3. **Composable**: Results can be chained
4. **Testable**: Errors are values to assert

## Core Types

### Result Type

```typescript
import { Result, Ok, Err } from '@shared/errors';

// Success case
const success: Result<string> = {
  ok: true,
  value: 'Success!'
};

// Error case
const failure: Result<string> = {
  ok: false,
  error: {
    code: ErrorCode.ResourceNotFound,
    message: 'Resource not found'
  }
};
```

### ErrorValue

```typescript
interface ErrorValue {
  code: ErrorCode;
  message: string;
  details?: string;
  context?: Record<string, unknown>;
  field?: string;
  timestamp?: string;
}
```

### AsyncResult

For asynchronous operations:

```typescript
type AsyncResult<T, E = ErrorValue> = Promise<Result<T, E>>;
```

## Creating Results

### Import Utilities

```typescript
import { ok, err, errFromCode, tryAsync } from '@shared/errors';
```

### Success (Ok)

```typescript
// Simple success
return ok(data);

// With type annotation
return ok<Data>(data);
```

### Error (Err)

```typescript
// From error code
return errFromCode(ErrorCode.ResourceNotFound, 'Not found');

// With details
return errFromCode(
  ErrorCode.ValidationFailed,
  'Invalid input',
  { field: 'email', value: 'invalid' }
);

// From error value
return err({
  code: ErrorCode.InternalError,
  message: 'Something went wrong',
  details: error.message
});

// From exception
return errFromException(error, ErrorCode.InternalError);
```

## Handling Results

### Import Type Guards

```typescript
import { isOk, isErr, unwrap, unwrapOr } from '@shared/errors';
```

### Check Result Status

```typescript
const result = await service.getData();

if (isOk(result)) {
  // TypeScript knows result.value exists
  console.log('Data:', result.value);
} else {
  // TypeScript knows result.error exists
  console.error('Error:', result.error);
}
```

### Alternative: isErr

```typescript
if (isErr(result)) {
  handleError(result.error);
  return;
}

// TypeScript knows result is Ok here
useData(result.value);
```

### Unwrap with Default

```typescript
// Use default value on error
const data = unwrapOr(result, defaultValue);
```

### Unwrap with Function

```typescript
// Use function to provide default
const data = unwrapOrElse(result, (error) => {
  logger.error(error);
  return defaultValue;
});
```

### Convert to Null

```typescript
// Convert to T | null
const dataOrNull = toNull(result);
if (dataOrNull !== null) {
  useData(dataOrNull);
}
```

### Convert to Undefined

```typescript
// Convert to T | undefined
const dataOrUndefined = toUndefined(result);
```

### Force Unwrap

```typescript
// Force unwrap (throws if error)
// Use sparingly, only when sure
const data = unwrap(result);
```

## Transforming Results

### Import Transformation Functions

```typescript
import { map, mapErr, andThen, orElse } from '@shared/errors';
```

### Map Value

Transform the success value:

```typescript
const uppercased = map(result, (value) => value.toUpperCase());
// Result<string> -> Result<string>
```

### Map Error

Transform the error value:

```typescript
const mapped = mapErr(result, (error) => ({
  ...error,
  message: `Prefix: ${error.message}`
}));
```

### Chain Operations (andThen)

Chain operations that return Results:

```typescript
const data = await getUser(id)
  .andThen(user => validatePermissions(user))
  .andThen(permissions => loadData(permissions));
```

Each step only executes if previous step succeeded.

### Recover from Error (orElse)

Provide fallback on error:

```typescript
const result = fetchData()
  .orElse(error => {
    logger.error(error);
    return ok(cachedData);
  });
```

### Combine Results

Combine multiple results:

```typescript
const combined = combineResults([
  getUser(id),
  getPermissions(id),
  getSettings(id)
]);

// All must succeed for combined success
```

## Backend Usage

### Service with Error Handling

```typescript
import { Injectable } from '@main/di';
import { ErrorHandler, ErrorCode } from '@main/errors';

@Injectable({ scope: 'singleton' })
export class DataService {
  constructor(
    private errorHandler: ErrorHandler,
    private db: Database
  ) {}

  async getData(id: string): AsyncResult<Data> {
    return this.errorHandler.handle(
      async () => {
        const data = await this.db.findById(id);
        if (!data) {
          throw new Error('Not found');
        }
        return data;
      },
      ErrorCode.ResourceNotFound,
      { id }
    );
  }

  async createData(data: CreateDataDto): AsyncResult<Data> {
    return this.errorHandler.handle(
      async () => {
        // Validate
        if (!this.isValid(data)) {
          throw new Error('Invalid data');
        }
        
        // Create
        return await this.db.create(data);
      },
      ErrorCode.CreateFailed,
      { data }
    );
  }
}
```

### Use Case Pattern

```typescript
import { BaseMainUseCase } from '@main/use-cases';

@Injectable({ scope: 'singleton' })
export class GetUserUseCase extends BaseMainUseCase {
  async execute(id: string): AsyncResult<User> {
    return this.errorHandler.handle(
      async () => {
        // Validate ID
        if (!id) {
          throw new Error('Invalid ID');
        }
        
        // Get user
        const user = await this.userService.findById(id);
        if (!user) {
          throw new Error('User not found');
        }
        
        return user;
      },
      ErrorCode.ResourceNotFound,
      { id }
    );
  }
}
```

### Controller/Handler

```typescript
ipcMain.handle(IPC_CHANNELS.DATA.GET, async (event, id: string) => {
  const result = await dataService.getData(id);
  
  if (isOk(result)) {
    return { success: true, data: result.value };
  } else {
    return { 
      success: false, 
      error: result.error 
    };
  }
});
```

## Frontend Usage

### Service with Error Handling

```typescript
import { Injectable } from '@angular/core';
import { FrontendErrorService } from '@core/errors';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(
    private http: HttpClient,
    private errorService: FrontendErrorService
  ) {}

  async getData(id: string): AsyncResult<Data> {
    return tryAsync(async () => {
      return await this.http.get<Data>(`/api/data/${id}`).toPromise();
    });
  }
}
```

### Component Error Handling

```typescript
@Component({...})
export class DataComponent implements OnInit {
  data = signal<Data | null>(null);
  error = signal<string | null>(null);

  constructor(
    private service: DataService,
    private errorService: FrontendErrorService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const result = await this.errorService.handleAsync(
      this.service.getData('123'),
      'Failed to load data'
    );
    
    if (isOk(result)) {
      this.data.set(result.value);
    }
    // Error automatically shown in UI
  }
}
```

### ViewModel Pattern

```typescript
export class DataViewModel {
  data = signal<Data | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private service: DataService,
    private errorService: FrontendErrorService
  ) {}

  async loadData(id: string) {
    this.loading.set(true);
    this.error.set(null);

    const result = await this.errorService.handleAsync(
      this.service.getData(id),
      'Failed to load'
    );

    if (isOk(result)) {
      this.data.set(result.value);
    }
    
    this.loading.set(false);
  }
}
```

## Error Codes

Predefined error codes organized by category:

### General Errors (0-99)

```typescript
ErrorCode.Ok = 0
ErrorCode.InternalError = 1
ErrorCode.NotImplemented = 2
ErrorCode.Unsupported = 3
```

### Validation Errors (100-199)

```typescript
ErrorCode.ValidationFailed = 100
ErrorCode.InvalidInput = 101
ErrorCode.MissingRequired = 102
ErrorCode.InvalidFormat = 103
```

### Authentication Errors (200-299)

```typescript
ErrorCode.AuthenticationRequired = 200
ErrorCode.AuthenticationFailed = 201
ErrorCode.TokenExpired = 202
ErrorCode.PermissionDenied = 203
```

### Resource Errors (300-399)

```typescript
ErrorCode.ResourceNotFound = 300
ErrorCode.ResourceExists = 301
ErrorCode.ResourceLocked = 302
```

### Database Errors (400-499)

```typescript
ErrorCode.DatabaseError = 400
ErrorCode.QueryFailed = 401
ErrorCode.ConnectionFailed = 402
```

### File System Errors (500-599)

```typescript
ErrorCode.FileNotFound = 500
ErrorCode.PermissionDenied = 501
ErrorCode.DiskFull = 502
```

### Network Errors (600-699)

```typescript
ErrorCode.NetworkError = 600
ErrorCode.Timeout = 601
ErrorCode.ConnectionRefused = 602
```

### IPC Errors (700-799)

```typescript
ErrorCode.IPCError = 700
ErrorCode.ChannelNotFound = 701
ErrorCode.InvalidPayload = 702
```

### Window Errors (800-899)

```typescript
ErrorCode.WindowError = 800
ErrorCode.WindowCreateFailed = 801
ErrorCode.WindowCloseFailed = 802
```

### Configuration Errors (900-999)

```typescript
ErrorCode.ConfigurationError = 900
ErrorCode.MissingConfig = 901
ErrorCode.InvalidConfig = 902
```

## Best Practices

### General Guidelines

1. **Return Result from Service Methods**
   - Make error handling explicit
   - Force callers to handle errors
   - Document failure modes

2. **Handle Results Explicitly**
   - Check isOk/isErr
   - Don't ignore errors
   - Provide meaningful error messages

3. **Use Specific Error Codes**
   - Choose appropriate code
   - Add context for debugging
   - Document error codes

4. **Add Context to Errors**
   - Include relevant data
   - Add field information
   - Provide timestamps

5. **Chain with andThen**
   - Use for sequential operations
   - Stop on first error
   - Keep code flat

6. **Convert Exceptions at Boundaries**
   - Catch exceptions at edges
   - Convert to Result
   - Handle internally

### Backend Specific

1. **Use Error Handler Service**
   ```typescript
   return this.errorHandler.handle(
     async () => { /* operation */ },
     ErrorCode.OperationFailed
   );
   ```

2. **Add Context Information**
   ```typescript
   return this.errorHandler.handle(
     operation,
     ErrorCode.ResourceNotFound,
     { id, type: 'user' }
   );
   ```

3. **Log Errors**
   ```typescript
   if (isErr(result)) {
     this.logger.error('Operation failed', result.error);
   }
   ```

### Frontend Specific

1. **Use Error Service**
   ```typescript
   const result = await this.errorService.handleAsync(
     this.api.getData(),
     'Failed to load'
   );
   ```

2. **Show User-Friendly Messages**
   ```typescript
   if (isErr(result)) {
     this.toast.error('Failed to load data. Please try again.');
   }
   ```

3. **Track Error State**
   ```typescript
   error = signal<string | null>(null);
   ```

## Testing

### Test Success Case

```typescript
it('should return data on success', async () => {
  const result = await service.getData('123');
  
  expect(isOk(result)).toBe(true);
  expect(result.value).toEqual(expectedData);
});
```

### Test Error Case

```typescript
it('should return error on not found', async () => {
  const result = await service.getData('invalid');
  
  expect(isErr(result)).toBe(true);
  expect(result.error.code).toBe(ErrorCode.ResourceNotFound);
});
```

### Test Error Context

```typescript
it('should include context in error', async () => {
  const result = await service.getData('123');
  
  if (isErr(result)) {
    expect(result.error.context).toEqual({ id: '123' });
  }
});
```

## Troubleshooting

### Result Not Unwrapped

**Problem:** Accessing value without checking.

**Solution:**
```typescript
// Wrong
const data = result.value;

// Correct
if (isOk(result)) {
  const data = result.value;
}
```

### Error Ignored

**Problem:** Not handling error case.

**Solution:**
```typescript
// Wrong
await service.getData();

// Correct
const result = await service.getData();
if (isErr(result)) {
  handleError(result.error);
}
```

### Exception Thrown

**Problem:** Exception breaks flow.

**Solution:**
```typescript
// Wrong
const data = await db.findById(id);

// Correct
return tryAsync(async () => {
  return await db.findById(id);
});
```

## Related Documentation

- [Architecture](architecture.md) - System design
- [Testing](testing.md) - Testing guide
- [IPC Communication](ipc-communication.md) - IPC patterns
