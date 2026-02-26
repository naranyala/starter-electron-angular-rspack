# Project Overview

Electron Angular Rspack Starter is a production-ready, enterprise-grade starter template for building cross-platform desktop applications with Electron, Angular, and Rspack.

## What Is This Template

This starter template eliminates the complexity of setting up Electron with Angular by providing a pre-configured, optimized, and production-ready environment. It combines modern web technologies with desktop application capabilities.

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Electron | Latest | Cross-platform desktop application framework |
| Angular | 21.x | Frontend framework with signals and standalone components |
| Rspack | 1.7.x | Fast Rust-based bundler for main process |
| TypeScript | 5.9.x | Type-safe JavaScript superset |
| Bun | Latest | Fast JavaScript runtime and package manager |

### Development Tools

| Tool | Purpose |
|------|---------|
| Biome | Ultra-fast linter and formatter (10x faster than ESLint + Prettier) |
| Electron Builder | Application packaging and distribution |
| Zone.js | Change detection for Angular |
| WinBox | Window management library |

### Architecture Patterns

- **Dependency Injection (DI)** - Both backend and frontend use DI for modularity
- **Facade Pattern** - Simplified API access for complex operations
- **Event Bus** - Cross-process communication system
- **Errors as Values** - Type-safe error handling without exceptions
- **Use Case Pattern** - Business logic organization
- **Service Registry** - Automatic service discovery

## Key Features

### Development Experience

**Fast Builds**
- Rspack provides sub-second build times
- Incremental compilation with efficient caching
- Up to 10x faster than traditional webpack

**Hot Module Replacement**
- Automatic reloading for frontend code
- Main process rebuilds on changes
- Preserves application state during updates

**Type Safety**
- Full TypeScript support across all layers
- Strict mode enabled
- Type-safe IPC communication
- Shared type definitions

**Modern Angular**
- Angular 21 with latest features
- Signals for reactive state management
- Standalone components
- Lazy-loaded feature modules

**Fast Code Quality Tools**
- Biome for linting and formatting
- 10x faster than ESLint + Prettier
- Pre-configured rules

### Architecture

**Clean Separation**
- Main process (Node.js) - Application lifecycle, native APIs
- Renderer process - Secure UI rendering
- Frontend (Angular) - Full-featured UI layer
- Shared code - Common types and utilities

**Dependency Injection**
- DI container in main process
- Angular DI in frontend
- Service registry for automatic discovery
- Scoped and singleton services

**Event Bus System**
- Cross-process event communication
- Type-safe event channels
- Publish/subscribe pattern
- Built-in events for common operations

**Service Registry**
- Automatic service registration
- Service discovery by token
- Lazy service initialization

**Feature Modules**
- Scalable module structure
- Lazy loading support
- Independent feature development

### Security

**Context Isolation**
- Enabled by default
- Renderer runs in isolated context
- No direct Node.js access from renderer

**Sandbox Mode**
- Renderer process sandboxed
- Limited renderer capabilities
- Enhanced security boundaries

**Web Security**
- Same-origin policy enforced
- Web security features enabled
- CSP ready

**Type-Safe IPC**
- Centralized channel definitions
- Input validation in handlers
- Type contracts for all messages

**Security Tools**
- Security audit scripts
- Dependency vulnerability scanning
- Code analysis tools
- Automated security pipeline

### Performance

**Optimized Builds**
- Tree-shaking removes unused code
- Code splitting for better loading
- Minification in production

**Lazy Loading**
- Angular modules load on demand
- Features load when needed
- Reduced initial bundle size

**Efficient Bundling**
- Rspack minimizes bundle size
- Smart code splitting
- Asset optimization

**Memory Management**
- Proper cleanup on disposal
- Resource management utilities
- Memory leak prevention

### Error Handling

**Errors as Values**
- Result types instead of exceptions
- Type-safe error handling
- Explicit error states

**Global Error Handling**
- Unified error handling across processes
- Automatic error logging
- Error recovery mechanisms

**Error Dashboard**
- Built-in UI for viewing errors
- Error history and filtering
- Error details and context

**Error Codes**
- Predefined error code enum
- Organized by category
- Easy error identification

## What Is Included

### Backend (Electron Main Process)

**Application Orchestration**
- App facade for simplified API
- Lifecycle management
- Window management service
- Application configuration

**Core Services**
- Logger service with levels
- Window service for management
- IPC handler service
- Event bus service

**Dependency Injection**
- DI container implementation
- Service registry
- Injection tokens
- Scoped resolutions

**Error Handling**
- Error handler service
- Result types (Ok/Err)
- Error codes enum
- Error recovery utilities

**Business Logic**
- Use case pattern implementation
- Base use case classes
- Use case factory
- Automatic IPC registration

**Utilities**
- Lifecycle management
- Window utilities
- File system operations
- Configuration management
- Logging utilities
- Platform detection

### Renderer Process

**UI Components**
- Menu components
- Window generators
- UI utilities

**Renderer Utilities**
- DOM manipulation
- Event handling
- State management
- Storage utilities
- Animation system
- Form utilities
- Accessibility utilities

**Use Cases**
- Window use cases
- Electron API use cases
- Base use case classes

