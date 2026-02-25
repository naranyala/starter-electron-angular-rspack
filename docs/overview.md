# Electron Vanilla TypeScript Rspack - Documentation

## Overview

This repository provides a complete foundation for building cross-platform desktop applications using web technologies. It prioritizes developer productivity through modern tooling, strict type safety, and a modular architecture that scales from prototypes to enterprise applications.

### Key Features

- **High Performance**: Built with Rspack bundler for 10x faster build times compared to Webpack
- **Type Safety**: Comprehensive TypeScript coverage with strict type checking
- **Modern Architecture**: Clean separation of concerns between main and renderer processes
- **Security First**: Implements Electron security best practices out of the box
- **Developer Experience**: Hot module replacement, advanced debugging, and comprehensive tooling

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Electron 40 | Cross-platform desktop runtime |
| Language | TypeScript 5.9 | Type-safe JavaScript development |
| Bundler | Rspack 1.7 | Ultra-fast module bundling |
| Linting | Biome | Code quality and formatting |
| Package Manager | Bun/NPM | Dependency management |

### Project Structure

```
src/
├── main/                  # Main process (Node.js)
│   ├── components/       # Main process components
│   ├── lib/              # Core utilities
│   ├── ipc/              # IPC handlers
│   ├── use-cases/        # Business logic
│   └── index.ts          # Entry point
├── renderer/              # Renderer process (Browser)
│   ├── components/       # UI components
│   ├── lib/              # Frontend utilities
│   ├── ipc/              # IPC clients
│   ├── use-cases/        # UI business logic
│   └── index.ts          # Entry point
├── preload/               # Preload scripts
│   └── index.ts          # Secure API exposure
└── shared/                # Shared types and utilities
    ├── types/            # TypeScript definitions
    └── lib/              # Shared helpers
```

### Quick Start Commands

- `npm run dev` - Start development with HMR
- `npm run build` - Production build
- `npm run dist` - Create distributable packages
- `npm run lint` - Lint and auto-fix code
- `npm run type-check` - TypeScript validation