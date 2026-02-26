# Dependency Injection

Comprehensive guide to the dependency injection system used in both backend and frontend.

## Overview

The application uses dependency injection (DI) in both the Electron main process and Angular frontend for better modularity, testability, and maintainability.

## Backend DI System

The main process uses a custom DI container with service registration and resolution.

### Container API

Import the container and decorators:

```typescript
import { Injectable, container } from '@main/di';
```

### Service Registration

**Register with Decorator:**

```typescript
import { Injectable } from '@main/di';

@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
  
  info(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data);
  }
}
```

**Register Class:**

```typescript
container.registerClass(LoggerService, LoggerService);
```

**Register Factory:**

```typescript
container.register('config', () => ({
  env: 'development',
  apiUrl: 'http://localhost:3000'
}));
```

**Register Value:**

```typescript
container.registerValue('API_URL', 'https://api.example.com');
```

### Service Resolution

**Resolve Service:**

```typescript
const logger = container.resolve(LoggerService);
logger.info('Application started');
```

**Resolve by Token:**

```typescript
const config = container.resolve('config');
```

### Service Scopes

**Singleton Scope:**

Service is created once and reused:

```typescript
@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
}
```

**Transient Scope:**

Service is created on each resolution:

```typescript
@Injectable({ scope: 'transient' })
export class UseCaseService {
  constructor() {}
}
```

### Service Dependencies

Services can depend on other services:

```typescript
@Injectable({ scope: 'singleton' })
export class WindowService {
  constructor(
    private logger: LoggerService,
    private config: AppConfig
  ) {}
  
  create(options: WindowOptions) {
    this.logger.info('Creating window', options);
    // Implementation
  }
}
```

### Service Registry

Automatic service registration:

```typescript
import { serviceRegistry } from '@main/di';

// Register service
serviceRegistry.register('logger', LoggerService);

// Get service
const logger = serviceRegistry.get('logger');
```

## Frontend DI System

The Angular frontend uses Angular's built-in dependency injection.

### Service Registration

**Root Provider:**

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logger = inject(LoggerService);
  
  info(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data);
  }
}
```

**Module Provider:**

```typescript
import { NgModule } from '@angular/core';
import { LoggerService } from './logger.service';

@NgModule({
  providers: [
    LoggerService,
    { provide: 'API_URL', useValue: 'https://api.example.com' }
  ]
})
export class CoreModule {}
```

### Service Injection

**Constructor Injection:**

```typescript
@Component({...})
export class MyComponent {
  constructor(
    private logger: LoggerService,
    private service: DataService
  ) {}
}
```

**Inject Function:**

```typescript
import { inject } from '@angular/core';

export class MyViewModel {
  private logger = inject(LoggerService);
  private service = inject(DataService);
}
```

### Provider Types

**Class Provider:**

```typescript
{
  provide: LoggerService,
  useClass: LoggerService
}
```

**Value Provider:**

```typescript
{
  provide: 'API_URL',
  useValue: 'https://api.example.com'
}
```

**Factory Provider:**

```typescript
{
  provide: 'config',
  useFactory: () => ({
    env: 'development',
    apiUrl: 'http://localhost:3000'
  })
}
```

**Existing Provider:**

```typescript
{
  provide: 'logger',
  useExisting: LoggerService
}
```

## Service Facades

Facades simplify complex operations by providing a unified API.

### Backend Facade

App facade provides simplified access to main process services:

```typescript
import { appFacade } from '@main/app';

// Logging
appFacade.logger.info('app', 'message');
appFacade.logger.error('app', 'error', error);

// Window management
appFacade.windows.create({ title: 'Window' });
appFacade.windows.close('window-id');

// Events
appFacade.events.broadcast('event:name', payload);
appFacade.events.alert('error:occurred', errorData);
```

### Frontend Facades

**Window Facade:**

```typescript
import { WindowFacade } from '@core/window';

@Injectable({ providedIn: 'root' })
export class WindowFacade {
  constructor(private windowManager: WindowManager) {}
  
  openCard(card: Card, index: number) {
    this.windowManager.open(card, index);
  }
  
  close(id: string) {
    this.windowManager.close(id);
  }
}

// Usage
constructor(private windowFacade: WindowFacade) {}

this.windowFacade.openCard(card, 0);
```

**Event Bus Facade:**

```typescript
import { EventBusFacade } from '@core/events';

