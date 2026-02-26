# API Reference

Complete API reference for Electron Angular Rspack Starter.

## Main Process API

### App Facade

Simplified API for main process functionality.

**Location:** `src/main/app/app.facade.ts`

```typescript
import { appFacade } from '@main/app';

// Logging
appFacade.logger.info('namespace', 'message', data);
appFacade.logger.error('namespace', 'message', error);
appFacade.logger.warn('namespace', 'message', data);
appFacade.logger.debug('namespace', 'message', data);

// Window Management
appFacade.windows.create(options);
appFacade.windows.close(id);
appFacade.windows.focus(id);
appFacade.windows.minimize(id);
appFacade.windows.maximize(id);

// Events
appFacade.events.broadcast('channel', payload);
appFacade.events.alert('channel', payload);
```

### Dependency Injection Container

DI container for service registration and resolution.

**Location:** `src/main/di/container.ts`

```typescript
import { Injectable, container } from '@main/di';

// Register service with decorator
@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
}

// Resolve service
const logger = container.resolve(LoggerService);

// Register class
container.registerClass(Token, Class);

// Register factory
container.register('token', () => ({ value: 'test' }));

// Register value
container.registerValue('token', 'value');
```

### Event Bus

Cross-process event communication.

**Location:** `src/main/events/event-bus.ts`

```typescript
import { events } from '@main/events';

// Subscribe
events.on('channel', (payload) => {
  console.log('Event received:', payload);
});

// Subscribe once
events.once('channel', (payload) => {
  console.log('Event received once:', payload);
});

// Publish (local)
events.emit('channel', payload);

// Broadcast (cross-process)
events.broadcast('channel', payload);

// Alert (high priority)
events.alert('channel', payload);

// Unsubscribe
const unsubscribe = events.on('channel', handler);
unsubscribe();
```

### Error Handler

Error handling with Result types.

**Location:** `src/main/errors/error-handler.ts`

```typescript
import { ErrorHandler, ErrorCode } from '@main/errors';

@Injectable({ scope: 'singleton' })
export class MyService {
  constructor(private errorHandler: ErrorHandler) {}

  async operation(): AsyncResult<Data> {
    return this.errorHandler.handle(
      async () => {
        // Operation that might throw
        return await this.doSomething();
      },
      ErrorCode.OperationFailed,
      { context: 'data' }
    );
  }
}
```

### Logger Service

Structured logging service.

**Location:** `src/main/services/logger.service.ts`

```typescript
import { LoggerService } from '@main/services';

const logger = new LoggerService();

logger.info('namespace', 'message', { data: 'value' });
logger.error('namespace', 'message', error);
logger.warn('namespace', 'message', { data: 'value' });
logger.debug('namespace', 'message', { data: 'value' });

// Get logs
const logs = logger.getLogs();

// Clear logs
logger.clear();

// Set log level
logger.setLevel('debug');
```

### Window Service

Window management service.

**Location:** `src/main/services/window.service.ts`

```typescript
import { WindowService } from '@main/services';

const windowService = new WindowService();

// Create window
const result = await windowService.create({
  title: 'My Window',
  width: 800,
  height: 600,
});

// Close window
await windowService.close('window-id');

// Focus window
await windowService.focus('window-id');

// Minimize window
await windowService.minimize('window-id');

// Maximize window
await windowService.maximize('window-id');
```

## Frontend API

### Event Bus Facade

Frontend event bus facade.

**Location:** `frontend/src/core/events/event-bus.facade.ts`

```typescript
import { EventBusFacade } from '@core/events';

@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private events: EventBusFacade) {}

  publishEvent() {
    // Publish local event
    this.events.emit('channel', payload);
    
    // Broadcast to main process
    this.events.broadcast('channel', payload);
    
    // Send to main process
    this.events.sendToMain('channel', payload);
  }

  subscribeToEvents() {
    // Subscribe
    this.events.on('channel', (payload) => {
      console.log('Event:', payload);
    });
    
    // Get signal for event count
    const count = this.events.getSignal('channel');
    
    // Get latest payload signal
    const latest = this.events.getLatest('channel');
    
    // Custom selector
    const selected = this.events.select('channel', (p) => p.value);
  }
}
```

### Error Service

Frontend error handling service.

**Location:** `frontend/src/core/errors/error.service.ts`

```typescript
import { FrontendErrorService } from '@core/errors';

@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private errorService: FrontendErrorService) {}

  async loadData() {
    // Handle async error with user message
    const result = await this.errorService.handleAsync(
      this.api.getData(),
      'Failed to load data'
    );
    
    // Handle sync error
    const value = this.errorService.handle(
      riskyOperation(),
      'Operation failed'
    );
  }
}
```

### Window Facade

Window management facade for frontend.

**Location:** `frontend/src/core/window/window.facade.ts`

