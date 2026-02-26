# Troubleshooting

Common issues, solutions, and debugging tips for Electron Angular Rspack Starter.

## Development Issues

### Dev Server Not Starting

**Problem:** `./run.sh dev` fails to start.

**Possible Causes:**
- Missing dependencies
- Port already in use
- Configuration error

**Solutions:**

```bash
# Check dependencies
./run.sh check

# Clear cache
rm -rf node_modules/.vite
rm -rf frontend/.angular/cache

# Reinstall dependencies
./run.sh reinstall

# Check for port conflicts
lsof -i :4200  # Angular dev server port
lsof -i :5173  # Alternative port
```

### Hot Reload Not Working

**Problem:** Changes do not reflect automatically.

**Possible Causes:**
- HMR not enabled
- File not saved
- Cache issue

**Solutions:**

1. Verify file is saved
2. Check HMR is enabled in configuration
3. Restart dev server:
   ```bash
   ./run.sh dev
   ```
4. Clear Angular cache:
   ```bash
   rm -rf frontend/.angular/cache
   ```

### TypeScript Errors

**Problem:** Build fails with type errors.

**Solutions:**

```bash
# Run type check to see all errors
bun run type-check

# Fix reported errors
# Run strict check for all errors
bun run type-check:strict

# Check TypeScript configuration
cat tsconfig.json
```

### Module Not Found

**Problem:** Cannot find module during development or build.

**Solutions:**

```bash
# Reinstall dependencies
bun install

# Check import paths
# Verify module exists
# Check path aliases in tsconfig.json

# Clear cache and rebuild
./run.sh clean
./run.sh build
```

## Build Issues

### Build Fails

**Problem:** `./run.sh build` fails.

**Solutions:**

```bash
# Run type check
bun run type-check

# Run linting
bun run lint

# Clean build artifacts
./run.sh clean

# Rebuild
./run.sh build

# Check build logs for specific errors
```

### Large Bundle Size

**Problem:** Bundle size too large.

**Solutions:**

1. Analyze bundle:
   ```bash
   webpack-bundle-analyzer dist/stats.json
   ```

2. Check for unused dependencies:
   ```bash
   bun ls
   ```

3. Verify tree-shaking is working:
   ```typescript
   // Use specific imports
   import { ok, err } from '@shared/errors';
   ```

4. Use lazy loading for features:
   ```typescript
   const routes: Routes = [
     {
       path: 'feature',
       loadChildren: () => import('./feature/feature.module')
         .then(m => m.FeatureModule)
     }
   ];
   ```

### Missing Assets

**Problem:** Assets not copied to dist directory.

**Solutions:**

```bash
# Manually copy assets
bun run assets

# Check asset configuration
# Verify asset paths in config
# Check copy-assets.ts script
```

### Source Map Issues

**Problem:** Source maps not working.

**Solutions:**

1. Enable source maps in configuration:
   ```json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

2. Check build configuration:
   ```typescript
   // rspack.config.cjs
   module.exports = {
     devtool: 'source-map',
   };
   ```

## Runtime Issues

### Application Not Starting

**Problem:** Electron window is blank or doesn't open.

**Solutions:**

1. Check console for errors:
   - Open DevTools (Ctrl+Shift+I)
   - Check Console tab

2. Verify frontend build exists:
   ```bash
   ls frontend/dist/browser/
   ```

3. Check main.cjs is built:
   ```bash
   ls main.cjs
   ```

4. Verify preload script loads:
   ```typescript
   // Check for preload errors in main process logs
   ```

### Window Not Showing

**Problem:** Window does not appear.

**Solutions:**

```typescript
// Ensure show is handled properly
const window = new BrowserWindow({
  show: false,
});

window.loadURL(appUrl);

window.once('ready-to-show', () => {
  window.show();
});
```

### IPC Not Working

**Problem:** IPC calls fail or timeout.

**Solutions:**

1. Verify channel names match:
   ```typescript
   // Check IPC_CHANNELS constants
   import { IPC_CHANNELS } from '@shared/ipc';
   ```

2. Check handler is registered:
   ```typescript
   // Verify handler registration in main process
   ipcMain.handle(IPC_CHANNELS.LOG.WRITE, handler);
   ```

3. Verify preload exposes API:
   ```typescript
   // Check preload script
   contextBridge.exposeInMainWorld('electronAPI', {...});
   ```

4. Check contextBridge setup:
   ```typescript
   // Verify context isolation is enabled
   webPreferences: {
     contextIsolation: true,
   }
   ```

### Application Crashes

**Problem:** Application crashes on startup or during use.

**Solutions:**

1. Check main process logs:
   ```bash
   # Run with verbose logging
   bun run dev:verbose
   ```

2. Check for unhandled errors:
   ```typescript
   // Add error handlers
   process.on('uncaughtException', (error) => {
     console.error('Uncaught exception:', error);
   });
   
   process.on('unhandledRejection', (reason) => {
     console.error('Unhandled rejection:', reason);
   });
   ```

3. Use debugger:
   ```bash
   # Start with debugger
   node --inspect-brk main.cjs
   ```

## Frontend Issues

### Angular Not Loading

**Problem:** Angular application does not bootstrap.

**Solutions:**

1. Check console for errors:
   - Open DevTools
   - Check Console tab for bootstrap errors

2. Verify main.ts is correct:
   ```typescript
   import { bootstrapApplication } from '@angular/platform-browser';
   import { AppComponent } from './app.component';
   
   bootstrapApplication(AppComponent)
     .catch(err => console.error(err));
   ```

3. Check app.module.ts imports:
   ```typescript
   @NgModule({
     imports: [
       BrowserModule,
       // Other required modules
     ],
   })
   export class AppModule {}
   ```

4. Verify zone.js is loaded:
   ```typescript
   // main.ts should import zone.js
   import 'zone.js';
   ```

### Change Detection Issues

**Problem:** UI does not update when data changes.

**Solutions:**

1. Use signals for reactivity:
   ```typescript
   data = signal<Data[]>([]);
   
   // Update data
   this.data.set(newData);
   ```

2. Trigger change detection if needed:
   ```typescript
   constructor(private cdr: ChangeDetectorRef) {}
   
   updateData() {
     this.data = newData;
     this.cdr.detectChanges();
   }
   ```

3. Check OnPush strategy:
   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush,
   })
   ```