@Injectable({ providedIn: 'root' })
export class EventBusFacade {
  constructor(private eventBus: EventBus) {}
  
  publish<T>(channel: string, payload: T) {
    this.eventBus.publish(channel, payload);
  }
  
  on<T>(channel: string, handler: (payload: T) => void) {
    this.eventBus.on(channel, handler);
  }
}

// Usage
constructor(private events: EventBusFacade) {}

this.events.publish('navigation:start', { from: 'home' });
this.events.on('window:created', (payload) => {
  console.log('Window created:', payload);
});
```

## Best Practices

### General Guidelines

1. **Use Constructor Injection**
   - Always inject dependencies via constructor
   - Makes dependencies explicit
   - Easier to test

2. **Mark Services with Injectable**
   - Use `@Injectable` decorator
   - Specify appropriate scope
   - Document service purpose

3. **Use Facades for Complex Operations**
   - Simplify API access
   - Hide implementation details
   - Provide consistent interface

4. **Keep Services Single-Purpose**
   - Each service should have one responsibility
   - Follow single responsibility principle
   - Easy to test and maintain

5. **Register in Service Registry**
   - Use service registry for discovery
   - Enable automatic registration
   - Support plugin architecture

### Backend Specific

1. **Use App Facade**
   - Simplify main process API
   - Consistent access pattern
   - Type-safe operations

2. **Register Services Early**
   - Register during bootstrap
   - Ensure availability
   - Avoid circular dependencies

3. **Use Appropriate Scopes**
   - Singleton for shared services
   - Transient for use cases
   - Document scope choice

### Frontend Specific

1. **Use providedIn: 'root'**
   - Tree-shakable services
   - Lazy-loaded when not used
   - Single instance app-wide

2. **Inject in ViewModel**
   - Use inject() in ViewModels
   - Keep components clean
   - Better testability

3. **Lazy Load Feature Modules**
   - Use Angular lazy loading
   - Reduce initial bundle
   - Better performance

## Testing with DI

### Mock Services

**Backend:**

```typescript
import { container } from '@main/di';

// Register mock
container.registerValue('logger', {
  info: () => {},
  error: () => {}
});

// Resolve mock
const logger = container.resolve('logger');
```

**Frontend:**

```typescript
import { TestBed } from '@angular/core/testing';

TestBed.configureTestingModule({
  providers: [
    { provide: LoggerService, useValue: { info: () => {} } }
  ]
});
```

### Test Injectable Services

```typescript
import { describe, it, expect } from 'bun:test';
import { container } from '@main/di';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('should be injectable', () => {
    const logger = container.resolve(LoggerService);
    expect(logger).toBeDefined();
  });
  
  it('should log messages', () => {
    const logger = container.resolve(LoggerService);
    expect(() => logger.info('test')).not.toThrow();
  });
});
```

## Common Patterns

### Service with Dependencies

```typescript
@Injectable({ scope: 'singleton' })
export class DataService {
  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private config: AppConfig
  ) {}
  
  async getData(): AsyncResult<Data> {
    this.logger.info('Fetching data');
    return tryAsync(async () => {
      return await this.http.get(this.config.apiUrl + '/data');
    });
  }
}
```

### Factory Pattern with DI

```typescript
@Injectable({ scope: 'singleton' })
export class UseCaseFactory {
  constructor(
    private container: DIContainer,
    private errorHandler: ErrorHandler
  ) {}
  
  create<T extends UseCase>(type: UseCaseType): T {
    return this.container.resolve(type);
  }
}
```

### Plugin Registration

```typescript
@Injectable({ scope: 'singleton' })
export class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  
  register(name: string, plugin: Plugin) {
    this.plugins.set(name, plugin);
  }
  
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }
}
```

## Troubleshooting

### Circular Dependencies

**Problem:** Services depend on each other circularly.

**Solution:**
1. Extract shared logic to third service
2. Use lazy injection
3. Refactor to break cycle

### Service Not Found

**Problem:** Container cannot resolve service.

**Solution:**
1. Ensure service is registered
2. Check registration order
3. Verify token matches

### Multiple Instances

**Problem:** Service created multiple times.

**Solution:**
1. Use singleton scope
2. Check module imports
3. Verify providedIn setting

## Related Documentation

- [Architecture](architecture.md) - System design
- [Event Bus](event-bus.md) - Event system
- [Testing](testing.md) - Testing guide
