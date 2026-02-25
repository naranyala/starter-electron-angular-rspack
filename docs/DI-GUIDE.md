# Dependency Injection Guide

This document describes the Dependency Injection (DI) architecture implemented in this Electron + Angular application.

## Table of Contents

- [Overview](#overview)
- [Backend (Electron Main Process) DI](#backend-electron-main-process-di)
  - [Container API](#container-api)
  - [Service Registration](#service-registration)
  - [Service Decorators](#service-decorators)
  - [Dependency Injection](#dependency-injection)
  - [Service Registry](#service-registry)
  - [Scoped Services](#scoped-services)
- [Frontend (Angular) DI](#frontend-angular-di)
  - [Core Module](#core-module)
  - [Service Providers](#service-providers)
  - [Custom Services](#custom-services)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

The application uses a dual DI system:

1. **Backend (Electron Main)**: Custom DI container with support for singleton, transient, and scoped lifetimes
2. **Frontend (Angular)**: Angular's built-in DI system with enhanced abstractions

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Electron)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  Container  │  │   Registry   │  │   AppBootstrap  │    │
│  │             │  │              │  │                 │    │
│  │ - register  │  │ - discover   │  │ - initialize    │    │
│  │ - resolve   │  │ - bootstrap  │  │ - configure     │    │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘    │
│         │                │                    │              │
│         └────────────────┼────────────────────┘              │
│                          │                                   │
│              ┌───────────▼───────────┐                      │
│              │      Services         │                      │
│              │  - LoggerService      │                      │
│              │  - WindowService      │                      │
│              │  - IpcHandlerService  │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Angular)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  Providers  │  │   Services   │  │  ViewModel      │    │
│  │             │  │              │  │                 │    │
│  │ - provide   │  │ - Logger     │  │ - EventBus      │    │
│  │ - inject    │  │ - Error      │  │ - State         │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Backend (Electron Main Process) DI

### Container API

The DI container is located at `src/main/di/container.ts`.

```typescript
import { container, Container } from './di/index.js';
```

#### Basic Operations

```typescript
// Register a factory
container.register('logger', () => new LoggerService());

// Register a value
container.registerValue('API_URL', 'https://api.example.com');

// Register a class (auto-resolves dependencies)
container.registerClass(LoggerService, LoggerService);

// Resolve a dependency
const logger = container.resolve(LoggerService);

// Check if registered
container.has(LoggerService);

// Create child container
const child = container.createChild();

// Dispose container
container.dispose();
```

### Service Registration

#### 1. Factory Registration

```typescript
container.register(
  LoggerService,
  () => new LoggerService({ level: LogLevel.DEBUG }),
  'singleton'
);
```

#### 2. Class Registration

```typescript
// Auto-detects constructor dependencies
container.registerClass(WindowService, WindowService);

// With explicit dependencies
container.registerClass(IpcHandlerService, IpcHandlerService, {
  deps: [LoggerService, WindowService],
  scope: 'singleton',
});
```

#### 3. Value Registration

```typescript
const CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
container.registerValue(CONFIG, {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
});
```

### Service Decorators

Use the `@Injectable` decorator to mark services for DI:

```typescript
import { Injectable } from './di/index.js';

@Injectable({ 
  scope: 'singleton',
  providedIn: 'root'
})
export class LoggerService {
  constructor() {}
}
```

#### Decorator Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `scope` | `'singleton' \| 'transient'` | `'singleton'` | Service lifetime |
| `providedIn` | `'root' \| 'platform'` | `'root'` | Where service is provided |
| `deps` | `Token[]` | auto-detected | Explicit dependencies |

### Dependency Injection

#### Constructor Injection

Dependencies are automatically resolved based on constructor parameter types:

```typescript
@Injectable({ scope: 'singleton' })
export class IpcHandlerService {
  constructor(
    private logger: LoggerService,      // Auto-injected
    private windowService: WindowService // Auto-injected
  ) {}
}
```

#### @Inject Decorator

For interface-based injection or custom tokens:

```typescript
const API_URL = new InjectionToken<string>('API_URL');

@Injectable({ scope: 'singleton' })
export class ApiService {
  constructor(
    @Inject(API_URL) private apiUrl: string,
    private logger: LoggerService
  ) {}
}
```

### Service Registry

The service registry provides automatic service discovery and initialization:

```typescript
import { ServiceRegistry, serviceRegistry } from './di/index.js';

const registry = new ServiceRegistry();

// Register services
registry.register({
  name: 'logger',
  token: LoggerService,
  useClass: LoggerService,
  scope: 'singleton',
  order: 1,
  autoInit: true,
  tags: ['core', 'logging'],
});

// Bootstrap all autoInit services
await registry.bootstrap(container);

// Get service status
console.log(registry.getStatus());
```

### Scoped Services

Create scoped contexts for request/response or feature-specific lifetimes:

```typescript
// WithScope pattern
const result = container.withScope('request-123', scope => {
  const handler = scope.resolve(RequestHandler);
  return handler.process();
});

// Scoped services are created once per scope
@Injectable({ scope: 'scoped' })
export class RequestContext {
  constructor() {
    this.id = generateId();
  }
}
```

## Frontend (Angular) DI

### Core Module

The frontend DI module is located at `frontend/src/core/di/`.

#### App Configuration

```typescript
import { APP_CONFIG, provideCore } from './core/di/index.js';

// In app.module.ts or bootstrapApplication
providers: [
  ...provideCore({
    production: false,
    logging: {
      level: 'debug',
      enableConsole: true,
      enableBackend: true,
    },
  }),
]
```

### Service Providers

Create providers using the helper functions:

```typescript
import { createProvider, type ServiceConfig } from './core/di/index.js';

const loggerProvider: ServiceConfig<LoggerService> = {
  provide: LoggerService,
  useFactory: (config) => new LoggerService(config),
  deps: [APP_CONFIG],
};

// Or use the shorthand
const providers = [
  {
    provide: LoggerService,
    useClass: LoggerService,
  },
];
```

### Custom Services

```typescript
import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from './core/di/index.js';

@Injectable({ providedIn: 'root' })
export class DataService {
  private config = inject(APP_CONFIG);
  private logger = inject(LoggerService);

  getData() {
    this.logger.info('data', 'Fetching data');
    // ...
  }
}
```

## Examples

### Creating a New Backend Service

```typescript
// src/main/services/config.service.ts
import { container, Injectable } from '../di/index.js';
import { LoggerService } from './logger.service.js';

@Injectable({ scope: 'singleton', providedIn: 'root' })
export class ConfigService {
  private config = new Map<string, unknown>();

  constructor(private logger: LoggerService) {}

  onInit(): void {
    this.logger.info('config', 'Config service initialized');
  }

  get<T>(key: string): T | undefined {
    return this.config.get(key) as T;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
    this.logger.debug('config', `Config set: ${key}`);
  }
}

export const configService = container.resolve(ConfigService);
```

### Registering in AppBootstrap

```typescript
// src/main/lib/app-bootstrap.ts
const SERVICE_DEFINITIONS: ServiceMeta[] = [
  {
    name: 'config',
    token: ConfigService,
    useClass: ConfigService,
    scope: 'singleton',
    deps: [LoggerService],
    order: 4,
    autoInit: true,
    tags: ['core', 'config'],
  },
];
```

### Using the Service

```typescript
// Anywhere in your main process
import { container } from './di/index.js';
import { ConfigService } from './services/config.service.js';

const config = container.resolve(ConfigService);
config.set('theme', 'dark');
const theme = config.get<string>('theme');
```

### Creating a Frontend Service

```typescript
// frontend/src/services/data.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { LoggerService } from '../core/di/index.js';

@Injectable({ providedIn: 'root' })
export class DataService {
  private logger = inject(LoggerService);
  
  private data = signal<any[]>([]);
  readonly items = this.data.asReadonly();

  async load() {
    this.logger.info('data', 'Loading items');
    try {
      const response = await fetch('/api/items');
      this.data.set(await response.json());
    } catch (error) {
      this.logger.error('data', 'Failed to load', {}, error);
    }
  }
}
```

## Best Practices

### 1. Use Constructor Injection

Always prefer constructor injection over service locator pattern:

```typescript
// ✅ Good
@Injectable({ scope: 'singleton' })
export class UserService {
  constructor(private logger: LoggerService) {}
}

// ❌ Avoid
export class UserService {
  getUser(id: string) {
    const logger = container.resolve(LoggerService);
    // ...
  }
}
```

### 2. Define Clear Service Boundaries

Each service should have a single responsibility:

```typescript
// ✅ Good: Separate concerns
@Injectable({ scope: 'singleton' })
export class LoggerService { /* logging logic */ }

@Injectable({ scope: 'singleton' })
export class WindowService { /* window management */ }

@Injectable({ scope: 'singleton' })
export class IpcHandlerService { /* IPC handling */ }
```

### 3. Use Injection Tokens for Configuration

```typescript
// ✅ Good
const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

@Injectable({ scope: 'singleton' })
export class ApiService {
  constructor(@Inject(API_CONFIG) private config: ApiConfig) {}
}
```

### 4. Leverage Service Registry for Bootstrapping

```typescript
// ✅ Good: Centralized service registration
const SERVICE_DEFINITIONS: ServiceMeta[] = [
  { name: 'logger', token: LoggerService, autoInit: true, order: 1 },
  { name: 'window', token: WindowService, autoInit: true, order: 2 },
];
```

### 5. Use Scoped Services for Request/Response

```typescript
// ✅ Good: Scoped context
container.withScope('request-123', scope => {
  const handler = scope.resolve(RequestHandler);
  return handler.process();
});
```

### 6. Implement Lifecycle Hooks

```typescript
@Injectable({ scope: 'singleton' })
export class DatabaseService {
  async onInit(): Promise<void> {
    await this.connect();
  }
  
  async onDestroy(): Promise<void> {
    await this.disconnect();
  }
}
```

### 7. Keep Services Testable

```typescript
// ✅ Good: Easy to mock
@Injectable({ scope: 'singleton' })
export class EmailService {
  constructor(
    @Inject(SMTP_CONFIG) private config: SmtpConfig,
    private logger: LoggerService
  ) {}
}

// In tests
container.registerValue(SMTP_CONFIG, testConfig);
container.register(MockLoggerService, LoggerService);
```

## File Structure

```
src/main/
├── di/
│   ├── container.ts      # DI container implementation
│   ├── tokens.ts         # Injection tokens and decorators
│   ├── registry.ts       # Service registry
│   └── index.ts          # DI module exports
├── services/
│   ├── logger.service.ts
│   ├── window.service.ts
│   └── ipc-handler.service.ts
├── lib/
│   └── app-bootstrap.ts  # Application bootstrap
└── index.ts              # Main entry point

frontend/src/
├── core/
│   └── di/
│       ├── di.module.ts  # Angular DI module
│       ├── services.ts   # Service providers
│       └── index.ts      # Frontend DI exports
└── views/
    └── app.module.ts     # Angular app module
```

## Migration Guide

### From Manual Service Creation to DI

**Before:**
```typescript
const logger = new LoggerService();
const window = new WindowService(logger);
const ipc = new IpcHandlerService(logger, window);
```

**After:**
```typescript
const logger = container.resolve(LoggerService);
const window = container.resolve(WindowService);
const ipc = container.resolve(IpcHandlerService);
```

### From Global Instances to DI

**Before:**
```typescript
import { loggerService } from './services/logger.service.js';
loggerService.info('app', 'Hello');
```

**After:**
```typescript
import { container } from './di/index.js';
import { LoggerService } from './services/logger.service.js';
const logger = container.resolve(LoggerService);
logger.info('app', 'Hello');
```

Note: Global instances are still exported for backward compatibility.
