# Project Structure

Complete directory and file organization reference for Electron Angular Rspack Starter.

## Root Structure

```
starter-electron-angular-rspack/
├── src/                          # Electron source code
├── frontend/                     # Angular application
├── scripts/                      # Build and dev scripts
├── docs/                         # Documentation
├── test/                         # Test files
├── config/                       # Runtime configuration
├── dist/                         # Build output (git-ignored)
├── release/                      # Distribution packages (git-ignored)
├── assets/                       # Application assets
├── .git/                         # Git repository
├── .qwen/                        # Qwen configuration
├── [config files]                # Package.json, tsconfig, etc.
└── run.sh                        # Run script
```

## Source Directory (src/)

### Main Process (src/main/)

Application orchestration and core services.

```
src/main/
├── app/                          # Application orchestration (4 files)
│   ├── app.config.ts             # Configuration definitions
│   ├── app.facade.ts             # Main process facade API
│   ├── app.lifecycle.ts          # Lifecycle event handlers
│   └── index.ts                  # Module exports
├── di/                           # Dependency injection (4 files)
│   ├── container.ts              # DI container implementation
│   ├── tokens.ts                 # Injection tokens
│   ├── registry.ts               # Service registry
│   └── index.ts                  # Module exports
├── events/                       # Event bus system (3 files)
│   ├── event-bus.ts              # Core event bus
│   ├── event-bus.facade.ts       # Simplified facade
│   └── index.ts                  # Module exports
├── errors/                       # Error handling (2 files)
│   ├── error-handler.ts          # Error handler service
│   └── index.ts                  # Module exports
├── services/                     # Core services (4 files)
│   ├── logger.service.ts         # Logging service
│   ├── window.service.ts         # Window management
│   ├── ipc-handler.service.ts    # IPC handler service
│   └── index.ts                  # Module exports
├── lib/                          # Utilities (15 files)
│   ├── lifecycle/                # Lifecycle management
│   ├── window/                   # Window utilities
│   ├── app-bootstrap.ts          # Application bootstrap
│   ├── app-manager.ts            # Application manager
│   ├── config.ts                 # Configuration utilities
│   ├── filesystem.ts             # File system operations
│   ├── ipc.ts                    # IPC utilities
│   ├── ipc-utils.ts              # IPC helper functions
│   ├── logger.ts                 # Logger utilities
│   ├── utils.ts                  # General utilities
│   ├── utils-enhanced.ts         # Enhanced utilities
│   ├── window-manager.ts         # Window manager
│   └── index.ts                  # Module exports
├── use-cases/                    # Business logic (8 files)
│   ├── base-main-usecase.ts      # Base use case class
│   ├── create-window.usecase.ts  # Create window use case
│   ├── quit-app.usecase.ts       # Quit application use case
│   ├── show-message.usecase.ts   # Show message use case
│   ├── main-usecase-factory.ts   # Use case factory
│   ├── usecase-ipc-registration.ts # IPC registration
│   ├── index.ts                  # Module exports
│   └── README.md                 # Use case documentation
├── index.ts                      # Main entry point
├── ipc.ts                        # IPC handlers
└── window.ts                     # Window utilities
```

### Renderer Process (src/renderer/)

Secure renderer with UI components.

```
src/renderer/
├── components/                   # UI components (2 files)
│   ├── menu-data.ts              # Menu data definitions
│   └── window-generator.ts       # Window generator
├── lib/                          # Renderer utilities (15 files)
│   ├── ui/                       # UI utilities
│   ├── window/                   # Window utilities
│   ├── animations.ts             # Animation utilities
│   ├── api.ts                    # API utilities
│   ├── dom.ts                    # DOM manipulation
│   ├── events.ts                 # Event utilities
│   ├── state.ts                  # State management
│   ├── storage.ts                # Storage utilities
│   ├── ui-utils.ts               # UI helper functions
│   ├── utils.ts                  # General utilities
│   ├── utils-enhanced.ts         # Enhanced utilities
│   └── index.ts                  # Module exports
├── use-cases/                    # Renderer use cases (10 files)
│   ├── base-window-usecase.ts    # Base window use case
│   ├── electron-*.usecase.ts     # Electron API use cases (8 files)
│   └── index.ts                  # Module exports
├── types/                        # Type definitions (1 file)
│   └── winbox.d.ts               # WinBox type definitions
├── app.ts                        # Renderer app
├── index.html                    # HTML template
├── index.ts                      # Renderer entry
├── renderer.ts                   # Renderer logic
└── styles.css                    # Styles
```

### Shared Code (src/shared/)

Shared types, utilities, and definitions.

