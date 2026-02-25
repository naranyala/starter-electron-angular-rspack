# Building

Build process and configuration guide.

## Build Commands

### Production Build

```bash
./run.sh build
```

### Build with Type Check

```bash
bun run build:check
```

### Build Frontend Only

```bash
bun run build:frontend
```

### Build Main Process Only

```bash
bun run build:main
```

## Build Process

### Step 1: Build Frontend

Angular CLI compiles the frontend:

```bash
cd frontend
ng build --configuration=production
```

Output: `frontend/dist/browser/`

### Step 2: Build Main Process

Rspack bundles the main process:

```bash
rspack build
```

Output: `main.cjs`

### Step 3: Copy Assets

Assets are copied to dist:

```bash
bun run assets
```

## Build Configuration

### Rspack Config

Configured in `rspack.config.cjs`:

```typescript
{
  mode: 'production',
  entry: './src/main/index.ts',
  output: {
    filename: 'main.cjs',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
}
```

### Angular Config

Configured in `frontend/angular.json`:

```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:application",
    "options": {
      "outputPath": "dist",
      "browser": "src/main.ts",
    }
  }
}
```

## Build Output

```
dist/
├── browser/          # Frontend build
└── [assets]          # Copied assets

main.cjs              # Main process bundle
main.cjs.map          # Source maps
```

## Optimization

### Tree Shaking

Unused code is automatically removed.

### Code Splitting

Angular lazy loads feature modules.

### Minification

Code is minified in production builds.

## Troubleshooting

### Build Fails

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

1. Check for unused dependencies
2. Verify tree-shaking is working
3. Use lazy loading for features

## Related Documentation

- Distribution - Packaging
- Scripts Reference - Build commands
