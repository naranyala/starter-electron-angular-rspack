# Troubleshooting

Common issues and solutions.

## Development Issues

### Dev Server Not Starting

**Problem:** `./run.sh dev` fails to start

**Solution:**
```bash
# Check dependencies
./run.sh check

# Clear cache
rm -rf node_modules/.vite
rm -rf frontend/.angular/cache

# Reinstall dependencies
bun install
```

### Hot Reload Not Working

**Problem:** Changes do not reflect automatically

**Solution:**
1. Check file is saved
2. Verify HMR is enabled in config
3. Restart dev server

### TypeScript Errors

**Problem:** Build fails with type errors

**Solution:**
```bash
# Run type check
bun run type-check

# Fix reported errors
# Run strict check
bun run type-check:strict
```

## Build Issues

### Build Fails

**Problem:** `./run.sh build` fails

**Solution:**
```bash
# Clean build artifacts
./run.sh clean

# Run linting
bun run lint

# Run type check
bun run type-check

# Rebuild
./run.sh build
```

### Large Bundle Size

**Problem:** Bundle size too large

**Solution:**
1. Check for unused dependencies
2. Verify tree-shaking is working
3. Use lazy loading for features
4. Analyze bundle with webpack-bundle-analyzer

### Missing Assets

**Problem:** Assets not copied to dist

**Solution:**
```bash
# Manually copy assets
bun run assets
```

## Runtime Issues

### Application Not Starting

**Problem:** Electron window is blank

**Solution:**
1. Check console for errors
2. Verify frontend build exists
3. Check main.cjs is built
4. Verify preload script loads

### IPC Not Working

**Problem:** IPC calls fail or timeout

**Solution:**
1. Verify channel names match
2. Check handler is registered
3. Verify preload exposes API
4. Check contextBridge setup

### Window Not Showing

**Problem:** Window does not appear

**Solution:**
```typescript
// Ensure show is handled
const window = new BrowserWindow({
  show: false,
});

window.once('ready-to-show', () => {
  window.show();
});
```

## Frontend Issues

### Angular Not Loading

**Problem:** Angular app does not bootstrap

**Solution:**
1. Check console for errors
2. Verify main.ts is correct
3. Check app.module.ts imports
4. Verify zone.js is loaded

### Change Detection Issues

**Problem:** UI does not update

**Solution:**
1. Use signals for reactivity
2. Trigger change detection if needed
3. Check OnPush strategy

## Dependency Issues

### Module Not Found

**Problem:** Cannot find module

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules bun.lock
bun install

# Check import paths
# Verify module exists
```

### Version Conflicts

**Problem:** Dependency version conflicts

**Solution:**
```bash
# Update dependencies
bun run deps:latest

# Check for conflicts
bun ls
```

## Performance Issues

### Slow Startup

**Problem:** Application starts slowly

**Solution:**
1. Enable lazy loading
2. Reduce initial bundle
3. Optimize images/assets
4. Use production build

### High Memory Usage

**Problem:** Application uses too much memory

**Solution:**
1. Check for memory leaks
2. Clean up subscriptions
3. Release unused resources
4. Use DevTools memory profiler

## Security Issues

### Context Isolation Warning

**Problem:** Security warning about context isolation

**Solution:**
```typescript
// Ensure contextIsolation is true
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
  }
});
```

## Getting Help

If issues persist:

1. Check documentation
2. Search existing issues
3. Review error messages carefully
4. Enable verbose logging
5. Open a GitHub issue

## Related Documentation

- Development - Development guide
- Building - Build process
- Security - Security features