```typescript
import { WindowFacade } from '@core/window';

@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private windowFacade: WindowFacade) {}

  manageWindows() {
    // Open card in window
    this.windowFacade.openCard(card, index);
    
    // Close window
    this.windowFacade.close('window-id');
    
    // Focus window
    this.windowFacade.focus('window-id');
  }
}
```

### Logger ViewModel

Frontend logging with signals.

**Location:** `frontend/src/viewmodels/logger.viewmodel.ts`

```typescript
import { getLogger, backend } from '@viewmodels/logger.viewmodel';

// Configure logging
configureLogging({
  level: 'debug',
  enabled: true,
});

// Enable backend sink
backend.enableBackendSink();

// Get logger
const logger = getLogger('my-component');

logger.info('Message', { data: 'value' });
logger.error('Error', error);

// Get log history
const history = getLogHistory();

// Clear logs
clearLogHistory();
```

## Shared Types

### Result Types

Type-safe error handling types.

**Location:** `src/shared/errors/result.ts`

```typescript
import { Result, Ok, Err, AsyncResult } from '@shared/errors';

// Result type
type Result<T, E = ErrorValue> = Ok<T> | Err<E>;

// Async result
type AsyncResult<T, E = ErrorValue> = Promise<Result<T, E>>;

// Create success
const success = ok(data);

// Create error
const error = errFromCode(ErrorCode.ResourceNotFound, 'Not found');

// Check result
if (isOk(result)) {
  console.log(result.value);
}

if (isErr(result)) {
  console.error(result.error);
}

// Transform
const mapped = map(result, (v) => v.toUpperCase());
const chained = await result.andThen(v => nextOperation(v));

// Extract
const value = unwrapOr(result, 'default');
const nullValue = toNull(result);
```

### Error Codes

Predefined error codes.

**Location:** `src/shared/errors/error-codes.ts`

```typescript
import { ErrorCode } from '@shared/errors';

// General errors
ErrorCode.Ok = 0
ErrorCode.InternalError = 1
ErrorCode.NotImplemented = 2

// Validation errors
ErrorCode.ValidationFailed = 100
ErrorCode.InvalidInput = 101
ErrorCode.MissingRequired = 102

// Authentication errors
ErrorCode.AuthenticationRequired = 200
ErrorCode.AuthenticationFailed = 201
ErrorCode.PermissionDenied = 203

// Resource errors
ErrorCode.ResourceNotFound = 300
ErrorCode.ResourceExists = 301

// Database errors
ErrorCode.DatabaseError = 400
ErrorCode.QueryFailed = 401

// Network errors
ErrorCode.NetworkError = 600
ErrorCode.Timeout = 601

// IPC errors
ErrorCode.IPCError = 700
ErrorCode.ChannelNotFound = 701

// Window errors
ErrorCode.WindowError = 800
ErrorCode.WindowCreateFailed = 801
```

### IPC Channels

IPC channel definitions.

**Location:** `src/shared/ipc/channels.ts`

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

// Log channels
IPC_CHANNELS.LOG.WRITE
IPC_CHANNELS.LOG.GET_LEVEL
IPC_CHANNELS.LOG.CLEAR

// Window channels
IPC_CHANNELS.WINDOW.CREATE
IPC_CHANNELS.WINDOW.CLOSE
IPC_CHANNELS.WINDOW.FOCUS
IPC_CHANNELS.WINDOW.MINIMIZE
IPC_CHANNELS.WINDOW.MAXIMIZE

// App channels
IPC_CHANNELS.APP.INFO
IPC_CHANNELS.APP.QUIT
IPC_CHANNELS.APP.RESTART

// Event channels
IPC_CHANNELS.EVENT.PUBLISH
IPC_CHANNELS.EVENT.SUBSCRIBE

// Data channels
IPC_CHANNELS.DATA.GET
IPC_CHANNELS.DATA.SET
IPC_CHANNELS.DATA.DELETE
```

### Event Types

Event type definitions.

**Location:** `src/shared/events/types.ts`

```typescript
import { EventTypes } from '@shared/events';

// App events
EventTypes.APP_READY = 'app:ready'
EventTypes.APP_SHUTDOWN = 'app:shutdown'
EventTypes.APP_MINIMIZE = 'app:minimize'
EventTypes.APP_MAXIMIZE = 'app:maximize'

// Window events
EventTypes.WINDOW_CREATED = 'window:created'
EventTypes.WINDOW_CLOSED = 'window:closed'
EventTypes.WINDOW_FOCUSED = 'window:focused'
EventTypes.WINDOW_BOUNDS_CHANGED = 'window:bounds-changed'

// Log events
EventTypes.LOG_ENTRY = 'log:entry'
EventTypes.LOG_LEVEL_CHANGE = 'log:level-change'