```
src/shared/
├── errors/                       # Error handling (3 files)
│   ├── error-codes.ts            # Error codes enum
│   ├── result.ts                 # Result types (Ok/Err)
│   └── index.ts                  # Module exports
├── events/                       # Shared events (2 files)
│   ├── types.ts                  # Event type definitions
│   └── index.ts                  # Module exports
├── ipc/                          # IPC definitions (3 files)
│   ├── channels.ts               # IPC channel definitions
│   ├── types.ts                  # IPC type contracts
│   └── index.ts                  # Module exports
├── lib/                          # Shared utilities (19 files)
│   ├── config/                   # Configuration utilities
│   ├── data/                     # Data utilities
│   ├── platform/                 # Platform utilities
│   ├── types/                    # Shared types
│   └── utils/                    # Utility functions (12 files)
│       ├── array.ts              # Array utilities
│       ├── async.ts              # Async utilities
│       ├── crypto.ts             # Crypto utilities
│       ├── date.ts               # Date utilities
│       ├── form.ts               # Form utilities
│       ├── misc.ts               # Miscellaneous utilities
│       ├── network.ts            # Network utilities
│       ├── object.ts             # Object utilities
│       ├── search.ts             # Search utilities
│       ├── string.ts             # String utilities
│       ├── validation.ts         # Validation utilities
│       └── index.ts              # Module exports
├── types/                        # Type definitions (6 files)
│   ├── window.types.ts           # Window types
│   ├── app.types.ts              # Application types
│   ├── config.types.ts           # Configuration types
│   ├── ipc.types.ts              # IPC types
│   ├── event.types.ts            # Event types
│   └── index.ts                  # Module exports
└── index.ts                      # Shared module exports
```

### Preload Script (src/preload/)

Secure context bridge setup.

```
src/preload/
└── index.ts                      # Context bridge and API exposure
```

### Assets (src/assets/)

Application assets and icons.

```
src/assets/
├── favicon.ico                   # Browser favicon
├── icon.ico                      # Windows icon
├── icon.png                      # PNG icon
├── icon.svg                      # SVG icon
└── logo.svg                      # Application logo
```

## Frontend Directory (frontend/)

Angular application with modern architecture.

### Core Services (frontend/src/core/)

Singleton services and core functionality.

```
frontend/src/core/
├── di/                           # DI module (3 files)
│   ├── di.module.ts              # DI module definition
│   ├── services.ts               # Service providers
│   └── index.ts                  # Module exports
├── events/                       # Event bus (3 files)
│   ├── event-bus.ts              # Event bus implementation
│   ├── event-bus.facade.ts       # Event bus facade
│   └── index.ts                  # Module exports
├── errors/                       # Error handling (2 files)
│   ├── error.service.ts          # Error handling service
│   └── index.ts                  # Module exports
├── window/                       # Window management (2 files)
│   ├── window.facade.ts          # Window facade
│   └── index.ts                  # Module exports
├── plugins/                      # Plugin system (2 files)
│   ├── plugin.interface.ts       # Plugin interface
│   └── plugin-registry.ts        # Plugin registry
├── error-interceptor.ts          # HTTP error interceptor
├── global-error.handler.ts       # Global error handler
├── global-error.service.ts       # Global error service
├── winbox.service.ts             # WinBox service
└── index.ts                      # Core module exports
```

### Features (frontend/src/features/)

Feature modules for specific functionality.

```
frontend/src/features/
└── search/                       # Search feature (2 files)
    ├── search.service.ts         # Search service
    └── index.ts                  # Feature exports
```

### Models (frontend/src/models/)

Data models and interfaces.

```
frontend/src/models/
├── card.model.ts                 # Card data model
├── log.model.ts                  # Log entry model
├── window.model.ts               # Window model
└── index.ts                      # Model exports
```

### ViewModels (frontend/src/viewmodels/)

State management with signals.

```
frontend/src/viewmodels/
├── api-client.viewmodel.ts       # API client state
├── error-dashboard.viewmodel.ts  # Error dashboard state
├── event-bus.viewmodel.ts        # Event bus state
├── logger.viewmodel.ts           # Logger state
├── logging.viewmodel.ts          # Logging state
├── window-state.viewmodel.ts     # Window state
└── index.ts                      # ViewModel exports
```

### Views (frontend/src/views/)

Angular components and templates.

```
frontend/src/views/
├── demo/                         # Demo views (2 files)
│   ├── demo.component.ts         # Demo component
│   └── error-handling-demo.component.ts # Error handling demo
├── devtools/                     # DevTools views (1 file)
│   └── devtools.component.ts     # DevTools component
├── home/                         # Home views (1 file)
│   └── home.component.ts         # Home component
├── shared/                       # Shared components (2 files)
│   ├── error-dashboard.component.ts # Error dashboard
│   └── error-modal.component.ts  # Error modal
├── app.component.ts              # Root component
├── app.component.html            # Root template
├── app.component.css             # Root styles
├── app.module.ts                 # Root module
└── app-routing.module.ts         # Root routing
```

### Environments (frontend/src/environments/)

Environment-specific configurations.

```
frontend/src/environments/
├── environment.ts                # Development environment
└── environment.prod.ts           # Production environment
```

## Scripts Directory (scripts/)

Build and development automation scripts.

