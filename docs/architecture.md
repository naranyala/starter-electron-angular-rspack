# Architecture

This document describes the system architecture of the Electron Angular Rspack Starter application.

## System Overview

The application follows a multi-process architecture with clear separation of concerns between the Electron main process, renderer process, and Angular frontend.

```
+---------------------------------------------------------------------+
|                    Electron Main Process (Node.js)                   |
|  +-------------+  +--------------+  +---------------------+         |
|  | App Facade  |  |   Services   |  |   DI Container      |         |
|  |             |  |              |  |                     |         |
|  | - Lifecycle |  | - Logger     |  | - Register          |         |
|  | - Windows   |  | - Window     |  | - Resolve           |         |
|  | - IPC       |  | - IPC        |  | - Scoped            |         |
|  +-------------+  +--------------+  +---------------------+         |
+---------------------------------------------------------------------+
                                |
                        IPC Bridge (contextBridge)
                                |
+---------------------------------------------------------------------+
|                  Angular Frontend (Renderer)                         |
|  +-------------+  +--------------+  +---------------------+         |
|  | Components  |  |   Services   |  |   ViewModels        |         |
|  |             |  |              |  |                     |         |
|  | - Home      |  | - Window     |  | - Event Bus         |         |
|  | - Demo      |  | - Search     |  | - Logger            |         |
|  | - DevTools  |  | - Error      |  | - State             |         |
|  +-------------+  +--------------+  +---------------------+         |
+---------------------------------------------------------------------+
```

## Process Architecture

### Main Process

The Electron main process runs in Node.js and handles:

- Application lifecycle management
- Native OS integration
- Window management
- File system operations
- IPC communication
- Privileged operations

### Renderer Process

The renderer process provides:

- Secure UI rendering
- Context isolation bridge
- WinBox window management
- Lightweight UI components

### Frontend (Angular)

The Angular application serves as:

- Main user interface
- Reactive state management
- Feature modules
- Component hierarchy

## Main Process Architecture

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| App Facade | Simplified API for main process | src/main/app/ |
| Services | Core injectable services | src/main/services/ |
| DI Container | Dependency injection | src/main/di/ |
| Event Bus | Cross-process communication | src/main/events/ |
| Use Cases | Business logic | src/main/use-cases/ |
| Error Handler | Error handling | src/main/errors/ |

### Directory Structure

```
src/main/
├── app/                  # Application orchestration
│   ├── app.config.ts     # Configuration definitions
│   ├── app.facade.ts     # Main process facade
│   ├── app.lifecycle.ts  # Lifecycle handlers
│   └── index.ts          # Module exports
├── di/                   # Dependency injection
│   ├── container.ts      # DI container
│   ├── tokens.ts         # Injection tokens
│   ├── registry.ts       # Service registry
│   └── index.ts
├── events/               # Event bus
│   ├── event-bus.ts      # Core event bus
│   ├── event-bus.facade.ts # Simplified facade
│   └── index.ts
├── errors/               # Error handling
│   ├── error-handler.ts  # Error handler
│   └── index.ts
├── services/             # Core services
│   ├── logger.service.ts
│   ├── window.service.ts
│   ├── ipc-handler.service.ts
│   └── index.ts
├── lib/                  # Utilities
│   ├── lifecycle/        # Lifecycle management
│   ├── window/           # Window utilities
│   ├── app-bootstrap.ts
│   ├── app-manager.ts
│   ├── config.ts
│   ├── filesystem.ts
│   ├── ipc.ts
│   ├── logger.ts
│   └── utils.ts
├── use-cases/            # Business logic
│   ├── base-main-usecase.ts
│   ├── create-window.usecase.ts
│   ├── quit-app.usecase.ts
│   ├── show-message.usecase.ts
│   └── index.ts
└── index.ts              # Main entry point
```

## Frontend Architecture

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Core Services | Singleton services | frontend/src/core/ |
| Feature Modules | Lazy-loaded modules | frontend/src/features/ |
| ViewModels | State management | frontend/src/viewmodels/ |
| Views | Angular components | frontend/src/views/ |
| Models | Data models | frontend/src/models/ |

### Directory Structure

