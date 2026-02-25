# Electron Angular Rspack Starter

A production-ready, enterprise-grade starter template for building cross-platform desktop applications with Electron, Angular, and Rspack. This project combines the power of Electron's native capabilities with Angular's robust frontend framework, optimized by Rspack's lightning-fast build system.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building and Distribution](#building-and-distribution)
- [Testing](#testing)
- [Security](#security)
- [Dependency Injection](#dependency-injection)
- [IPC Communication](#ipc-communication)
- [Configuration](#configuration)
- [Scripts Reference](#scripts-reference)
- [Contributing](#contributing)
- [License](#license)

## Overview

This starter template provides a solid foundation for building modern desktop applications. It eliminates the complexity of setting up Electron with Angular by providing a pre-configured, optimized, and production-ready environment.

### Why This Template

Building desktop applications with web technologies requires careful consideration of architecture, security, performance, and maintainability. This template addresses all these concerns out of the box:

- **Fast Development**: Rspack provides build times up to 10x faster than traditional webpack
- **Type Safety**: Full TypeScript support across main process, renderer, and frontend
- **Modern Angular**: Latest Angular with standalone components and signals
- **Security First**: Context isolation, sandbox mode, and security audit tools built-in
- **Scalable Architecture**: Clean separation of concerns with dependency injection
- **Production Ready**: Optimized builds, code signing support, and auto-update ready

## Key Features

### Development Experience

- Hot module replacement for both main and renderer processes
- TypeScript with strict mode enabled
- Biome for linting and formatting (10x faster than ESLint + Prettier)
- Bun runtime for faster script execution
- Comprehensive development scripts

### Architecture

- Dependency injection system for both backend and frontend
- Facade pattern for simplified API access
- Service registry for automatic service discovery
- Feature module structure for scalability
- Clean separation between main, renderer, and frontend code

### Security

- Context isolation enabled by default
- Sandbox mode for renderer process
- Web security features enabled
- Security audit scripts
- Dependency vulnerability scanning
- Code analysis tools

### Performance

- Rspack for sub-second builds
- Tree-shaking and code splitting
- Lazy loading for Angular modules
- Optimized production builds
- Minimal bundle size

## Architecture

The application follows a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ App Facade  │  │   Services   │  │  DI Container   │    │
│  │             │  │              │  │                 │    │
│  │ - Lifecycle │  │ - Logger     │  │ - Register      │    │
│  │ - Windows   │  │ - Window     │  │ - Resolve       │    │
│  │ - IPC       │  │ - IPC        │  │ - Scoped        │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                    IPC Bridge
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Angular Frontend                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ Components  │  │   Services   │  │   ViewModels    │    │
│  │             │  │              │  │                 │    │
│  │ - Home      │  │ - Window     │  │ - Event Bus     │    │
│  │ - Demo      │  │ - Search     │  │ - Logger        │    │
│  │ - DevTools  │  │ - Error      │  │ - State         │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Main Process

The Electron main process handles native OS integration, window management, and privileged operations. It uses a custom dependency injection container for service management.

### Renderer Process

The preload script provides a secure bridge between the main process and frontend using contextBridge. All IPC communication is type-safe and validated.

### Frontend

Angular application with modern features including signals, standalone components, and lazy-loaded feature modules. Uses a service-based architecture with facades for complex operations.

## Project Structure

```
starter-electron-angular-rspack/
├── src/                          # Electron source code
│   ├── main/                     # Main process (Node.js)
│   │   ├── app/                  # Application orchestration
│   │   │   ├── app.facade.ts     # Main process facade
│   │   │   ├── app.config.ts     # Configuration definitions
│   │   │   ├── app.lifecycle.ts  # Lifecycle handlers
│   │   │   └── index.ts          # Module exports
│   │   ├── di/                   # Dependency injection
│   │   │   ├── container.ts      # DI container implementation
│   │   │   ├── tokens.ts         # Injection tokens
│   │   │   ├── registry.ts       # Service registry
│   │   │   └── index.ts          # Module exports
│   │   ├── services/             # Core services
│   │   │   ├── logger.service.ts # Logging service
│   │   │   ├── window.service.ts # Window management
│   │   │   └── ipc-handler.service.ts # IPC handlers
│   │   ├── lib/                  # Utilities and managers
│   │   │   ├── lifecycle/        # Lifecycle management
│   │   │   ├── window/           # Window utilities
│   │   │   ├── app-manager.ts    # App management
│   │   │   ├── config.ts         # Config management
│   │   │   ├── filesystem.ts     # File operations
│   │   │   └── ipc.ts            # IPC utilities
│   │   ├── use-cases/            # Business logic
│   │   │   ├── base-main-usecase.ts
│   │   │   ├── create-window.usecase.ts
│   │   │   └── README.md
│   │   └── index.ts              # Main entry point
│   │
│   ├── renderer/                 # Renderer process (Vanilla TS)
│   │   ├── app/                  # Renderer app logic
│   │   ├── features/             # Renderer features
│   │   │   ├── demo/             # Demo feature
│   │   │   └── navigation/       # Navigation feature
│   │   ├── lib/                  # Renderer utilities
│   │   │   ├── dom/              # DOM utilities
│   │   │   ├── events/           # Event utilities
│   │   │   ├── storage/          # Storage utilities
│   │   │   └── window/           # Window utilities
│   │   ├── use-cases/            # Renderer use cases
│   │   └── index.ts              # Renderer entry
│   │
│   ├── preload/                  # Preload script
│   │   ├── index.ts              # Context bridge setup
│   │   └── api.ts                # Type-safe API
│   │
│   └── shared/                   # Shared code
│       ├── ipc/                  # IPC definitions
│       │   ├── channels.ts       # Channel definitions
│       │   ├── types.ts          # Type contracts
│       │   └── index.ts          # Module exports
│       ├── lib/                  # Shared utilities
│       │   └── utils/            # Utility functions
│       └── types/                # Shared types
│
├── frontend/                     # Angular application
│   ├── src/
│   │   ├── app/                  # App shell
│   │   │   ├── app.component.ts  # Root component
│   │   │   ├── app.config.ts     # App configuration
│   │   │   └── app.routes.ts     # App routes
│   │   ├── core/                 # Core services (singleton)
│   │   │   ├── di/               # DI module
│   │   │   │   ├── di.module.ts  # DI definitions
│   │   │   │   ├── services.ts   # Service providers
│   │   │   │   └── index.ts      # Module exports
│   │   │   ├── error-handling/   # Error handling
│   │   │   │   ├── error.service.ts
│   │   │   │   ├── error.types.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── logging/          # Logging
│   │   │   ├── window/           # Window management
│   │   │   │   ├── window.facade.ts
│   │   │   │   ├── window.service.ts
│   │   │   │   └── index.ts
│   │   │   └── winbox.service.ts # WinBox wrapper
│   │   ├── features/             # Feature modules
│   │   │   ├── home/             # Home feature
│   │   │   ├── search/           # Search feature
│   │   │   │   ├── search.service.ts
│   │   │   │   └── index.ts
│   │   │   ├── demo/             # Demo feature
│   │   │   └── devtools/         # DevTools feature
│   │   ├── models/               # Data models
│   │   │   ├── card.model.ts
│   │   │   ├── log.model.ts
│   │   │   └── window.model.ts
│   │   ├── types/                # Type definitions
│   │   │   ├── error.types.ts
│   │   │   └── index.ts
│   │   ├── viewmodels/           # State management
│   │   │   ├── event-bus.viewmodel.ts
│   │   │   ├── logger.viewmodel.ts
│   │   │   ├── logging.viewmodel.ts
│   │   │   └── window-state.viewmodel.ts
│   │   ├── views/                # View components
│   │   │   ├── demo/             # Demo views
│   │   │   ├── devtools/         # DevTools views
│   │   │   ├── home/             # Home views
│   │   │   ├── shared/           # Shared components
│   │   │   ├── app.component.ts  # Root component
│   │   │   ├── app.module.ts     # Root module
│   │   │   └── app-routing.module.ts
│   │   ├── environments/         # Environment configs
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   ├── assets/               # Static assets
│   │   ├── main.ts               # Angular bootstrap
│   │   ├── index.html            # HTML template
│   │   ├── styles.css            # Global styles
│   │   └── polyfills.ts          # Polyfills
│   ├── angular.json              # Angular configuration
│   ├── tsconfig.json             # TypeScript config
│   └── package.json              # Frontend dependencies
│
├── scripts/                      # Build and dev scripts
│   ├── lib/                      # Script utilities
│   │   ├── logger.ts
│   │   └── utils.ts
│   ├── security/                 # Security tools
│   │   ├── advanced-security-scanner.ts
│   │   ├── code-analysis.ts
│   │   └── dependency-scan.ts
│   ├── build.ts                  # Build script
│   ├── dev.ts                    # Development script
│   ├── clean.ts                  # Clean script
│   └── type-check.ts             # Type checking
│
├── docs/                         # Documentation
│   ├── DI-GUIDE.md               # Dependency injection guide
│   ├── STRUCTURE-IMPROVEMENTS.md # Structure improvements
│   └── IMPLEMENTATION-SUMMARY.md # Implementation summary
│
├── config/                       # Runtime configuration
│   ├── app.config.json           # Application config
│   ├── window.config.json        # Window settings
│   └── features.config.json      # Feature flags
│
├── test/                         # Test files
│   ├── security/                 # Security tests
│   └── unit/                     # Unit tests
│
├── coverage/                     # Test coverage reports
├── dist/                         # Build output
├── release/                      # Distribution packages
│
├── main.cjs                      # Compiled main process
├── rspack.config.cjs             # Rspack configuration
├── tsconfig.json                 # Root TypeScript config
├── tsconfig.main.json            # Main process TS config
├── package.json                  # Root package.json
├── bun.lock                      # Bun lockfile
├── biome.json                    # Biome configuration
└── LICENSE                       # MIT License
```

### Directory Responsibilities

#### src/main/
Contains all Electron main process code. This runs in Node.js and has access to native OS APIs.

- **app/**: Application orchestration, lifecycle, and configuration
- **di/**: Dependency injection container and service registry
- **services/**: Core injectable services (Logger, Window, IPC)
- **lib/**: Utility classes and managers
- **use-cases/**: Business logic use cases

#### src/renderer/
Vanilla TypeScript code for the renderer process. Used for lightweight UI that doesn't need Angular.

#### src/preload/
Secure bridge between main process and frontend. Uses contextBridge for safe IPC communication.

#### src/shared/
Code shared between main and renderer processes.

- **ipc/**: Centralized IPC channel definitions and type contracts
- **lib/**: Shared utility functions
- **types/**: Shared TypeScript types

#### frontend/
Full Angular application. This is the main UI layer.

- **app/**: Application shell and root configuration
- **core/**: Singleton services and core functionality
- **features/**: Lazy-loaded feature modules
- **models/**: Data models and interfaces
- **viewmodels/**: State management with signals
- **views/**: Angular components and routes

#### scripts/
Build, development, and maintenance scripts using Bun and TypeScript.

#### docs/
Comprehensive documentation including architecture guides and implementation details.

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- Bun 1.0 or higher (recommended) or npm 9.0+
- Git

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd starter-electron-angular-rspack
```

Install dependencies:

```bash
# Install root dependencies
bun install

# Install frontend dependencies
cd frontend
bun install
cd ..
```

### Development

Start the development environment:

```bash
bun run dev
```

This will:
1. Start the Angular dev server
2. Build the main process with watch mode
3. Launch the Electron application
4. Enable hot module replacement

### First Project Setup

1. Update `package.json` with your application name and version
2. Modify `src/main/app/app.config.ts` with your configuration
3. Update `frontend/src/environments/environment.ts` for frontend config
4. Replace icons in `assets/` directory
5. Update `README.md` with your project details

## Development

### Development Workflow

The development environment provides:

- **Hot Module Replacement**: Changes to frontend code reload instantly
- **Watch Mode**: Main process changes trigger automatic rebuilds
- **Type Checking**: Continuous type checking during development
- **Linting**: Biome checks code quality on save

### Available Scripts

```bash
# Development
bun run dev              # Start development environment
bun run dev:verbose      # Development with verbose logging
bun run electron-dev     # Start Electron in development mode

# Building
bun run build            # Build for production
bun run build:check      # Build with type checking
bun run build:verbose    # Build with verbose output
bun run build:frontend   # Build Angular frontend only
bun run build:main       # Build main process only

# Testing
bun run test             # Run all tests
bun run test:unit        # Run unit tests
bun run test:security    # Run security tests
bun run test:coverage    # Run tests with coverage

# Code Quality
bun run lint             # Run Biome linting
bun run lint-check       # Check linting without fixing
bun run format           # Format code with Biome
bun run format-check     # Check formatting without fixing
bun run type-check       # Run TypeScript type checking

# Security
bun run security:audit   # Run security audit
bun run security:scan    # Run security scanning
bun run security:all     # Run all security checks

# Utilities
bun run clean            # Clean build artifacts
bun run clean:dry        # Preview what would be cleaned
bun run assets           # Copy assets to build directory
bun run icons            # Build application icons

# Distribution
bun run electron-pack    # Package application
bun run electron-dist    # Build distributable
bun run dist             # Full build and distribution
```

### Debugging

#### Main Process Debugging

1. Start with `bun run dev`
2. Open DevTools from the Electron menu
3. Use `console.log` or the built-in logger service

#### Frontend Debugging

1. Angular DevTools extension for Chrome/Firefox
2. Built-in error dashboard at `/devtools`
3. Console access through Electron DevTools

#### IPC Debugging

Use the DevTools component to monitor IPC messages in real-time.

## Building and Distribution

### Production Build

```bash
# Full production build
bun run build

# Build and package
bun run dist
```

### Configuration

Update `electron-builder` configuration in `package.json`:

```json
{
  "build": {
    "appId": "com.your.app",
    "productName": "Your App",
    "directories": {
      "output": "release"
    },
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    }
  }
}
```

### Code Signing

For production distribution, configure code signing:

```bash
# Set signing environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="your-password"
export APPLE_ID="your-apple-id"
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"

# Build with signing
bun run electron-dist
```

### Auto Updates

The template is ready for auto-updates. Configure in `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-org",
      "repo": "your-repo"
    }
  }
}
```

## Testing

### Unit Tests

```bash
bun run test:unit
```

### Security Tests

```bash
bun run test:security
```

### Coverage

```bash
bun run test:coverage
```

Coverage reports are generated in `coverage/` directory.

### Writing Tests

```typescript
// Example unit test
import { describe, it, expect } from 'bun:test';
import { LoggerService } from '../src/main/services/logger.service';

describe('LoggerService', () => {
  it('should create instance', () => {
    const logger = new LoggerService();
    expect(logger).toBeDefined();
  });

  it('should log messages', () => {
    const logger = new LoggerService();
    expect(() => logger.info('test', 'message')).not.toThrow();
  });
});
```

## Security

### Built-in Security Features

- **Context Isolation**: Enabled by default
- **Sandbox Mode**: Renderer runs in sandbox
- **Web Security**: Same-origin policy enforced
- **Node Integration**: Disabled in renderer
- **Preload Script**: Secure contextBridge usage

### Security Tools

```bash
# Run security audit
bun run security:audit

# Scan for vulnerabilities
bun run security:scan

# Analyze code for security issues
bun run security:analyze

# Full security pipeline
bun run security:ci
```

### Security Best Practices

1. Never expose Node.js APIs to renderer without validation
2. Use IPC channels for all main-renderer communication
3. Validate all input from renderer process
4. Keep dependencies updated
5. Run security audits regularly

## Dependency Injection

### Backend DI

The main process uses a custom DI container:

```typescript
import { container, Injectable } from './di/index.js';

@Injectable({ scope: 'singleton' })
export class MyService {
  constructor(private logger: LoggerService) {}
}

// Resolve service
const service = container.resolve(MyService);
```

### Frontend DI

Angular's built-in DI with enhanced abstractions:

```typescript
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  private logger = inject(LoggerService);
}
```

### Service Facades

Simplify complex operations with facades:

```typescript
// Main process
import { appFacade } from './app';
appFacade.logger.info('app', 'message');
appFacade.windows.create({...});

// Frontend
import { WindowFacade } from '@core/window';
constructor(private windowFacade: WindowFacade) {}
```

See `docs/DI-GUIDE.md` for complete documentation.

## IPC Communication

### Channel Definitions

All IPC channels are defined in `src/shared/ipc/channels.ts`:

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

// Main process
ipcMain.handle(IPC_CHANNELS.LOG.WRITE, handler);

// Frontend
const result = await ipcRenderer.invoke(IPC_CHANNELS.LOG.WRITE, data);
```

### Type Safety

All IPC messages have type definitions in `src/shared/ipc/types.ts`:

```typescript
interface LogWriteRequest {
  entry: LogEntry;
}

interface LogWriteResponse {
  success: boolean;
}
```

### Best Practices

1. Always use `IPC_CHANNELS` constants
2. Define types for all messages
3. Validate input in handlers
4. Handle errors gracefully
5. Document all channels

## Configuration

### Application Configuration

Edit `src/main/app/app.config.ts`:

```typescript
export const DEFAULT_CONFIG: AppConfig = {
  name: 'Your App',
  version: '1.0.0',
  environment: 'development',
  window: {
    defaultWidth: 1200,
    defaultHeight: 800,
  },
  logging: {
    level: LogLevel.INFO,
  },
};
```

### Frontend Configuration

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  logging: {
    level: 'debug',
  },
};
```

### Runtime Configuration

Create `config/app.config.json` for runtime configuration:

```json
{
  "window": {
    "defaultWidth": 1200,
    "defaultHeight": 800
  },
  "features": {
    "devTools": true,
    "logging": {
      "level": "INFO"
    }
  }
}
```

## Scripts Reference

### Development Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start full development environment |
| `dev:verbose` | Development with verbose logging |
| `electron-dev` | Start Electron in dev mode |

### Build Scripts

| Script | Description |
|--------|-------------|
| `build` | Full production build |
| `build:check` | Build with type checking |
| `build:frontend` | Build Angular only |
| `build:main` | Build main process only |

### Test Scripts

| Script | Description |
|--------|-------------|
| `test` | Run all tests |
| `test:unit` | Run unit tests |
| `test:security` | Run security tests |
| `test:coverage` | Run with coverage |

### Quality Scripts

| Script | Description |
|--------|-------------|
| `lint` | Run Biome linting |
| `format` | Format code |
| `type-check` | Type checking |

### Security Scripts

| Script | Description |
|--------|-------------|
| `security:audit` | Dependency audit |
| `security:scan` | Security scanning |
| `security:analyze` | Code analysis |
| `security:ci` | Full security pipeline |

## Contributing

### Code Style

This project uses Biome for linting and formatting:

```bash
# Format code
bun run format

# Check linting
bun run lint-check
```

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

### Development Guidelines

1. Write TypeScript, not JavaScript
2. Use dependency injection
3. Follow the facade pattern for complex operations
4. Write tests for new features
5. Document public APIs
6. Keep components small and focused

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and questions:

1. Check existing documentation in `docs/`
2. Review implementation in `docs/IMPLEMENTATION-SUMMARY.md`
3. Read the DI guide in `docs/DI-GUIDE.md`
4. Open an issue on GitHub

## Acknowledgments

This template combines best practices from:

- Electron documentation
- Angular style guide
- Rspack configuration guide
- Industry security standards

Built with care for the developer community.
