# Main Process Use Cases

This directory contains modular use cases for the Electron main process.

## Purpose

Use cases in this directory handle backend operations that may be triggered by the renderer process or as part of the application lifecycle. Each use case represents a specific business operation or command that can be executed independently.

## Architecture

- `base-main-usecase.ts` - Base interface defining the contract for all main process use cases
- `main-usecase-factory.ts` - Factory that creates specific use case instances based on type
- `usecase-ipc-registration.ts` - Registration mechanism to connect use cases with IPC channels
- `index.ts` - Barrel export file for easy importing

## Available Use Cases

- `create-window.usecase.ts` - Handles creating new browser windows
- `quit-app.usecase.ts` - Handles quitting the application
- `show-message.usecase.ts` - Handles displaying system messages/dialogs

## Example Usage

```typescript
import { MainUseCaseFactory, UseCaseType } from './use-cases';

// Create and execute a use case
const useCase = MainUseCaseFactory.createUseCase('CREATE_WINDOW');
if (useCase) {
  const result = await useCase.execute({
    id: 'my-window',
    title: 'My Window',
    width: 800,
    height: 600,
    url: 'https://example.com'
  });
}
```

## IPC Integration

Use cases can be registered with IPC channels to allow the renderer process to trigger main process operations:

```typescript
import { UseCaseIPCRegistration } from './use-cases';

// Register all use cases with IPC
UseCaseIPCRegistration.registerUseCases();

// Then from renderer process:
const result = await ipcRenderer.invoke('execute-use-case', 'CREATE_WINDOW', {
  id: 'my-window',
  title: 'My Window',
  width: 800,
  height: 600,
  url: 'https://example.com'
});
```

## Creating New Use Cases

To create a new use case:

1. Create a new file following the pattern `{name}.usecase.ts`
2. Implement the `MainUseCase` interface
3. Add it to the factory in `main-usecase-factory.ts`
4. Export it in the `index.ts` barrel file

## Benefits

- **Modularity**: Each operation is encapsulated in its own class
- **Testability**: Individual use cases can be tested in isolation
- **Maintainability**: Changes to one operation don't affect others
- **Reusability**: Use cases can be composed or reused across different contexts
- **Clear Separation**: Business logic is separated from UI and infrastructure concerns