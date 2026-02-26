# Getting Started

Installation and setup guide for Electron Angular Rspack Starter.

## Prerequisites

Before installing, ensure you have the following:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.0+ | JavaScript runtime |
| Bun | 1.0+ | Package manager (recommended) |
| Git | Latest | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| npm | Alternative package manager |
| yarn | Alternative package manager |

## Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd starter-electron-angular-rspack
```

### Step 2: Install Dependencies

Install root dependencies:

```bash
bun install
```

Install frontend dependencies:

```bash
cd frontend
bun install
cd ..
```

### Step 3: Verify Installation

Run the dependency check:

```bash
./run.sh check
```

This verifies:
- Backend dependencies are installed
- Frontend dependencies are installed
- All required packages are present

## Development

### Start Development Server

```bash
./run.sh dev
```

This command:
1. Checks and installs dependencies if missing
2. Starts Angular dev server with hot module replacement
3. Builds the main process with watch mode
4. Launches the Electron application
5. Enables automatic reloading on changes

### Development Workflow

1. Make changes to your code
2. Changes reload automatically (HMR)
3. View changes in the Electron window
4. Use DevTools for debugging

### Access DevTools

The application includes built-in DevTools:
- Press `Ctrl+Shift+I` (or `Cmd+Option+I` on macOS)
- Navigate to `/devtools` route
- Use the DevTools component to monitor IPC and events

## Building

### Development Build

```bash
./run.sh build
```

### Production Build

```bash
./run.sh build
```

### Build and Package

```bash
./run.sh dist
```

This creates distributable packages in the `release/` directory.

## Project Setup

### Update Application Information

Edit `package.json`:

```json
{
  "name": "your-app-name",
  "productName": "Your App Name",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Your app description"
}
```

### Update Main Process Configuration

Edit `src/main/app/app.config.ts`:

```typescript
export const DEFAULT_CONFIG: AppConfig = {
  name: 'Your App',
  version: '1.0.0',
  environment: 'development',
  // Add your configuration options
};
```

### Update Frontend Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  logging: {
    level: 'debug',
    enabled: true,
  },
  // Add your environment settings
};
```

For production:

Edit `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  logging: {
    level: 'error',
    enabled: true,
  },
};
```

### Replace Icons and Assets

Replace files in `src/assets/`:

| File | Purpose |
|------|---------|
| favicon.ico | Browser favicon |
| icon.ico | Windows icon |
| icon.png | PNG icon |
| icon.svg | SVG icon |
| logo.svg | Application logo |

### Update Build Configuration

Edit `package.json` for Electron Builder:

```json
{
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "Your App Name",
    "directories": {
      "output": "release"
    }
  }
}
```

## Project Configuration

### Runtime Configuration

Configuration files are stored in the `config/` directory:

```
config/
├── app-config.json       # Application configuration
└── user-settings.json    # User-specific settings
```

### Environment Variables

Create a `.env` file in the project root for environment variables:

```
API_URL=https://api.example.com
DEBUG=true
```

## Code Quality Setup

### Formatting

Format all code:

```bash
bun run format
```

Check formatting:

```bash
bun run format-check
```

### Linting

Run linting:

```bash
bun run lint
```

Check linting:

```bash
bun run lint-check
```

### Type Checking

Run type check:

```bash
bun run type-check
```

Strict type check:

```bash
bun run type-check:strict
```

## Testing Setup

### Run Tests

Run all tests:

```bash
bun run test
```

### Run Specific Test Suites

Unit tests:

```bash
bun run test:unit
```

Security tests:

```bash
bun run test:security
```

### Test Coverage

Generate coverage report:

```bash
bun run test:coverage
```

View HTML report:

```bash
open coverage/index.html
```

## Next Steps

After setup:

1. Review [Project Structure](project-structure.md) for file organization
2. Read [Architecture](architecture.md) to understand system design
3. Check [Development Guide](development.md) for development workflow
4. Start building your features

## Troubleshooting

### Dependencies Not Installing

Clear cache and reinstall:

```bash
./run.sh reinstall
```

Or manually:

```bash
rm -rf node_modules bun.lock
rm -rf frontend/node_modules frontend/bun.lock
bun install
cd frontend && bun install && cd ..
```

### Dev Server Not Starting

Check dependencies:

```bash
./run.sh check
```

Clear Angular cache:

```bash
rm -rf frontend/.angular/cache
```

### Build Fails

Run type check:

```bash
bun run type-check
```

Run linting:

```bash
bun run lint
```

Clean and rebuild:

```bash
./run.sh clean
./run.sh build
```

### Application Window Is Blank

1. Open DevTools to check for errors
2. Verify frontend build exists: `ls frontend/dist/browser/`
3. Verify main.cjs is built: `ls main.cjs`
4. Check console for error messages

### Hot Reload Not Working

1. Ensure file is saved
2. Verify HMR is enabled in configuration
3. Restart dev server: `./run.sh dev`

### TypeScript Errors

Fix reported errors:

```bash
bun run type-check
```

Run strict check for all errors:

```bash
bun run type-check:strict
```

## Additional Resources

- [Scripts Reference](scripts-reference.md) - All available commands
- [Development Guide](development.md) - Development workflow
- [Troubleshooting](troubleshooting.md) - Common issues

## Support

For additional help:

1. Check [Troubleshooting](troubleshooting.md) guide
2. Review [FAQ](faq.md)
3. Search existing [documentation](index.md)
4. Open an issue on GitHub
