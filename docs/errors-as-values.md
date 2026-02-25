# Errors as Values

Error handling pattern using Result types instead of exceptions.

## Overview

Instead of throwing exceptions, functions return Result types that explicitly represent success or failure.

## Core Types

### Result Type

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

## Usage

### Creating Results

```typescript
import { ok, err, errFromCode } from '@shared/errors';

// Success
return ok(data);

// Error
return errFromCode(ErrorCode.ResourceNotFound, 'Not found');
```

### Handling Results

```typescript
import { isOk, isErr } from '@shared/errors';

const result = await service.getData();

if (isOk(result)) {
  useData(result.value);
} else {
  handleError(result.error);
}
```

### Transforming Results

```typescript
// Map value
const uppercased = map(result, (v) => v.toUpperCase());

// Chain operations
const data = await getUser(id)
  .andThen(user => validatePermissions(user))
  .andThen(permissions => loadData(permissions));
```

### Extracting Values

```typescript
// With default
const value = unwrapOr(result, 'default');

// With function
const value = unwrapOrElse(result, (error) => {
  logger.error(error);
  return 'default';
});

// To null
const valueOrNull = toNull(result);
```

## Backend Usage

```typescript
import { ErrorHandler } from '@main/errors';

@Injectable({ scope: 'singleton' })
export class DataService {
  constructor(private errorHandler: ErrorHandler) {}

  async getData(id: string): AsyncResult<Data> {
    return this.errorHandler.handle(
      this.db.findById(id),
      ErrorCode.ResourceNotFound,
      { id }
    );
  }
}
```

## Frontend Usage

```typescript
import { FrontendErrorService } from '@core/errors';

@Component({...})
export class DataComponent {
  constructor(private errorService: FrontendErrorService) {}

  async loadData() {
    const data = await this.errorService.handleAsync(
      this.api.getData(),
      'Failed to load'
    );
    // Error automatically shown in UI
  }
}
```

## Error Codes

Predefined error codes organized by category:

- General (0-99)
- Validation (100-199)
- Authentication (200-299)
- Resource (300-399)
- Database (400-499)
- File System (500-599)
- Network (600-699)
- IPC (700-799)
- Window (800-899)
- Configuration (900-999)

## Best Practices

1. Return Result from service methods
2. Handle results explicitly
3. Use specific error codes
4. Add context to errors
5. Chain with andThen
6. Convert exceptions at boundaries

## Related Documentation

- Architecture - System design
- Testing - Testing error handling
