# Architecture & Design Patterns

## Project Architecture

The application follows a modular architecture with clear separation of concerns between processes:

### Process Separation

- **Main Process**: Handles application lifecycle, window management, and system integration
- **Renderer Process**: Manages UI rendering and user interactions
- **Preload Process**: Acts as a bridge between main and renderer with controlled API exposure
- **Shared**: Contains types and utilities used across processes

### Directory Structure

```
src/
├── main/                  # Main process (Node.js)
│   ├── components/       # Main process components
│   ├── constants/        # Constants and configurations
│   ├── ipc/              # IPC handlers and definitions
│   ├── lib/              # Core utilities
│   ├── types/            # Main process types
│   ├── use-cases/        # Business logic implementations
│   ├── config.ts         # Main process configuration
│   ├── index.ts          # Main entry point
│   ├── ipc.ts            # IPC registration
│   └── window.ts         # Window management
├── renderer/              # Renderer process (Browser)
│   ├── components/       # UI components
│   ├── config/           # Renderer configuration
│   ├── ipc/              # IPC client implementations
│   ├── lib/              # Frontend utilities
│   ├── types/            # Renderer process types
│   ├── use-cases/        # UI business logic
│   ├── app.ts            # Application setup
│   ├── index.html        # HTML template
│   ├── index.ts          # Renderer entry point
│   ├── menu-data.ts      # Menu configuration
│   ├── renderer.ts       # Renderer utilities
│   ├── styles.css        # Styles
│   ├── styles.ts         # Style utilities
│   ├── winbox-dark-theme.css  # WinBox theme
│   ├── winbox-sidebar.ts      # WinBox sidebar implementation
│   └── window-generator.ts    # Window generation logic
├── preload/               # Preload scripts
│   └── index.ts          # Secure API exposure
└── shared/                # Shared types and utilities
    ├── types/            # Shared TypeScript definitions
    └── lib/              # Shared helpers
```

## Design Patterns

### 1. Use Case Pattern

Business logic is encapsulated in use case classes that follow the Command pattern:

```typescript
class SomeUseCase {
  execute(params: SomeParams): Promise<SomeResult> {
    // Business logic here
  }
}
```

### 2. Factory Pattern

Window creation and management uses factory patterns:

```typescript
const useCase = WindowUseCaseFactory.createUseCase('some-feature');
useCase.execute(card, index);
```

### 3. Dependency Injection

Services are injected to promote loose coupling and testability:

```typescript
class SomeService {
  constructor(private readonly dependency: SomeDependency) {}
}
```

### 4. Observer Pattern

Event handling and state management use observer patterns:

```typescript
class EventEmitter {
  on(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
}
```

## IPC Communication

Inter-Process Communication is handled through a type-safe interface:

### Main Process
```typescript
ipc.register('action-name', async (event, params) => {
  // Handle the action
  return result;
});
```

### Renderer Process
```typescript
const result = await window.electronAPI.invoke('action-name', params);
```

## Configuration Management

Configuration is managed through multiple layers:

1. **Environment Variables**: Runtime configuration
2. **Static Configuration Files**: Build-time settings
3. **Dynamic Configuration**: Runtime updates

## Error Handling Strategy

- **Graceful Degradation**: Applications continue functioning when possible
- **Structured Logging**: Comprehensive error logging with context
- **User-Friendly Messages**: Technical errors translated to user messages
- **Automatic Recovery**: Where possible, automatic recovery from common issues