### Component Not Rendering

**Problem:** Component does not appear in UI.

**Solutions:**

1. Check component selector:
   ```typescript
   @Component({
     selector: 'app-my-component',
   })
   ```

2. Verify component is declared:
   ```typescript
   @NgModule({
     declarations: [MyComponent],
   })
   ```

3. Check template syntax:
   ```html
   <!-- Verify component tag matches selector -->
   <app-my-component></app-my-component>
   ```

4. Check for template errors:
   - Open DevTools Console
   - Look for template parsing errors

## Dependency Issues

### Dependencies Not Installing

**Problem:** `bun install` fails.

**Solutions:**

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock
bun install

# Try with npm if bun fails
npm install

# Check network connection
# Verify package.json is valid
```

### Version Conflicts

**Problem:** Dependency version conflicts.

**Solutions:**

```bash
# Check for conflicts
bun ls

# Update dependencies
bun run deps:latest

# Resolve conflicts manually
# Check peer dependencies
```

### Package Not Found

**Problem:** Module not found error.

**Solutions:**

```bash
# Install missing package
bun add package-name

# Check package.json
# Verify import path
# Reinstall dependencies
bun install
```

## Performance Issues

### Slow Startup

**Problem:** Application starts slowly.

**Solutions:**

1. Enable lazy loading:
   ```typescript
   const routes: Routes = [
     {
       path: 'feature',
       loadChildren: () => import('./feature/feature.module')
         .then(m => m.FeatureModule)
     }
   ];
   ```

2. Reduce initial bundle:
   - Remove unused dependencies
   - Use tree-shaking
   - Optimize imports

3. Optimize images/assets:
   - Compress images
   - Use modern formats
   - Lazy load non-critical assets

### High Memory Usage

**Problem:** Application uses too much memory.

**Solutions:**

1. Check for memory leaks:
   - Use DevTools Memory tab
   - Take heap snapshots
   - Identify growing objects

2. Clean up subscriptions:
   ```typescript
   ngOnDestroy() {
     this.unsubscribe.forEach(fn => fn());
   }
   ```

3. Release unused resources:
   ```typescript
   // Clear caches
   this.cache.clear();
   
   // Close windows
   window.close();
   ```

4. Use memory profiler:
   - Open DevTools > Memory tab
   - Take heap snapshot
   - Analyze memory usage

## Security Issues

### Context Isolation Warning

**Problem:** Security warning about context isolation.

**Solutions:**

```typescript
// Ensure contextIsolation is true
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  }
});
```

### CSP Violations

**Problem:** Content Security Policy violations.

**Solutions:**

1. Review CSP configuration:
   ```typescript
   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
     callback({
       responseHeaders: {
         ...details.responseHeaders,
         'Content-Security-Policy': [
           "default-src 'self'",
           // Add allowed sources
         ].join('; ')
       }
     });
   });
   ```

2. Update CSP to allow required resources
3. Fix code to comply with CSP

## Debugging Tips

### Enable Verbose Logging

```bash
# Run with verbose logging
bun run dev:verbose

# Enable debug mode
DEBUG=true bun run dev
```

### Use DevTools

1. **Open DevTools:**
   - Ctrl+Shift+I (Windows/Linux)
   - Cmd+Option+I (macOS)

2. **Console Tab:**
   - View logs and errors
   - Execute commands

3. **Network Tab:**
   - Monitor IPC messages
   - Check HTTP requests

4. **Performance Tab:**
   - Profile performance
   - Identify bottlenecks

5. **Memory Tab:**
   - Take heap snapshots
   - Identify memory leaks

### Use Logger Service

```typescript
import { getLogger } from '@main/lib/logger';

const logger = getLogger('my-service');
logger.info('Operation started', { id: '123' });
logger.error('Operation failed', error);
```

### Add Breakpoints

```typescript
// Add debugger statement
function myFunction() {
  debugger; // Execution pauses here
  // ... code
}
```

## Getting Help

### Resources

1. **Documentation:**
   - Check [documentation index](index.md)
   - Search for specific topics

2. **Logs:**
   - Check console output
   - Review error messages
   - Enable verbose logging

3. **Code:**
   - Review source code
   - Check type definitions
   - Examine examples

### Support Channels

1. **GitHub Issues:**
   - Search existing issues
   - Create new issue with details

2. **Documentation:**
   - Review troubleshooting guide
   - Check FAQ
   - Read API reference

3. **Community:**
   - Ask in discussions
   - Share solutions
   - Contribute fixes

### Reporting Issues

When reporting issues, include:

1. **Description:**
   - Clear problem description
   - Expected behavior
   - Actual behavior

2. **Steps to Reproduce:**
   - Detailed reproduction steps
   - Code examples
   - Configuration details

3. **Environment:**
   - Operating system
   - Node.js version
   - Bun/npm version
   - Package versions

4. **Logs:**
   - Error messages
   - Console output
   - Stack traces

## Related Documentation

- [Development Guide](development.md) - Development workflow
- [Building](building.md) - Build process
- [Security](security.md) - Security features
- [Performance](performance.md) - Performance optimization
