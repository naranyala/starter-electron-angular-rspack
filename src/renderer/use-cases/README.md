# Renderer Use Cases

This directory contains modular use cases for the renderer process, specifically for handling window creation based on user interactions with the fuzzy search list.

## Purpose

Each use case handles the creation of a specific type of window based on the card clicked in the fuzzy search list. The structure follows the Strategy pattern where each use case implements the same interface but provides different behavior and customization.

## Architecture

- `base-window-usecase.ts` - Abstract base class that provides common window creation functionality
- `window-usecase-factory.ts` - Factory that maps card IDs to their respective use cases
- `index.ts` - Barrel export file for easy importing
- Individual use case files named `{feature-name}.usecase.ts`

## Available Use Cases

- `electron-intro.usecase.ts` - Handles "What is Electron?" card
- `electron-architecture.usecase.ts` - Handles "Electron Architecture" card
- `electron-security.usecase.ts` - Handles "Electron Security Best Practices" card
- `electron-packaging.usecase.ts` - Handles "Packaging and Distribution" card
- `electron-native-apis.usecase.ts` - Handles "Native Operating System APIs" card
- `electron-performance.usecase.ts` - Handles "Performance Optimization" card
- `electron-development.usecase.ts` - Handles "Development Workflow" card
- `electron-versions.usecase.ts` - Handles "Version Management" card

## Example Use Case Implementation

```typescript
import { MenuItem } from './base-window-usecase';
import { BaseWindowUseCase } from './base-window-usecase';

export class ElectronIntroUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'electron-blue',
      bg: '#4a6cf7',
      color: 'white'
    };

    this.generateWindow(card, theme);
  }
}
```

## Usage

The `WindowUseCaseFactory` is used in `app.ts` to determine which use case to execute when a card is clicked:

```typescript
private handleCardClick(card: MenuItem, index: number): void {
  // Use the factory to get the appropriate use case for the card
  const useCase = WindowUseCaseFactory.createUseCase(card.id);
  if (useCase) {
    useCase.execute(card, index);
  }
}
```

## Benefits

- **Modularity**: Each window type is encapsulated in its own class
- **Customization**: Each use case can customize appearance, behavior, and content
- **Maintainability**: Changes to one window type don't affect others
- **Extensibility**: Easy to add new window types by creating new use cases
- **Consistency**: Common functionality is shared through the base class
- **Testability**: Individual use cases can be tested in isolation