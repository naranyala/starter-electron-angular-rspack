# Architecture

This document describes the architecture of the Electron Angular Rspack Starter application.

## System Architecture

The application follows a three-layer architecture with clear separation of concerns:

```
+---------------------------------------------------------------------+
|                    Electron Main Process                             |
|  +-------------+  +--------------+  +---------------------+         |
|  | App Facade  |  |   Services   |  |   DI Container      |         |
|  |             |  |              |  |                     |         |
|  | - Lifecycle |  | - Logger     |  | - Register          |         |
|  | - Windows   |  | - Window     |  | - Resolve           |         |
|  | - IPC       |  | - IPC        |  | - Scoped            |         |
|  +-------------+  +--------------+  +---------------------+         |
+---------------------------------------------------------------------+
                                |
                        IPC Bridge
                                |
+---------------------------------------------------------------------+
|                  Angular Frontend                                    |
|  +-------------+  +--------------+  +---------------------+         |
|  | Components  |  |   Services   |  |   ViewModels        |         |
|  |             |  |              |  |                     |         |
|  | - Home      |  | - Window     |  | - Event Bus         |         |
|  | - Demo      |  | - Search     |  | - Logger            |         |
|  | - DevTools  |  | - Error      |  | - State             |         |
|  +-------------+  +--------------+  +---------------------+         |
+---------------------------------------------------------------------+
```

## Main Process

The Electron main process runs in Node.js and handles:

- Application lifecycle management
- Native OS integration
- Window management
- File system operations
- IPC communication
- Privileged operations

### Main Process Components

| Component | Purpose |
|-----------|---------|
| App Facade | Simplified API for main process functionality |
| Services | Core injectable services (Logger, Window, IPC) |
| DI Container | Dependency injection for service management |
| Event Bus | Cross-process event communication |
| Use Cases | Business logic implementation |

## Renderer Process

The renderer process provides a secure bridge between main process and frontend:

- Context isolation for security
- Type-safe IPC API exposure
- Lightweight UI components
- WinBox window management

## Frontend (Angular)

The Angular application serves as the main UI layer:

- Modern Angular with signals
- Standalone components
- Lazy-loaded feature modules
- Service-based architecture
- Facade pattern for complex operations

### Frontend Components

| Component | Purpose |
|-----------|---------|
| Core Services | Singleton services (DI, events, errors, window) |
| Feature Modules | Lazy-loaded functional modules |
| ViewModels | State management with signals |
| Views | Angular components and routes |

## Design Patterns

### Dependency Injection

Both backend and frontend use dependency injection:

**Backend:**
```typescript
@Injectable({ scope: 'singleton' })
export class LoggerService {
  constructor() {}
}

const logger = container.resolve(LoggerService);
```

**Frontend:**
```typescript
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logger = inject(LoggerService);
}
```

### Facade Pattern

Facades simplify complex operations:

**Backend Facade:**
```typescript
import { appFacade } from './app';
appFacade.logger.info('app', 'message');
appFacade.windows.create({...});
```

**Frontend Facade:**
```typescript
import { WindowFacade } from '@core/window';
constructor(private windowFacade: WindowFacade) {}
```

### Event Bus

Cross-process event communication:

```typescript
// Publish
events.broadcast('window:created', payload);

// Subscribe
events.on('window:created', (payload) => {
  console.log('Window created:', payload);
});
```

### Errors as Values

Type-safe error handling without exceptions:

```typescript
async function getData(): AsyncResult<Data> {
  if (!data) {
    return errFromCode(ErrorCode.ResourceNotFound);
  }
  return ok(data);
}
```

## Security Architecture

### Context Isolation

- Renderer process runs in isolated context
- No direct Node.js access from renderer
- Secure IPC via contextBridge

### Sandbox Mode

- Renderer process sandboxed
- Limited renderer capabilities
- Enhanced security boundaries

### IPC Security

- Type-safe channel definitions
- Input validation in handlers
- Centralized channel management

## Data Flow

### Main to Frontend

```
Main Process -> Event Bus -> IPC Bridge -> Frontend Event Bus -> Component
```

### Frontend to Main

```
Component -> Frontend Event Bus -> IPC Bridge -> Main Event Bus -> Service
```

## Module Organization

### By Layer

```
src/
├── main/          # Electron main process
├── renderer/      # Renderer process (vanilla TS)
├── preload/       # Preload script
└── shared/        # Shared code
```

### By Concern

```
frontend/src/
├── core/          # Singleton services
├── features/      # Feature modules
├── models/        # Data models
├── viewmodels/    # State management
└── views/         # Components
```

## Configuration Flow

```
Runtime Config -> App Config -> Services -> Components
```

Configuration flows from external files through the application hierarchy.

## Build Architecture

```
Source Files -> Rspack/Angular -> Bundled Output -> Electron Builder -> Distribution
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

### Vertical Scaling

- DI container manages service complexity
- Facade pattern hides implementation details
- Use case pattern organizes business logic

## Performance Considerations

- Lazy loading for feature modules
- Tree-shaking for unused code
- Efficient change detection with signals
- Optimized bundle sizes with Rspack

## Testing Architecture

```
Unit Tests -> Security Tests -> E2E Tests
```

### Test Layers

| Layer | Purpose | Tools |
|-------|---------|-------|
| Unit | Individual components | Bun:test |
| Security | Security validation | Custom scripts |
| E2E | Full application flow | Playwright |

## Related Documentation

- Project Structure - File and directory organization
- Dependency Injection - DI system details
- Event Bus System - Event communication
- Security Overview - Security features