```
frontend/src/
├── core/                 # Singleton services
│   ├── di/               # DI module
│   ├── events/           # Event bus
│   ├── errors/           # Error handling
│   ├── window/           # Window management
│   ├── plugins/          # Plugin system
│   ├── error-interceptor.ts
│   ├── global-error.handler.ts
│   └── index.ts
├── features/             # Feature modules
│   └── search/           # Search feature
├── models/               # Data models
│   ├── card.model.ts
│   ├── log.model.ts
│   └── index.ts
├── viewmodels/           # State management
│   ├── api-client.viewmodel.ts
│   ├── error-dashboard.viewmodel.ts
│   ├── event-bus.viewmodel.ts
│   ├── logger.viewmodel.ts
│   └── index.ts
├── views/                # Components
│   ├── demo/             # Demo views
│   ├── devtools/         # DevTools views
│   ├── home/             # Home views
│   ├── shared/           # Shared components
│   ├── app.component.ts  # Root component
│   └── app.module.ts     # Root module
└── main.ts               # Bootstrap
```

## Shared Code Architecture

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Errors | Error codes and types | src/shared/errors/ |
| Events | Event definitions | src/shared/events/ |
| IPC | Channel definitions | src/shared/ipc/ |
| Utilities | Shared utilities | src/shared/lib/ |
| Types | Type definitions | src/shared/types/ |

### Directory Structure

```
src/shared/
├── errors/               # Error handling
│   ├── error-codes.ts    # Error codes enum
│   ├── result.ts         # Result types
│   └── index.ts
├── events/               # Shared events
│   ├── types.ts          # Event type definitions
│   └── index.ts
├── ipc/                  # IPC definitions
│   ├── channels.ts       # Channel definitions
│   ├── types.ts          # IPC type contracts
│   └── index.ts
├── lib/                  # Shared utilities
│   ├── config/           # Config utilities
│   ├── data/             # Data utilities
│   ├── platform/         # Platform utilities
│   ├── types/            # Shared types
│   └── utils/            # Utility functions
└── types/                # Type definitions
```

## Design Patterns

### Dependency Injection

Both backend and frontend use dependency injection for modularity and testability.

**Backend DI:**

```typescript
import { Injectable, container } from '@main/di';

@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
}

// Resolve service
const logger = container.resolve(LoggerService);
```

**Frontend DI:**

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logger = inject(LoggerService);
}
```

### Facade Pattern

Facades simplify complex operations by providing a unified API.

**Backend Facade:**

```typescript
import { appFacade } from '@main/app';

appFacade.logger.info('app', 'message');
appFacade.windows.create({ title: 'Window' });
appFacade.events.broadcast('event:name', payload);
```

**Frontend Facade:**

```typescript
import { WindowFacade } from '@core/window';
import { EventBusFacade } from '@core/events';

constructor(
  private windowFacade: WindowFacade,
  private events: EventBusFacade
) {}

openWindow() {
  this.windowFacade.openCard(card);
  this.events.publish('window:opened', { id: card.id });
}
```

### Event Bus

Cross-process event communication using publish/subscribe pattern.

**Publish Events:**

```typescript
// Backend
events.emit('window:created', payload);
events.broadcast('navigation:complete', { from: 'home', to: 'settings' });
events.alert('error:occurred', errorData);

// Frontend
this.events.emit('navigation:start', { from: 'home', to: 'settings' });
this.events.sendToMain('window:create', options);
```

**Subscribe Events:**

```typescript
// Backend
events.on('window:created', (payload) => {
  console.log('Window created:', payload.title);
});

// Frontend
this.events.on('window:created', (payload) => {
  console.log('Window created:', payload.title);
});
```

**Reactive Signals:**

```typescript
// Get event count signal
windowCount = this.events.getSignal('window:created');

// Get latest payload signal
lastWindow = this.events.getLatest('window:created');

// Custom selector
windowTitle = this.events.select(
  'window:created',
  (payload) => payload.title
);
```

### Errors as Values

Type-safe error handling using Result types instead of exceptions.

**Core Types:**

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

**Usage:**

```typescript
import { ok, errFromCode, isOk, isErr } from '@shared/errors';

