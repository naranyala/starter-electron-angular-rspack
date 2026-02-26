# Documentation Index

Complete documentation for Electron Angular Rspack Starter.

## Quick Navigation

### New Users

1. [Overview](overview.md) - Understand what this project is
2. [Architecture](architecture.md) - Learn the system design
3. [Getting Started](getting-started.md) - Set up your environment
4. [Development Guide](development.md) - Start building

### Developers

1. [Project Structure](project-structure.md) - File organization
2. [Scripts Reference](scripts-reference.md) - Available commands
3. [Dependency Injection](dependency-injection.md) - DI system
4. [Testing Guide](testing.md) - Write and run tests

### Advanced Users

1. [IPC Communication](ipc-communication.md) - Cross-process communication
2. [Event Bus System](event-bus.md) - Event-driven architecture
3. [Errors as Values](errors-as-values.md) - Error handling pattern
4. [Performance](performance.md) - Optimization techniques

## Documentation Sections

### Introduction

| Document | Description |
|----------|-------------|
| [Overview](overview.md) | Project introduction, key features, and technology stack |
| [Architecture](architecture.md) | System architecture, design patterns, and data flow |
| [Project Structure](project-structure.md) | Directory organization and file conventions |

### Getting Started

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Installation, setup, and first steps |
| [Development Guide](development.md) | Development workflow, code style, and best practices |
| [Scripts Reference](scripts-reference.md) | Complete list of available commands |

### Core Concepts

| Document | Description |
|----------|-------------|
| [Dependency Injection](dependency-injection.md) | DI container, service registration, and usage |
| [Event Bus System](event-bus.md) | Cross-process event communication |
| [Errors as Values](errors-as-values.md) | Type-safe error handling with Result types |
| [IPC Communication](ipc-communication.md) | Inter-process communication patterns and security |

### Building and Deployment

| Document | Description |
|----------|-------------|
| [Building](building.md) | Build process, configuration, and optimization |
| [Distribution](distribution.md) | Packaging, code signing, and distribution |
| [Code Signing](code-signing.md) | Code signing setup for different platforms |
| [Auto Updates](auto-updates.md) | Automatic update implementation |

### Testing

| Document | Description |
|----------|-------------|
| [Testing Guide](testing.md) | Testing strategies, frameworks, and examples |
| [Security Testing](security-testing.md) | Security audits and vulnerability scanning |
| [Unit Testing](unit-testing.md) | Unit test examples and best practices |
| [E2E Testing](e2e-testing.md) | End-to-end test examples |

### Security

| Document | Description |
|----------|-------------|
| [Security Overview](security.md) | Security features and best practices |
| [Security Audit](security-audit.md) | Running security audits |
| [Context Isolation](context-isolation.md) | Context isolation details |
| [Sandbox Mode](sandbox-mode.md) | Renderer sandboxing |

### Advanced Topics

| Document | Description |
|----------|-------------|
| [Performance](performance.md) | Performance optimization techniques |
| [Troubleshooting](troubleshooting.md) | Common issues and solutions |
| [Migration Guide](migration.md) | Migration from other templates |
| [Contributing](contributing.md) | Contribution guidelines |

### API Reference

| Document | Description |
|----------|-------------|
| [API Reference](api-reference.md) | Complete API documentation |
| [Main Process API](api-reference.md#main-process-api) | Main process API reference |
| [Frontend API](api-reference.md#frontend-api) | Frontend API reference |
| [Shared Types](api-reference.md#shared-types) | Shared type definitions |

## Project Overview

### Technology Stack

- **Electron** - Cross-platform desktop application framework
- **Angular 21** - Frontend framework with signals and standalone components
- **Rspack** - Fast Rust-based bundler
- **TypeScript 5.9** - Type-safe JavaScript superset
- **Bun** - Fast JavaScript runtime and package manager
- **Biome** - Ultra-fast linter and formatter

### Key Features

- Fast development with hot module replacement
- Full TypeScript support across all layers
- Dependency injection in backend and frontend
- Event bus for cross-process communication
- Type-safe error handling
- Security-first architecture
- Production-ready build pipeline

### Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | ~250 |
| Main Process Files | 44 |
| Renderer Files | 40 |
| Shared Files | 31 |
| Frontend Files | 52 |
| Script Files | 15 |
| Test Files | 12 |
| Documentation Files | 32+ |

## Quick Reference

### Common Commands

```bash
./run.sh dev          # Start development
./run.sh build        # Build for production
./run.sh test         # Run all tests
./run.sh clean        # Clean build artifacts
./run.sh reinstall    # Full reinstall
```

### Code Quality

```bash
bun run format        # Format code
bun run lint          # Run linting
bun run type-check    # Type check
```

### Security

```bash
bun run security:audit   # Security audit
bun run security:scan    # Security scan
bun run security:ci      # Full security pipeline
```

## File Organization

### Source Code

```
src/
├── main/          # Electron main process
├── renderer/      # Renderer process
├── shared/        # Shared code
└── preload/       # Preload script
```

### Frontend

```
frontend/src/
├── core/          # Singleton services
├── features/      # Feature modules
├── models/        # Data models
├── viewmodels/    # State management
└── views/         # Components
```

### Documentation

```
docs/
├── index.md           # This file
├── overview.md        # Project overview
├── architecture.md    # Architecture
├── getting-started.md # Setup guide
└── ...                # Other documentation
```

## Getting Help

1. **Documentation** - Search this documentation index
2. **Troubleshooting** - Check common issues and solutions
3. **FAQ** - Review frequently asked questions
4. **GitHub Issues** - Search or open new issues

## Documentation Maintenance

### Updating Documentation

When making code changes:

1. Update relevant API documentation
2. Add examples for new features
3. Update configuration references
4. Review troubleshooting section

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add cross-references to related documents
- Keep documentation synchronized with code

## Related Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Angular Documentation](https://angular.dev/)
- [Rspack Documentation](https://rspack.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
