# Project Structure

Complete directory and file organization reference.

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
└── [config files]                # Package.json, tsconfig, etc.
```

## Source Directory (src/)

### Main Process (src/main/)

```
src/main/
├── app/                          # Application orchestration (4 files)
│   ├── app.config.ts             # Configuration definitions
│   ├── app.facade.ts             # Main process facade
│   ├── app.lifecycle.ts          # Lifecycle handlers
│   └── index.ts                  # Module exports
├── di/                           # Dependency injection (4 files)
│   ├── container.ts              # DI container
│   ├── tokens.ts                 # Injection tokens
│   ├── registry.ts               # Service registry
│   └── index.ts
├── events/                       # Event bus (3 files)
│   ├── event-bus.ts              # Core event bus
│   ├── event-bus.facade.ts       # Simplified facade
│   └── index.ts
├── errors/                       # Error handling (2 files)
│   ├── error-handler.ts          # Error handler
│   └── index.ts
├── services/                     # Core services (4 files)
│   ├── logger.service.ts
│   ├── window.service.ts
│   ├── ipc-handler.service.ts
│   └── index.ts
├── lib/                          # Utilities (15 files)
│   ├── lifecycle/                # Lifecycle management
│   ├── window/                   # Window utilities
│   ├── app-bootstrap.ts
│   ├── app-manager.ts
│   ├── config.ts
│   ├── filesystem.ts
│   ├── ipc.ts
│   ├── ipc-utils.ts
│   ├── logger.ts
│   ├── utils.ts
│   ├── utils-enhanced.ts
│   ├── window-manager.ts
│   └── index.ts
├── use-cases/                    # Business logic (8 files)
│   ├── base-main-usecase.ts
│   ├── create-window.usecase.ts
│   ├── quit-app.usecase.ts
│   ├── show-message.usecase.ts
│   ├── main-usecase-factory.ts
│   ├── usecase-ipc-registration.ts
│   ├── index.ts
│   └── README.md
├── index.ts                      # Main entry point
├── ipc.ts                        # IPC handlers
└── window.ts                     # Window utilities
```

### Renderer Process (src/renderer/)

```
src/renderer/
├── components/                   # UI components (2 files)
│   ├── menu-data.ts
│   └── window-generator.ts
├── lib/                          # Renderer utilities (15 files)
│   ├── ui/                       # UI utilities
│   ├── window/                   # Window utilities
│   ├── animations.ts
│   ├── api.ts
│   ├── dom.ts
│   ├── events.ts
│   ├── state.ts
│   ├── storage.ts
│   ├── ui-utils.ts
│   ├── utils.ts
│   ├── utils-enhanced.ts
│   └── index.ts
├── use-cases/                    # Renderer use cases (10 files)
│   ├── base-window-usecase.ts
│   ├── electron-*.usecase.ts (8 files)
│   └── index.ts
├── types/                        # Type definitions (1 file)
│   └── winbox.d.ts
├── app.ts
├── index.html
├── index.ts
├── renderer.ts
└── styles.css
```

### Shared Code (src/shared/)

```
src/shared/
├── errors/                       # Error handling (3 files)
│   ├── error-codes.ts            # Error codes enum
│   ├── result.ts                 # Result types
│   └── index.ts
├── events/                       # Shared events (2 files)
│   ├── types.ts                  # Event type definitions
│   └── index.ts
├── ipc/                          # IPC definitions (3 files)
│   ├── channels.ts               # Channel definitions
│   ├── types.ts                  # IPC type contracts
│   └── index.ts
├── lib/                          # Shared utilities (19 files)
│   ├── config/                   # Config utilities
│   ├── data/                     # Data utilities
│   ├── platform/                 # Platform utilities
│   ├── types/                    # Shared types
│   └── utils/                    # Utility functions (12 files)
│       ├── array.ts
│       ├── async.ts
│       ├── crypto.ts
│       ├── date.ts
│       ├── form.ts
│       ├── misc.ts
│       ├── network.ts
│       ├── object.ts
│       ├── search.ts
│       ├── string.ts
│       ├── validation.ts
│       └── index.ts
├── types/                        # Type definitions (6 files)
└── index.ts                      # Shared module exports
```

### Preload Script (src/preload/)

```
src/preload/
└── index.ts                      # Context bridge setup
```

### Assets (src/assets/)

```
src/assets/
├── favicon.ico
├── icon.ico
├── icon.png
├── icon.svg
└── logo.svg
```

## Frontend Directory (frontend/)

### Core Services (frontend/src/core/)

```
frontend/src/core/
├── di/                           # DI module (3 files)
│   ├── di.module.ts
│   ├── services.ts
│   └── index.ts
├── events/                       # Event bus (3 files)
│   ├── event-bus.ts
│   ├── event-bus.facade.ts
│   └── index.ts
├── errors/                       # Error handling (2 files)
│   ├── error.service.ts
│   └── index.ts
├── window/                       # Window management (2 files)
│   ├── window.facade.ts
│   └── index.ts
├── plugins/                      # Plugin system (2 files)
│   ├── plugin.interface.ts
│   └── plugin-registry.ts
├── error-interceptor.ts
├── global-error.handler.ts
├── global-error.service.ts
├── winbox.service.ts
└── index.ts
```

### Features (frontend/src/features/)

```
frontend/src/features/
└── search/                       # Search feature (2 files)
    ├── search.service.ts
    └── index.ts
