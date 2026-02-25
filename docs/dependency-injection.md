# Dependency Injection

Dependency injection system for backend and frontend.

## Overview

The application uses dependency injection in both main process and frontend for better testability and modularity.

## Backend DI

### Container API

```typescript
import { container, Injectable } from '@main/di';

// Register service
@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
}

// Resolve service
const logger = container.resolve(LoggerService);
```

### Service Registration

```typescript
// Register class
container.registerClass(LoggerService, LoggerService);

// Register factory
container.register('config', () => ({ env: 'dev' }));

// Register value
container.registerValue('API_URL', 'https://api.example.com');
```

### Service Decorator

```typescript
@Injectable({ 
  scope: 'singleton',
  providedIn: 'root'
})
export class MyService {
  constructor(private logger: LoggerService) {}
}
```

## Frontend DI

### Angular DI

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  private logger = inject(LoggerService);
}
```

### Service Providers

```typescript
@NgModule({
  providers: [
    { provide: LoggerService, useClass: LoggerService },
    { provide: APP_CONFIG, useValue: config },
  ]
})
export class AppModule {}
```

## Service Facades

### Backend Facade

```typescript
import { appFacade } from '@main/app';

appFacade.logger.info('app', 'message');
appFacade.windows.create({...});
```

### Frontend Facade

```typescript
import { WindowFacade } from '@core/window';

constructor(private windowFacade: WindowFacade) {}

openWindow() {
  this.windowFacade.openCard(card);
}
```

## Best Practices

1. Use constructor injection
2. Mark services with @Injectable
3. Use facades for complex operations
4. Keep services single-purpose
5. Register in service registry

## Related Documentation

- Architecture - System design
- Event Bus - Event system
