# Electron Angular Rspack Starter

A production-ready starter template for building cross-platform desktop applications with Electron, Angular, and Rspack.

## Documentation

Complete documentation is available in the docs directory.

### Getting Started

- [Overview](docs/overview.md) - Project introduction and key features
- [Architecture](docs/architecture.md) - System architecture and design
- [Project Structure](docs/project-structure.md) - Directory and file organization
- [Getting Started](docs/getting-started.md) - Installation and setup

### Development

- [Development Guide](docs/development.md) - Development workflow
- [Scripts Reference](docs/scripts-reference.md) - Available commands
- [Configuration](docs/configuration.md) - Configuration options
- [Debugging](docs/debugging.md) - Debugging techniques

### Core Concepts

- [Dependency Injection](docs/dependency-injection.md) - DI system guide
- [Event Bus System](docs/event-bus.md) - Cross-process events
- [Errors as Values](docs/errors-as-values.md) - Error handling pattern
- [IPC Communication](docs/ipc-communication.md) - Inter-process communication

### Building and Deployment

- [Building](docs/building.md) - Build process
- [Distribution](docs/distribution.md) - Packaging and distribution
- [Code Signing](docs/code-signing.md) - Code signing setup
- [Auto Updates](docs/auto-updates.md) - Automatic updates

### Testing

- [Testing Guide](docs/testing.md) - Testing strategies
- [Security Testing](docs/security-testing.md) - Security audits
- [Unit Testing](docs/unit-testing.md) - Unit tests
- [E2E Testing](docs/e2e-testing.md) - End-to-end tests

### Security

- [Security Overview](docs/security.md) - Security features
- [Security Audit](docs/security-audit.md) - Running audits
- [Context Isolation](docs/context-isolation.md) - Context isolation
- [Sandbox Mode](docs/sandbox-mode.md) - Renderer sandbox

### Advanced Topics

- [Performance](docs/performance.md) - Performance optimization
- [Troubleshooting](docs/troubleshooting.md) - Common issues
- [Migration Guide](docs/migration.md) - Migration from other templates
- [Contributing](docs/contributing.md) - Contribution guidelines

### API Reference

- [Main Process API](docs/api/main-process.md) - Main process reference
- [Frontend API](docs/api/frontend.md) - Frontend reference
- [Shared Types](docs/api/shared-types.md) - Shared types
- [Event Types](docs/api/event-types.md) - Event definitions

### Additional Resources

- [FAQ](docs/faq.md) - Frequently asked questions
- [Changelog](docs/changelog.md) - Version history
- [License](LICENSE) - MIT License

## Quick Start

```bash
# Clone
git clone <repository-url>
cd starter-electron-angular-rspack

# Install
bun install
cd frontend && bun install && cd ..

# Run
./run.sh dev
```

## Key Features

- Fast development with Rspack bundler
- Full TypeScript support
- Modern Angular with signals
- Dependency injection system
- Event bus for cross-process communication
- Errors as values pattern
- Security-first architecture
- Production-ready build pipeline

## Technology Stack

- Electron - Desktop application framework
- Angular - Frontend framework
- Rspack - Build tool and bundler
- TypeScript - Programming language
- Bun - Package manager and runtime
- Biome - Linting and formatting

## License

MIT License - See LICENSE file for details.
