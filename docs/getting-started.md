# Getting Started

Installation and setup guide for Electron Angular Rspack Starter.

## Prerequisites

Before installing, ensure you have the following:

- Node.js 18.0 or higher
- Bun 1.0 or higher (recommended) or npm 9.0+
- Git

## Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd starter-electron-angular-rspack
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
bun install

# Install frontend dependencies
cd frontend
bun install
cd ..
```

### Step 3: Verify Installation

```bash
./run.sh check
```

## Development

### Start Development Server

```bash
./run.sh dev
```

This command:
1. Starts the Angular dev server
2. Builds the main process with watch mode
3. Launches the Electron application
4. Enables hot module replacement

### Development Workflow

1. Make changes to your code
2. Changes reload automatically (HMR)
3. View changes in the Electron window

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

## Project Setup

### Update Application Info

Edit `package.json`:

```json
{
  "name": "your-app-name",
  "productName": "Your App Name",
  "version": "1.0.0",
  "author": "Your Name"
}
```

### Update Configuration

Edit `src/main/app/app.config.ts`:

```typescript
export const DEFAULT_CONFIG: AppConfig = {
  name: 'Your App',
  version: '1.0.0',
  environment: 'development',
  // ... other config
};
```

### Update Frontend Config

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  // ... other config
};
```

### Replace Icons

Replace files in `src/assets/`:

- `favicon.ico` - Browser favicon
- `icon.ico` - Windows icon
- `icon.png` - PNG icon
- `icon.svg` - SVG icon
- `logo.svg` - Application logo

## Next Steps

1. Review Project Structure
2. Read Architecture
3. Check Development Guide
4. Start building your features

## Troubleshooting

### Issue: Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install
```

### Issue: Dev server not starting

```bash
# Check dependencies
./run.sh check
```

### Issue: Build fails

```bash
# Run type check
./run.sh check

# Run linting
bun run lint
```

## Additional Resources

- Scripts Reference - All available commands
- Configuration - Configuration options
- Troubleshooting - Common issues