async function getData(id: string): AsyncResult<Data> {
  if (!id) {
    return errFromCode(ErrorCode.ResourceNotFound, 'Invalid ID');
  }
  return ok(data);
}

// Handle result
const result = await getData('123');
if (isOk(result)) {
  useData(result.value);
} else {
  handleError(result.error);
}
```

### Use Case Pattern

Business logic organized into use cases for clarity and testability.

```typescript
import { BaseMainUseCase } from '@main/use-cases';

@Injectable({ scope: 'singleton' })
export class CreateWindowUseCase extends BaseMainUseCase {
  async execute(options: CreateWindowOptions): AsyncResult<void> {
    return this.errorHandler.handle(async () => {
      const window = await this.windowService.create(options);
      this.events.broadcast('window:created', { id: window.id });
    }, ErrorCode.WindowCreateFailed);
  }
}
```

## Security Architecture

### Context Isolation

Renderer process runs in an isolated context:

```typescript
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
  }
});
```

### Secure IPC

Type-safe IPC with centralized channel definitions:

```typescript
// Channel definitions
export const IPC_CHANNELS = {
  LOG: {
    WRITE: 'log:write',
    GET_LEVEL: 'log:get-level',
  },
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
  },
};

// Handler registration
ipcMain.handle(IPC_CHANNELS.LOG.WRITE, async (event, entry) => {
  // Validate input
  if (!isValid(entry)) {
    throw new Error('Invalid entry');
  }
  logger.write(entry);
  return { success: true };
});
```

### Preload Script

Secure context bridge setup:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, data?: unknown) => {
    const validChannels = ['log:write', 'window:create'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel: string, func: (...args: unknown[]) => void) => {
    const validChannels = ['window:created', 'log:entry'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
```

## Data Flow

### Main to Frontend

```
Main Process Service
    |
    v
Event Bus (emit)
    |
    v
IPC Bridge
    |
    v
Frontend Event Bus
    |
    v
Component (subscribe)
```

### Frontend to Main

```
Component
    |
    v
Frontend Event Bus (sendToMain)
    |
    v
IPC Bridge
    |
    v
Main Event Bus
    |
    v
Main Process Service
```

## Configuration Flow

```
config/
  |
  v
App Config (src/main/app/app.config.ts)
  |
  v
Services (via DI)
  |
  v
Components (via facades)
```

## Build Architecture

```
Source Files
    |
    v
+------------------+     +------------------+
|   Rspack         |     |   Angular CLI    |
|   (Main Process) |     |   (Frontend)     |
+------------------+     +------------------+
    |                         |
    v                         v
main.cjs              frontend/dist/browser/
    |                         |
    +------------+------------+
                 |
                 v
        Electron Builder
                 |
                 v
        Distribution Packages
```

### Build Tools

| Tool | Purpose |
|------|---------|
| Rspack | Main process bundling |
| Angular CLI | Frontend compilation |
| Electron Builder | Application packaging |

## Scalability Considerations

### Horizontal Scaling

- Feature modules can be added independently
- Services are loosely coupled
- Event bus enables decoupled communication
- Use cases organize business logic

### Vertical Scaling

- DI container manages service complexity
- Facade pattern hides implementation details
- Service registry enables automatic discovery
- Shared utilities reduce duplication

## Performance Considerations

- Lazy loading for feature modules
- Tree-shaking for unused code
- Efficient change detection with signals
- Optimized bundle sizes with Rspack
- Code splitting for better loading
- Incremental compilation

## Testing Architecture

```
+------------------+
|   Unit Tests     |  (Individual components)
+------------------+
        |
        v
+------------------+
|  Security Tests  |  (Security validation)
+------------------+
        |
        v
+------------------+
|    E2E Tests     |  (Full application flow)
+------------------+
```

### Test Layers

| Layer | Purpose | Tools |
|-------|---------|-------|
| Unit | Individual components | Bun:test |
| Security | Security validation | Custom scripts |
| E2E | Full application flow | Playwright |

## Related Documentation

- [Project Structure](project-structure.md) - File and directory organization
- [Dependency Injection](dependency-injection.md) - DI system details
- [Event Bus System](event-bus.md) - Event communication
- [Security Overview](security.md) - Security features
