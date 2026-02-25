# Scripts Reference

All available npm/bun scripts for the project.

## Run Script

The `./run.sh` script is the primary way to interact with the project:

```bash
./run.sh              # Show help menu
./run.sh dev          # Start development server
./run.sh build        # Build application
./run.sh test         # Run tests
./run.sh clean        # Clean build artifacts
./run.sh reinstall    # Remove all dependencies and reinstall
./run.sh check        # Check dependencies only
./run.sh help         # Show help message
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `./run.sh dev` | Start development environment |
| `bun run dev:verbose` | Development with verbose logging |
| `bun run electron-dev` | Start Electron in dev mode |

## Build Scripts

| Script | Description |
|--------|-------------|
| `./run.sh build` | Full production build |
| `bun run build:check` | Build with type checking |
| `bun run build:verbose` | Build with verbose output |
| `bun run build:frontend` | Build Angular frontend only |
| `bun run build:main` | Build main process only |

## Test Scripts

| Script | Description |
|--------|-------------|
| `bun run test` | Run all tests |
| `bun run test:unit` | Run unit tests |
| `bun run test:security` | Run security tests |
| `bun run test:coverage` | Run tests with coverage |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:ui` | Run tests with UI |

## Code Quality Scripts

| Script | Description |
|--------|-------------|
| `bun run lint` | Run Biome linting |
| `bun run lint-check` | Check linting without fixing |
| `bun run format` | Format code with Biome |
| `bun run format-check` | Check formatting |
| `bun run type-check` | Run TypeScript type checking |
| `bun run type-check:strict` | Strict type checking |

## Security Scripts

| Script | Description |
|--------|-------------|
| `bun run security:audit` | Run security audit |
| `bun run security:scan` | Run security scanning |
| `bun run security:analyze` | Run code analysis |
| `bun run security:all` | Run all security checks |
| `bun run security:ci` | Full security pipeline for CI |

## Utility Scripts

| Script | Description |
|--------|-------------|
| `./run.sh clean` | Clean build artifacts |
| `./run.sh clean:dry` | Preview what would be cleaned |
| `bun run assets` | Copy assets to build directory |
| `bun run icons` | Build application icons |
| `bun run check-deps` | Check dependencies |
| `bun run deps:latest` | Update dependencies to latest |

## Distribution Scripts

| Script | Description |
|--------|-------------|
| `bun run electron-pack` | Package application |
| `bun run electron-dist` | Build distributable |
| `bun run dist` | Full build and distribution |

## Script Categories

### Daily Development

```bash
./run.sh dev          # Start development
bun run lint          # Fix linting issues
bun run format        # Format code
bun run test          # Run tests
```

### Pre-commit

```bash
bun run lint-check    # Check linting
bun run format-check  # Check formatting
bun run type-check    # Type check
bun run test:unit     # Unit tests
```

### Build and Release

```bash
./run.sh build:check  # Build with checks
bun run test          # Run all tests
bun run security:all  # Security checks
./run.sh dist         # Build distribution
```

## Related Documentation

- Development Guide - Development workflow
- Building - Build process
- Testing - Testing guide