// Error events
EventTypes.ERROR_OCCURRED = 'error:occurred'
EventTypes.ERROR_RECOVERED = 'error:recovered'
```

## Utility Functions

### Logger Utility

Structured logging utility.

**Location:** `src/shared/lib/utils/logger.ts`

```typescript
import { logger } from '@shared/lib/logger';

logger.info('Message', { metadata });
logger.error('Error message', error);
logger.warn('Warning', { data });
logger.debug('Debug info', { details });
```

### Async Utilities

Helper functions for asynchronous operations.

**Location:** `src/shared/lib/utils/async.ts`

```typescript
import { delay, retry, tryAsync } from '@shared/lib/utils';

// Delay execution
await delay(1000); // Wait 1 second

// Retry operation
const result = await retry(
  async () => await fetch('/api/data'),
  { maxAttempts: 3, baseDelay: 1000 }
);

// Try async with Result
const result = await tryAsync(async () => {
  return await riskyOperation();
});
```

### Type Guards

Runtime type checking utilities.

**Location:** `src/shared/lib/utils/type-guards.ts`

```typescript
import { isString, isObject, isNumber, isArray } from '@shared/lib/utils';

if (isString(value)) {
  // value is definitely a string
  console.log(value.toUpperCase());
}

if (isObject(value)) {
  // value is definitely an object
  console.log(value.key);
}

if (isNumber(value)) {
  // value is definitely a number
  console.log(value.toFixed(2));
}

if (isArray(value)) {
  // value is definitely an array
  console.log(value.length);
}
```

### Platform Utilities

Platform detection and utilities.

**Location:** `src/shared/lib/utils/platform.ts`

```typescript
import { isWindows, isMac, isLinux, getPlatform } from '@shared/lib/utils';

if (isWindows()) {
  // Windows-specific code
}

if (isMac()) {
  // macOS-specific code
}

if (isLinux()) {
  // Linux-specific code
}

const platform = getPlatform();
```

## Advanced Utilities

### Reactive Store

Reactive state management.

**Location:** `src/shared/lib/utils/store.ts`

```typescript
import { ReactiveStore } from '@shared/lib/utils';

const store = new ReactiveStore({
  count: 0,
  user: null
}, {
  name: 'app-store',
  persist: true,
  throttleMs: 100
});

// Subscribe to changes
const unsubscribe = store.subscribe((state) => {
  console.log('State changed:', state);
});

// Update state
store.setState({ count: 1 });

// Get state
const currentState = store.getState();
```

### Advanced Cache

Caching with TTL and size limits.

**Location:** `src/shared/lib/utils/cache.ts`

```typescript
import { AdvancedCache } from '@shared/lib/utils';

const cache = new AdvancedCache({
  maxSize: 100,
  maxAge: 300000 // 5 minutes
});

// Set value
await cache.set('key', 'value', { maxAge: 60000 });

// Get value
const value = await cache.get('key');

// Get or set
const result = await cache.getOrSet('key', async () => {
  return await expensiveOperation();
});

// Delete value
await cache.delete('key');

// Clear cache
await cache.clear();
```

### Rate Limiter

Rate limiting for operations.

**Location:** `src/shared/lib/utils/rate-limiter.ts`

```typescript
import { RateLimiter } from '@shared/lib/utils';

const limiter = new RateLimiter(10, 1000); // 10 calls per second

if (limiter.isAllowed()) {
  // Make API call
  await apiCall();
} else {
  // Wait for available slot
  await limiter.waitForAvailable();
  await apiCall();
}
```

### Memoization

Function memoization.

**Location:** `src/shared/lib/utils/memoize.ts`

```typescript
import { memoize } from '@shared/lib/utils';

const expensiveFunction = (a: number, b: number) => {
  // Expensive computation
  return a + b;
};

const memoizedFunction = memoize(expensiveFunction);

// First call - computes
memoizedFunction(1, 2);

// Second call - returns cached result
memoizedFunction(1, 2);
```

## Error Handling

### Custom Errors

Application-specific error types.

```typescript
import { FileNotFoundError, PermissionError } from '@shared/errors';

throw new FileNotFoundError(filePath);
throw new PermissionDeniedError(operation);
```

### Error Boundary

Component-level error handling.

```typescript
import { ErrorBoundary } from '@shared/lib/utils';

const boundary = new ErrorBoundary({
  handleError: (error, context) => {
    console.error('Caught error in', context, ':', error);
  },
  getFallback: (error) => {
    return { error: true, message: error.message };
  }
});

try {
  const result = await boundary.execute(async () => {
    return await riskyOperation();
  }, 'risky-operation');
} catch (error) {
  // Handle error
}
```

## Related Documentation

- [Architecture](architecture.md) - System design
- [Dependency Injection](dependency-injection.md) - DI system
- [Event Bus](event-bus.md) - Event communication
- [Errors as Values](errors-as-values.md) - Error handling pattern
- [IPC Communication](ipc-communication.md) - IPC patterns
