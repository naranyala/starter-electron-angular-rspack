# Building

Complete guide to the build process, configuration, and optimization for Electron Angular Rspack Starter.

## Build Commands

### Quick Build

```bash
./run.sh build
```

This runs the complete production build:
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

Build with detailed output for debugging.

### Build Frontend Only

```bash
bun run build:frontend
```

Build only the Angular frontend.

### Build Main Process Only

```bash
bun run build:main
```

Build only the Electron main process.

## Build Process

### Step 1: Build Frontend

Angular CLI compiles the frontend application:

```bash
cd frontend
ng build --configuration=production
```

**Output:**
- `frontend/dist/browser/` - Frontend build output
- `frontend/dist/server/` - Server bundle (if SSR enabled)

**Configuration:**
- AOT compilation
- Tree-shaking
- Bundle optimization
- CSS minification

### Step 2: Build Main Process

Rspack bundles the main process:

```bash
rspack build
```

**Configuration:**
- Entry: `src/main/index.ts`
- Output: `main.cjs`
- Target: Node.js
- Format: CommonJS

**Output:**
- `main.cjs` - Main process bundle
- `main.cjs.map` - Source maps

### Step 3: Copy Assets

Assets are copied to the dist directory:

```bash
bun run assets
```

**Copied:**
- Icons
- Images
- Configuration files
- Other static assets

## Build Configuration

### Rspack Configuration

Configured in `rspack.config.cjs`:

```typescript
const path = require('path');
const rspack = require('@rspack/core');

module.exports = {
  mode: 'production',
  entry: './src/main/index.ts',
  output: {
    filename: 'main.cjs',
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@main': path.resolve(__dirname, 'src/main'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    treeShaking: true,
  },
};
```

### Angular Configuration

Configured in `frontend/angular.json`:

```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:application",
    "options": {
      "outputPath": "dist",
      "browser": "src/main.ts",
      "tsConfig": "tsconfig.app.json",
      "optimization": true,
      "sourceMap": false,
      "extractLicenses": true,
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "2mb",
          "maximumError": "5mb"
        }
      ]
    },
    "configurations": {
      "production": {
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.prod.ts"
          }
        ],
        "optimization": true,
        "outputHashing": "all"
      },
      "development": {
        "optimization": false,
        "extractLicenses": false,
        "sourceMap": true
      }
    }
  }
}
```

### TypeScript Configuration

Main process TypeScript config (`tsconfig.main.json`):

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "frontend"]
}
```

## Build Output

### Directory Structure

```
project-root/
├── dist/                       # Build output directory
│   └── browser/                # Frontend build
│       ├── index.html
│       ├── main-*.js           # Main bundle
│       ├── polyfills-*.js      # Polyfills
│       ├── styles-*.css        # Styles
│       └── [assets]
├── main.cjs                    # Main process bundle
├── main.cjs.map                # Source maps
└── release/                    # Distribution packages (after packaging)
```

### Bundle Analysis

Analyze bundle size:

```bash
# Install webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer

# Analyze after build
webpack-bundle-analyzer dist/stats.json
```

## Optimization

### Tree Shaking

Unused code is automatically removed:

```typescript
// Only used exports are included
import { ok, err } from '@shared/errors';
// Unused exports are tree-shaken
```

### Code Splitting

Angular lazy loads feature modules:

```typescript
const routes: Routes = [
  {
    path: 'features',
    loadChildren: () => import('./features/features.module')
      .then(m => m.FeaturesModule)
  }
];
```

### Minification

Code is minified in production:

```json
{
  "optimization": {
    "minimize": true,
    "minimizer": ["..."]
  }
}
```

### Bundle Size Optimization

**Strategies:**

1. Remove unused dependencies
2. Use lazy loading
3. Optimize imports
4. Compress assets
5. Use modern image formats

**Check Bundle Size:**

```bash
# After build, check sizes
du -sh dist/browser/*
```

## Build Environments

### Development Build

```bash
./run.sh dev
```

- Source maps enabled
- No minification
- Fast builds
- HMR enabled

### Production Build

```bash
./run.sh build
```

- Full optimization
- Minification enabled
- Source maps optional
- Tree-shaking enabled

### Staging Build

```bash
ng build --configuration=staging
```

- Production-like settings
- Different API endpoints
- Debug symbols enabled

## Build Verification

### Type Check

```bash
bun run type-check
```

Verify TypeScript types.

### Strict Type Check

```bash
bun run type-check:strict
```

Strict type checking with all errors.

### Lint Check

```bash
bun run lint-check
```

Verify code style.

### Test Before Build

```bash
bun run test
```

Run tests before building.

## Troubleshooting

### Build Fails

**Problem:** Build fails with errors.

**Solution:**

```bash
# Run type check
bun run type-check

# Run linting
bun run lint

# Clean and rebuild
./run.sh clean
./run.sh build
```

### Large Bundle Size

**Problem:** Bundle size too large.

**Solution:**

1. Check for unused dependencies
2. Verify tree-shaking is working
3. Use lazy loading for features
4. Optimize imports
5. Analyze bundle with webpack-bundle-analyzer

### Missing Assets

**Problem:** Assets not copied to dist.

**Solution:**

```bash
# Manually copy assets
bun run assets

# Check asset configuration
# Verify asset paths in config
```

### Build Slow

**Problem:** Build takes too long.

**Solution:**

1. Use Rspack (faster than webpack)
2. Enable incremental builds
3. Use build cache
4. Optimize TypeScript config
5. Reduce bundle size

### Module Not Found

**Problem:** Cannot find module during build.

**Solution:**

```bash
# Check import paths
# Verify module exists
# Reinstall dependencies
bun install
```

### TypeScript Errors

**Problem:** Type errors during build.

**Solution:**

```bash
# Run type check to see all errors
bun run type-check

# Fix reported errors
# Run strict check
bun run type-check:strict
```

## Continuous Integration

### CI Build Script

```yaml
# Example GitHub Actions
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: cd frontend && bun install
      - run: ./run.sh build
      - run: bun run test
      - run: bun run security:all
```

### Build Matrix

Test on multiple platforms:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
```

## Performance Tips

### Optimize Build Time

1. Use Rspack instead of webpack
2. Enable incremental compilation
3. Use build cache
4. Parallelize builds
5. Use faster hardware

### Optimize Bundle Size

1. Remove unused code
2. Use lazy loading
3. Optimize dependencies
4. Compress assets
5. Use modern formats

### Optimize Runtime

1. Enable production mode
2. Use AOT compilation
3. Optimize change detection
4. Lazy load features
5. Preload critical resources

## Related Documentation

- [Distribution](distribution.md) - Packaging and distribution
- [Scripts Reference](scripts-reference.md) - Build commands
- [Performance](performance.md) - Performance optimization
