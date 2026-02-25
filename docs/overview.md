# Overview

Electron Angular Rspack Starter is a production-ready, enterprise-grade starter template for building cross-platform desktop applications with Electron, Angular, and Rspack.

## What This Template Provides

This starter template eliminates the complexity of setting up Electron with Angular by providing a pre-configured, optimized, and production-ready environment.

### Key Benefits

- Fast Development: Rspack provides build times up to 10x faster than traditional webpack
- Type Safety: Full TypeScript support across main process, renderer, and frontend
- Modern Angular: Latest Angular with standalone components and signals
- Security First: Context isolation, sandbox mode, and security audit tools built-in
- Scalable Architecture: Clean separation of concerns with dependency injection
- Production Ready: Optimized builds, code signing support, and auto-update ready

## Technology Stack

### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| Electron | Desktop application framework | Latest |
| Angular | Frontend framework | Latest |
| Rspack | Build tool and bundler | Latest |
| TypeScript | Programming language | Latest |
| Bun | Package manager and runtime | Latest |

### Additional Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting and formatting (10x faster than ESLint + Prettier) |
| Electron Builder | Application packaging and distribution |
| Zone.js | Change detection for Angular |

## Features

### Development Experience

- Hot module replacement for both main and renderer processes
- TypeScript with strict mode enabled
- Fast linting and formatting with Biome
- Bun runtime for faster script execution
- Comprehensive development scripts

### Architecture

- Dependency injection system for both backend and frontend
- Facade pattern for simplified API access
- Service registry for automatic service discovery
- Event bus system for cross-process communication
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

## Use Cases

This template is suitable for:

- Enterprise Desktop Applications: Secure, maintainable business applications
- Developer Tools: IDEs, debuggers, and development utilities
- Productivity Apps: Note-taking, task management, and collaboration tools
- Data Visualization: Dashboards, analytics, and reporting tools
- Cross-Platform Tools: Applications that need to run on Windows, macOS, and Linux

## What Is Included

### Backend (Electron Main Process)

- Window management service
- IPC handler service
- Logging service
- Event bus system
- Dependency injection container
- Service registry
- Use case pattern implementation
- Error handling utilities

### Frontend (Angular)

- Core services (singleton)
- Feature module structure
- ViewModels for state management
- Error handling service
- Event bus facade
- Window management facade
- Search service
- Plugin system

### Shared Code

- IPC channel definitions
- Event type definitions
- Error codes and Result types
- Utility functions
- Type definitions

### Tooling

- Build scripts
- Development server scripts
- Security scanning tools
- Type checking scripts
- Asset management scripts
- Icon building scripts

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd starter-electron-angular-rspack

# Install dependencies
bun install
cd frontend && bun install && cd ..

# Run
./run.sh dev
```

## Documentation Structure

The documentation is organized into the following sections:

- Getting Started: Overview, architecture, project structure, setup
- Development: Development guide, scripts, configuration, debugging
- Core Concepts: DI, event bus, errors as values, IPC
- Building and Deployment: Building, distribution, code signing, auto updates
- Testing: Testing guide, security testing, unit testing, E2E testing
- Security: Security overview, audit, context isolation, sandbox mode
- Advanced Topics: Performance, troubleshooting, migration, contributing
- API Reference: Main process, frontend, shared types, event types

## Next Steps

After reading this overview:

1. Review the Architecture document to understand the system design
2. Check the Project Structure for file organization
3. Follow the Getting Started guide to set up your environment
4. Read the Development Guide to start building

## Support

For issues and questions:

1. Check the Troubleshooting guide
2. Review the FAQ
3. Search existing documentation
4. Open an issue on GitHub

## License

MIT License - See LICENSE file for details.
