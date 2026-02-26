# Scripts Reference

Complete reference for all available npm/bun scripts and commands in Electron Angular Rspack Starter.

## Run Script

The `./run.sh` script is the primary interface for common project commands.

### Basic Usage

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

### Command Descriptions

| Command | Description |
|---------|-------------|
| `dev` | Start development environment with HMR |
| `build` | Build application for production |
| `test` | Run all tests |
| `clean` | Clean build artifacts |
| `reinstall` | Remove all node_modules and reinstall |
| `check` | Check dependencies only |
| `help` | Show help message |

## Development Scripts

### Start Development

```bash
./run.sh dev
```

Starts the complete development environment:
- Angular dev server with HMR
- Main process build with watch mode
- Electron application launch

### Verbose Development

```bash
bun run dev:verbose
```

Development mode with verbose logging for debugging.

### Electron Dev Mode

```bash
bun run electron-dev
```

Start Electron in development mode directly.

## Build Scripts

### Full Production Build

```bash
./run.sh build
```

Complete production build:
1. Build Angular frontend
2. Build main process with Rspack
3. Copy assets to dist

### Build with Type Check

```bash
bun run build:check
```

Production build with TypeScript type checking.

### Verbose Build

```bash
bun run build:verbose
```

Build with verbose output for debugging.

### Build Frontend Only

```bash
bun run build:frontend
```

Build only the Angular frontend.

### Build Main Process Only

```bash
bun run build:main
```

Build only the Electron main process using Rspack.

## Test Scripts

### Run All Tests

```bash
bun run test
```

Run all test suites.

### Unit Tests

```bash
bun run test:unit
```

Run unit tests only.

### Security Tests

```bash
bun run test:security
```

Run security test suite.

### Test with Coverage

```bash
bun run test:coverage
```

Run tests and generate coverage report.

### Watch Mode

```bash
bun run test:watch
```

Run tests in watch mode (re-run on changes).

### Test with UI

```bash
bun run test:ui
```

Run tests with interactive UI.

## Code Quality Scripts

### Format Code

```bash
bun run format
```

Format all code using Biome.

### Check Formatting

```bash
bun run format-check
```

Check formatting without making changes.

### Run Linting

```bash
bun run lint
```

Run Biome linting and fix issues.

### Check Linting

```bash
bun run lint-check
```

Check linting without fixing issues.

### Type Check

```bash
bun run type-check
```

Run TypeScript type checking.

### Strict Type Check

```bash
bun run type-check:strict
```

Run strict TypeScript type checking (all errors).

## Security Scripts

### Security Audit

```bash
bun run security:audit
```

Run security audit to check for vulnerabilities.

### Security Scan

```bash
bun run security:scan
```

Scan codebase for security issues.

### Code Analysis

```bash
bun run security:analyze
```

Analyze code for security patterns.

### All Security Checks

```bash
bun run security:all
```

Run all security checks (audit + scan + analyze).

### CI Security Pipeline

```bash
bun run security:ci
```

Full security pipeline for CI/CD:
1. Security build
2. Security audit
3. Security scan
4. Security tests

### Verify Security

```bash
bun run security:verify
```

Verify security configuration.

## Utility Scripts

### Clean Build Artifacts

```bash
./run.sh clean
```

Remove all build artifacts:
- dist/
- main.cjs
- main.cjs.map
- release/
- frontend/dist/
- frontend/.angular/cache/
- coverage/

### Dry Run Clean

```bash
bun run clean:dry
```

Preview what would be cleaned without actually deleting.

### Copy Assets

```bash
bun run assets
```

Copy assets to build directory.

### Build Icons

```bash
bun run icons
```

Build application icons.

### Check Dependencies

```bash
./run.sh check
```

Check if all dependencies are installed.

### Update Dependencies

```bash
bun run deps:latest
```

Update dependencies to latest versions.

## Distribution Scripts

### Package Application

```bash
bun run electron-pack
```

Package application without creating installer.

### Build Distributable

```bash
bun run electron-dist
```

Build distributable application.

### Full Distribution

```bash
./run.sh dist
```

Complete build and distribution:
1. Build application
2. Package for distribution
3. Create installers

Output: `release/` directory

## Frontend Scripts

Navigate to frontend directory first:

```bash
cd frontend
```

### Angular CLI

```bash
bun run ng           # Run Angular CLI commands
bun run start        # Start Angular dev server
bun run build        # Build frontend
bun run serve        # Serve frontend
```

### Rspack Frontend

```bash
bun run build:rspack   # Build with Rspack
bun run serve:rspack   # Serve with Rspack
bun run dev            # Development mode
```

### Testing

```bash
bun run test         # Run tests
bun run test:watch   # Watch mode
bun run e2e          # End-to-end tests
```

### Code Quality

```bash
bun run lint         # Run Biome linting
bun run lint:fix     # Fix linting issues
bun run lint:ci      # CI linting
bun run lint:staged  # Lint staged files
bun run format       # Format code
bun run format:fix   # Fix formatting
bun run check        # Check code
bun run check:fix    # Fix code issues
```

## Script Categories

### Daily Development

Commands used during daily development:

```bash
./run.sh dev          # Start development
bun run format        # Format code
bun run lint          # Fix linting issues
bun run test          # Run tests
```

### Pre-commit Checklist

Commands to run before committing:

```bash
bun run format-check  # Check formatting
bun run lint-check    # Check linting
bun run type-check    # Type check
bun run test:unit     # Unit tests
```

### Build and Release

Commands for building and releasing:

```bash
./run.sh build:check  # Build with checks
bun run test          # Run all tests
bun run security:all  # Security checks
./run.sh dist         # Build distribution
```

### Maintenance

Commands for project maintenance:

```bash
./run.sh clean        # Clean artifacts
./run.sh reinstall    # Reinstall dependencies
bun run deps:latest   # Update dependencies
bun run check-deps    # Check dependencies
```

## Environment Variables

### Set Environment

Some scripts support environment variables:

```bash
DEBUG=true bun run dev
VERBOSE=true bun run build
```

## Script Configuration

### Package.json Scripts

Scripts are defined in `package.json`:

```json
{
  "scripts": {
    "dev": "npx tsx scripts/dev.ts",
    "build": "npx tsx scripts/build.ts",
    "test": "bun test test/security/",
    "lint": "bunx @biomejs/biome check --write ."
  }
}
```

### Frontend Package.json

Frontend scripts in `frontend/package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "dev": "bun run rspack serve",
    "lint": "biome check --config-path ../biome.json"
  }
}
```

## Command Aliases

Create shell aliases for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dev='./run.sh dev'
alias build='./run.sh build'
alias test='bun run test'
alias lint='bun run lint'
alias format='bun run format'
```

## Troubleshooting Scripts

### Dependencies Issues

```bash
./run.sh check        # Check dependencies
./run.sh reinstall    # Full reinstall
bun run deps:latest   # Update dependencies
```

### Build Issues

```bash
./run.sh clean        # Clean artifacts
bun run build:check   # Build with type check
bun run type-check    # Type check only
```

### Test Issues

```bash
bun run test:unit     # Run unit tests
bun run test:security # Run security tests
bun run test:coverage # Run with coverage
```

## Related Documentation

- [Development Guide](development.md) - Development workflow
- [Building](building.md) - Build process
- [Testing](testing.md) - Testing guide