### Frontend (Angular)

**Core Services**
- DI module
- Event bus facade
- Error handling service
- Window facade
- Plugin system
- Global error handler

**Feature Modules**
- Search service
- Extensible feature structure

**State Management**
- ViewModels with signals
- Reactive state
- Computed values

**Views**
- Home component
- Demo components
- DevTools component
- Error dashboard
- Shared components

### Shared Code

**Error Handling**
- Error codes enum
- Result types
- Error utilities

**Event System**
- Event type definitions
- Event channels
- Event payloads

**IPC Communication**
- Channel definitions
- Type contracts
- IPC utilities

**Utilities**
- Array utilities
- Async utilities
- Crypto utilities
- Date utilities
- Form utilities
- Network utilities
- Object utilities
- Search utilities
- String utilities
- Validation utilities
- Platform utilities
- Type utilities

### Tooling

**Build Scripts**
- Development server
- Production build
- Type checking
- Asset management
- Icon building

**Development Scripts**
- Hot reload
- Verbose logging
- Dependency checking
- Code formatting
- Linting

**Security Scripts**
- Security audit
- Security scanning
- Code analysis
- Security pipeline
- Dependency checking

**Test Scripts**
- Unit tests
- Security tests
- Coverage reports
- Watch mode

## Use Cases

This template is suitable for:

**Enterprise Desktop Applications**
- Secure business applications
- Maintainable codebase
- Scalable architecture
- Cross-platform support

**Developer Tools**
- IDEs and editors
- Debuggers and profilers
- Development utilities
- Code generators

**Productivity Apps**
- Note-taking applications
- Task management tools
- Time tracking apps
- Collaboration tools

**Data Visualization**
- Dashboards and analytics
- Reporting tools
- Data exploration apps
- Real-time monitoring

**Cross-Platform Tools**
- Applications for Windows, macOS, Linux
- Consistent UI across platforms
- Native integrations
- Platform-specific features

## Project Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | ~250 |
| Main Process Files | 44 |
| Renderer Files | 40 |
| Shared Files | 31 |
| Frontend Files | 52 |
| Script Files | 15 |
| Test Files | 12 |
| Documentation Files | 32+ |

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- Bun 1.0 or higher (recommended) or npm 9.0+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd starter-electron-angular-rspack

# Install dependencies
bun install
cd frontend && bun install && cd ..

# Start development
./run.sh dev
```

### Available Commands

```bash
./run.sh dev          # Start development environment
./run.sh build        # Build for production
./run.sh test         # Run all tests
./run.sh clean        # Clean build artifacts
./run.sh reinstall    # Full clean and reinstall
```

## Documentation Structure

The documentation is organized into the following sections:

### Getting Started
- [Overview](overview.md) - This document
- [Architecture](architecture.md) - System design
- [Project Structure](project-structure.md) - File organization
- [Getting Started](getting-started.md) - Setup guide

### Development
- [Development Guide](development.md) - Development workflow
- [Scripts Reference](scripts-reference.md) - Available commands
- [Configuration](configuration.md) - Configuration options
- [Debugging](debugging.md) - Debugging techniques

### Core Concepts
- [Dependency Injection](dependency-injection.md) - DI system guide
- [Event Bus System](event-bus.md) - Cross-process events
- [Errors as Values](errors-as-values.md) - Error handling pattern
- [IPC Communication](ipc-communication.md) - Inter-process communication

### Building and Deployment
- [Building](building.md) - Build process
- [Distribution](distribution.md) - Packaging and distribution
- [Code Signing](code-signing.md) - Code signing setup
- [Auto Updates](auto-updates.md) - Automatic updates

### Testing
- [Testing Guide](testing.md) - Testing strategies
- [Security Testing](security-testing.md) - Security audits
- [Unit Testing](unit-testing.md) - Unit tests
- [E2E Testing](e2e-testing.md) - End-to-end tests

### Security
- [Security Overview](security.md) - Security features
- [Security Audit](security-audit.md) - Running audits
- [Context Isolation](context-isolation.md) - Context isolation
- [Sandbox Mode](sandbox-mode.md) - Renderer sandbox

### Advanced Topics
- [Performance](performance.md) - Performance optimization
- [Troubleshooting](troubleshooting.md) - Common issues
- [Migration Guide](migration.md) - Migration from other templates
- [Contributing](contributing.md) - Contribution guidelines

### API Reference
- [API Reference](api-reference.md) - Complete API documentation
- [Main Process API](api-reference.md#main-process-api) - Main process reference
- [Frontend API](api-reference.md#frontend-api) - Frontend reference
- [Shared Types](api-reference.md#shared-types) - Shared type definitions

## Next Steps

After reading this overview:

1. Review the [Architecture](architecture.md) document to understand the system design
2. Check the [Project Structure](project-structure.md) for file organization
3. Follow the [Getting Started](getting-started.md) guide to set up your environment
4. Read the [Development Guide](development.md) to start building

## Support

For issues and questions:

1. Check the [Troubleshooting](troubleshooting.md) guide
2. Review the [FAQ](faq.md)
3. Search existing [documentation](index.md)
4. Open an issue on GitHub

## License

MIT License - See [LICENSE](../LICENSE) file for details.
