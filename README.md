# Electron Angular Rspack Starter

A production-ready, enterprise-grade starter template for building cross-platform desktop applications with Electron, Angular, and Rspack.

## Table of Contents

- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Building and Distribution](#building-and-distribution)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

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

# Start development server
./run.sh dev
```

### Available Commands

```bash
./run.sh dev          # Start development environment
./run.sh build        # Build for production
./run.sh test         # Run all tests
./run.sh clean        # Clean build artifacts
./run.sh reinstall    # Full clean and reinstall
./run.sh check        # Check dependencies
```

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

- Dependency Injection (DI) - Both backend and frontend
- Facade Pattern - Simplified API access
- Event Bus - Cross-process communication
- Errors as Values - Type-safe error handling
- Use Case Pattern - Business logic organization
- Service Registry - Automatic service discovery

## Key Features

### Development Experience

- **Fast Builds**: Rspack provides sub-second build times
- **Hot Module Replacement**: Automatic reloading for frontend and main process
- **Type Safety**: Full TypeScript support across all layers
- **Modern Angular**: Latest Angular with signals and standalone components
- **Fast Linting**: Biome provides 10x faster linting and formatting

### Architecture

- **Clean Separation**: Main process, renderer, and frontend are isolated
- **Dependency Injection**: DI container in both backend and frontend
- **Event Bus**: Type-safe cross-process event communication
- **Service Registry**: Automatic service discovery and registration
- **Feature Modules**: Scalable module structure for large applications

### Security

- **Context Isolation**: Enabled by default for renderer security
- **Sandbox Mode**: Renderer process sandboxing
- **Web Security**: Same-origin policy enforced
- **Type-Safe IPC**: Centralized channel definitions
- **Security Tools**: Built-in audit, scan, and analysis scripts

### Performance

- **Optimized Builds**: Tree-shaking and code splitting
- **Lazy Loading**: Angular modules load on demand
- **Efficient Bundling**: Rspack minimizes bundle size
- **Memory Management**: Proper cleanup and resource disposal

### Error Handling

- **Errors as Values**: Result types instead of exceptions
- **Global Error Handling**: Unified error handling across processes
- **Error Dashboard**: Built-in UI for viewing errors
- **Error Recovery**: Automatic error recovery mechanisms

## Project Structure

```
starter-electron-angular-rspack/
├── src/                          # Electron source code
│   ├── main/                     # Main process (Node.js)
│   │   ├── app/                  # Application orchestration
│   │   ├── di/                   # Dependency injection
│   │   ├── events/               # Event bus system
│   │   ├── errors/               # Error handling
│   │   ├── services/             # Core services
│   │   ├── lib/                  # Utilities
│   │   └── use-cases/            # Business logic
│   ├── renderer/                 # Renderer process
│   │   ├── components/           # UI components
│   │   ├── lib/                  # Renderer utilities
│   │   └── use-cases/            # Renderer use cases
│   ├── shared/                   # Shared code
│   │   ├── errors/               # Error codes and types
│   │   ├── events/               # Event definitions
│   │   ├── ipc/                  # IPC channels
│   │   └── lib/                  # Shared utilities
│   └── preload/                  # Preload script
├── frontend/                     # Angular application
│   ├── src/
│   │   ├── core/                 # Singleton services
│   │   ├── features/             # Feature modules
│   │   ├── models/               # Data models
│   │   ├── viewmodels/           # State management
│   │   └── views/                # Components
│   └── dist/                     # Build output
├── scripts/                      # Build and dev scripts
│   ├── security/                 # Security tools
│   └── lib/                      # Script utilities
├── test/                         # Test files
│   ├── security/                 # Security tests
│   └── unit/                     # Unit tests
├── docs/                         # Documentation
├── config/                       # Runtime configuration
├── dist/                         # Build output (git-ignored)
└── release/                      # Distribution packages (git-ignored)
```

## Documentation

Complete documentation is available in the `docs/` directory:

### Getting Started

- [Overview](docs/overview.md) - Project introduction and key features
- [Architecture](docs/architecture.md) - System architecture and design patterns
- [Project Structure](docs/project-structure.md) - Directory and file organization
- [Getting Started](docs/getting-started.md) - Installation and setup guide

### Development

- [Development Guide](docs/development.md) - Development workflow and best practices
- [Scripts Reference](docs/scripts-reference.md) - All available commands
- [Configuration](docs/configuration.md) - Configuration options
- [Debugging](docs/debugging.md) - Debugging techniques and tools

### Core Concepts

- [Dependency Injection](docs/dependency-injection.md) - DI system guide
- [Event Bus System](docs/event-bus.md) - Cross-process event communication
- [Errors as Values](docs/errors-as-values.md) - Type-safe error handling
- [IPC Communication](docs/ipc-communication.md) - Inter-process communication

### Building and Deployment

- [Building](docs/building.md) - Build process and configuration
- [Distribution](docs/distribution.md) - Packaging and distribution
- [Code Signing](docs/code-signing.md) - Code signing setup
- [Auto Updates](docs/auto-updates.md) - Automatic updates

### Testing

- [Testing Guide](docs/testing.md) - Testing strategies and frameworks
- [Security Testing](docs/security-testing.md) - Security audits and scans
- [Unit Testing](docs/unit-testing.md) - Unit test examples
- [E2E Testing](docs/e2e-testing.md) - End-to-end test examples

### Security

- [Security Overview](docs/security.md) - Security features and best practices
- [Security Audit](docs/security-audit.md) - Running security audits
- [Context Isolation](docs/context-isolation.md) - Context isolation details
- [Sandbox Mode](docs/sandbox-mode.md) - Renderer sandboxing

### Advanced Topics

- [Performance](docs/performance.md) - Performance optimization
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [Migration Guide](docs/migration.md) - Migration from other templates
- [Contributing](docs/contributing.md) - Contribution guidelines

### API Reference

- [Main Process API](docs/api-reference.md#main-process-api) - Main process reference
- [Frontend API](docs/api-reference.md#frontend-api) - Frontend reference
- [Shared Types](docs/api-reference.md#shared-types) - Shared type definitions
- [Event Types](docs/api-reference.md#event-types) - Event definitions

## Development

### Starting Development

```bash
./run.sh dev
```

This command:
1. Installs dependencies if missing
2. Starts Angular dev server with HMR
3. Builds main process with watch mode
4. Launches Electron application

### Code Quality

```bash
# Format code
bun run format

# Run linting
bun run lint

# Type check
bun run type-check

# Run tests
bun run test
```

### Project Configuration

Update application information in `package.json`:

```json
{
  "name": "your-app-name",
  "productName": "Your App Name",
  "version": "1.0.0",
  "author": "Your Name"
}
```

## Building and Distribution

### Production Build

```bash
./run.sh build
```

### Build and Package

```bash
./run.sh dist
```

### Distribution Output

Packages are created in the `release/` directory:
- Linux: AppImage
- macOS: DMG
- Windows: ZIP

## Testing

### Run All Tests

```bash
bun run test
```

### Test Categories

```bash
bun run test:unit        # Unit tests
bun run test:security    # Security tests
bun run test:coverage    # Tests with coverage report
bun run test:watch       # Tests in watch mode
```

### Security Testing

```bash
bun run security:audit   # Security audit
bun run security:scan    # Security scanning
bun run security:analyze # Code analysis
bun run security:ci      # Full security pipeline
```

## Security

This template implements security best practices:

- Context isolation enabled by default
- Sandbox mode for renderer process
- Node.js integration disabled in renderer
- Web security features enabled
- Type-safe IPC with input validation
- Regular security audits and scans

### Security Checklist

- [x] Context isolation enabled
- [x] Sandbox mode enabled
- [x] Node integration disabled
- [x] Web security enabled
- [x] IPC handlers validate input
- [x] Dependencies up to date
- [x] Security audits passing

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

For issues and questions:

1. Check the [Troubleshooting](docs/troubleshooting.md) guide
2. Review the [FAQ](docs/faq.md)
3. Search existing [documentation](docs/)
4. Open an issue on GitHub
