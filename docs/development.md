# Development Guide

## Prerequisites

- Node.js 18+ or Bun runtime
- Git
- Basic understanding of TypeScript and Electron

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/naranyala/starter-rspack-electron-vanilla
cd starter-rspack-electron-vanilla
```

### 2. Install Dependencies

```bash
npm install
# OR
bun install
```

### 3. Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

This will:
- Start the Rspack development server
- Launch Electron in development mode
- Enable hot module replacement for rapid iteration

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development with HMR |
| `npm run build` | Production build |
| `npm run build:check` | Build with type checking |
| `npm run build:verbose` | Build with verbose output |
| `npm run start` | Run production build |
| `npm run dist` | Create distributable packages |
| `npm run type-check` | TypeScript validation |
| `npm run type-check:strict` | Strict TypeScript validation |
| `npm run lint` | Lint and auto-fix code |
| `npm run format` | Format code with Biome |
| `npm run clean` | Remove build artifacts |
| `npm run check-deps` | Verify dependencies |
| `npm run icons` | Build icon assets |
| `npm run assets` | Copy asset files |

## Development Workflow

### Adding New Features

1. **Create Use Cases**: Implement business logic in `/src/main/use-cases/` or `/src/renderer/use-cases/`
2. **Define Types**: Add TypeScript interfaces in `/src/shared/types/`
3. **Implement IPC**: Define communication in `/src/main/ipc/` and `/src/renderer/ipc/`
4. **Add Components**: Create UI elements in `/src/renderer/components/`
5. **Test**: Ensure TypeScript compiles and linting passes

### Working with IPC

#### Main Process
```typescript
import { ipc } from './ipc';

ipc.register('my-action', async (event, params) => {
  // Handle the action
  return { success: true, data: 'result' };
});
```

#### Renderer Process
```typescript
const result = await window.electronAPI.invoke('my-action', params);
console.log(result); // { success: true, data: 'result' }
```

### Adding New Windows

Use the WindowUseCaseFactory pattern:

```typescript
// In renderer process
const useCase = WindowUseCaseFactory.createUseCase('feature-name');
useCase.execute(card, index);
```

### Styling

CSS is handled through:
- `/src/renderer/styles.css` - Global styles
- Component-specific styles
- Theme support through CSS variables

## Debugging

### Main Process Debugging

Use VS Code debugger with the provided launch configuration:
- Open `.vscode/launch.json`
- Select "Debug Main Process"
- Set breakpoints and start debugging

### Renderer Process Debugging

- Use Chrome DevTools (Ctrl+Shift+I in development)
- Access through View → Toggle Developer Tools

### IPC Debugging

Enable verbose logging:
```bash
npm run dev:verbose
```

## Testing

### Type Checking

Run type checking to catch errors early:
```bash
npm run type-check
```

### Linting

Maintain code quality with:
```bash
npm run lint
npm run format
```

## Build Process

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This creates optimized bundles in the `dist/` directory.

### Distribution

```bash
npm run dist
```

Creates platform-specific installers in the `release/` directory.

## Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `ELECTRON_START_URL`: Development server URL
- `VERBOSE`: Enable verbose logging (when using `:verbose` scripts)

## Common Development Tasks

### Adding Dependencies

```bash
npm install package-name
```

### Updating Dependencies

```bash
npm run deps:latest
```

### Cleaning Build Artifacts

```bash
npm run clean
```

### Checking Dependencies

```bash
npm run check-deps
```

## Best Practices

1. **Type Safety**: Always define TypeScript interfaces for data structures
2. **Separation of Concerns**: Keep main and renderer processes separate
3. **Security**: Never expose Node.js APIs directly to renderer
4. **Performance**: Use efficient algorithms and minimize bundle size
5. **Error Handling**: Implement proper error boundaries and fallbacks
6. **Testing**: Regularly run type checks and linting