```

### Models (frontend/src/models/)

```
frontend/src/models/
├── card.model.ts
├── log.model.ts
├── window.model.ts
└── index.ts
```

### ViewModels (frontend/src/viewmodels/)

```
frontend/src/viewmodels/
├── api-client.viewmodel.ts
├── error-dashboard.viewmodel.ts
├── event-bus.viewmodel.ts
├── logger.viewmodel.ts
├── logging.viewmodel.ts
├── window-state.viewmodel.ts
└── index.ts
```

### Views (frontend/src/views/)

```
frontend/src/views/
├── demo/                         # Demo views (2 files)
│   ├── demo.component.ts
│   └── error-handling-demo.component.ts
├── devtools/                     # DevTools views (1 file)
│   └── devtools.component.ts
├── home/                         # Home views (1 file)
│   └── home.component.ts
├── shared/                       # Shared components (2 files)
│   ├── error-dashboard.component.ts
│   └── error-modal.component.ts
├── app.component.ts              # Root component
├── app.component.html
├── app.component.css
├── app.module.ts                 # Root module
└── app-routing.module.ts
```

### Environments (frontend/src/environments/)

```
frontend/src/environments/
├── environment.ts
└── environment.prod.ts
```

## Scripts Directory (scripts/)

```
scripts/
├── lib/                          # Script utilities (2 files)
│   ├── logger.ts
│   └── utils.ts
├── security/                     # Security tools (6 files)
│   ├── advanced-security-scanner.ts
│   ├── code-analysis.ts
│   ├── dependency-scan.ts
│   ├── enhanced-security-audit.ts
│   ├── security-build-pipeline.ts
│   └── security-build.ts
├── build.ts                      # Build script
├── dev.ts                        # Development script
├── clean.ts                      # Clean script
├── copy-assets.ts                # Asset copying
├── type-check.ts                 # Type checking
├── check-deps.ts                 # Dependency check
└── build-icons.ts                # Icon building
```

## Test Directory (test/)

```
test/
├── security/                     # Security tests (9 files)
│   ├── security-suite.test.ts
│   ├── main-process-security.test.ts
│   ├── ipc-security.test.ts
│   ├── file-system-security.test.ts
│   ├── network-security.test.ts
│   ├── electron-vulnerabilities.test.ts
│   ├── dependency-security.test.ts
│   ├── csp-validation.test.ts
│   └── comprehensive-security-suite.test.ts
├── unit/                         # Unit tests (1 file)
│   └── basic-security.test.ts
├── setup.ts                      # Test setup
└── README.md
```

## Documentation Directory (docs/)

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
├── troubleshooting.md            # Troubleshooting
├── contributing.md               # Contribution guide
└── api/                          # API reference
    ├── main-process.md
    ├── frontend.md
    ├── shared-types.md
    └── event-types.md
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

### Frontend Configuration

| File | Purpose |
|------|---------|
| frontend/package.json | Frontend dependencies |
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
| docs/ | 18+ files |
| **Total** | **~250 files** |

## Related Documentation

- Overview - Project introduction
- Architecture - System design
- Getting Started - Setup instructions