```
scripts/
├── lib/                          # Script utilities (2 files)
│   ├── logger.ts                 # Script logger
│   └── utils.ts                  # Script utilities
├── security/                     # Security tools (6 files)
│   ├── advanced-security-scanner.ts  # Security scanner
│   ├── code-analysis.ts          # Code analysis
│   ├── dependency-scan.ts        # Dependency scanning
│   ├── enhanced-security-audit.ts # Security audit
│   ├── security-build-pipeline.ts # Security pipeline
│   └── security-build.ts         # Security build
├── build.ts                      # Build script
├── dev.ts                        # Development script
├── clean.ts                      # Clean script
├── copy-assets.ts                # Asset copying script
├── type-check.ts                 # Type checking script
├── check-deps.ts                 # Dependency check script
└── build-icons.ts                # Icon building script
```

## Test Directory (test/)

Test files and test utilities.

```
test/
├── security/                     # Security tests (9 files)
│   ├── security-suite.test.ts        # Main security suite
│   ├── main-process-security.test.ts # Main process security
│   ├── ipc-security.test.ts          # IPC security tests
│   ├── file-system-security.test.ts  # File system security
│   ├── network-security.test.ts      # Network security tests
│   ├── electron-vulnerabilities.test.ts # Electron vulnerabilities
│   ├── dependency-security.test.ts   # Dependency security
│   ├── csp-validation.test.ts        # CSP validation
│   └── comprehensive-security-suite.test.ts # Comprehensive tests
├── unit/                         # Unit tests (1 file)
│   └── basic-security.test.ts    # Basic security tests
├── setup.ts                      # Test setup
└── README.md                     # Test documentation
```

## Documentation Directory (docs/)

Project documentation.

```
docs/
├── index.md                      # Documentation index
├── overview.md                   # Project overview
├── architecture.md               # System architecture
├── project-structure.md          # This file
├── getting-started.md            # Setup guide
├── development.md                # Development guide
├── dependency-injection.md       # DI guide
├── event-bus.md                  # Event bus guide
├── errors-as-values.md           # Error handling guide
├── ipc-communication.md          # IPC guide
├── building.md                   # Build guide
├── distribution.md               # Distribution guide
├── testing.md                    # Testing guide
├── security.md                   # Security guide
├── performance.md                # Performance guide
├── troubleshooting.md            # Troubleshooting guide
├── contributing.md               # Contribution guide
└── api-reference.md              # API reference
```

## Configuration Files

### Root Configuration

| File | Purpose |
|------|---------|
| package.json | Root dependencies and scripts |
| tsconfig.json | Root TypeScript configuration |
| tsconfig.main.json | Main process TypeScript config |
| tsconfig.scripts.json | Scripts TypeScript config |
| biome.json | Biome linter/formatter config |
| bun.lock | Bun package manager lockfile |
| rspack.config.cjs | Rspack bundler configuration |
| run.sh | Run script for common commands |

### Frontend Configuration

| File | Purpose |
|------|---------|
| frontend/package.json | Frontend dependencies and scripts |
| frontend/angular.json | Angular CLI configuration |
| frontend/tsconfig.json | Frontend TypeScript config |
| frontend/tsconfig.app.json | App TypeScript config |
| frontend/tsconfig.spec.json | Spec TypeScript config |
| frontend/biome.json | Frontend Biome config |
| frontend/browserslist | Browser support configuration |

## File Count Summary

| Directory | File Count |
|-----------|------------|
| src/main/ | 44 files |
| src/renderer/ | 40 files |
| src/shared/ | 31 files |
| src/preload/ | 1 file |
| src/assets/ | 5 files |
| frontend/src/ | 52 files |
| scripts/ | 15 files |
| test/ | 12 files |
| docs/ | 32+ files |
| **Total** | **~250 files** |

## Path Aliases

### Main Process

```typescript
import { ... } from '@main/app';
import { ... } from '@main/di';
import { ... } from '@main/events';
import { ... } from '@main/errors';
import { ... } from '@main/services';
import { ... } from '@main/lib';
import { ... } from '@main/use-cases';
```

### Shared Code

```typescript
import { ... } from '@shared/errors';
import { ... } from '@shared/events';
import { ... } from '@shared/ipc';
import { ... } from '@shared/lib';
import { ... } from '@shared/types';
```

### Frontend

```typescript
import { ... } from '@core/events';
import { ... } from '@core/errors';
import { ... } from '@core/window';
import { ... } from '@core/di';
import { ... } from '@features/search';
import { ... } from '@models';
import { ... } from '@viewmodels';
import { ... } from '@views';
```

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Services | *.service.ts | logger.service.ts |
| Components | *.component.ts | home.component.ts |
| Models | *.model.ts | card.model.ts |
| ViewModels | *.viewmodel.ts | event-bus.viewmodel.ts |
| Use Cases | *.usecase.ts | create-window.usecase.ts |
| Types | *.types.ts | window.types.ts |
| Config | *.config.ts | app.config.ts |
| Facade | *.facade.ts | app.facade.ts |
| Utils | *.ts (in lib/) | utils.ts |

## Related Documentation

- [Overview](overview.md) - Project introduction
- [Architecture](architecture.md) - System design
- [Getting Started](getting-started.md) - Setup instructions
