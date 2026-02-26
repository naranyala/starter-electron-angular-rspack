# Performance

Performance optimization guide for Electron Angular Rspack Starter.

## Build Performance

### Rspack Optimization

Rspack provides fast builds using Rust-based tooling:

**Benefits:**
- Sub-second build times
- Incremental compilation
- Efficient caching
- Up to 10x faster than webpack

**Configuration:**

```typescript
// rspack.config.cjs
module.exports = {
  mode: 'production',
  entry: './src/main/index.ts',
  output: {
    filename: 'main.cjs',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  optimization: {
    minimize: true,
    treeShaking: true,
  },
};
```

### Angular Optimization

Angular CLI provides built-in optimizations:

**Production Build:**

```bash
ng build --configuration=production
```

**Optimizations:**
- AOT (Ahead-of-Time) compilation
- Tree-shaking
- Bundle optimization
- CSS minification
- File hashing for caching

### Build Time Optimization

**Strategies:**

1. **Use Rspack**
   - Faster than traditional bundlers
   - Rust-based performance
   - Incremental builds

2. **Enable Caching**
   ```typescript
   // rspack.config.cjs
   module.exports = {
     cache: {
       type: 'filesystem',
     },
   };
   ```

3. **Incremental Compilation**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": "./node_modules/.cache/tsbuildinfo.json"
     }
   }
   ```

4. **Exclude Unnecessary Files**
   ```json
   {
     "exclude": [
       "node_modules",
       "dist",
       "coverage",
       "*.spec.ts"
     ]
   }
   ```

## Runtime Performance

### Main Process Optimization

**Strategies:**

1. **Lazy Load Services**
   ```typescript
   @Injectable({ scope: 'transient' })
   export class HeavyService {
     constructor() {
       // Initialize only when needed
     }
   }
   ```

2. **Use Efficient Data Structures**
   ```typescript
   // Use Map for frequent lookups
   const cache = new Map<string, Data>();
   
   // Use Set for uniqueness
   const uniqueIds = new Set<string>();
   ```

3. **Minimize IPC Calls**
   ```typescript
   // Bad: Multiple IPC calls
   for (const item of items) {
     await ipcRenderer.invoke('process:item', item);
   }
   
   // Good: Batch IPC call
   await ipcRenderer.invoke('process:items', items);
   ```

4. **Cache Frequently Used Data**
   ```typescript
   class DataService {
     private cache = new Map<string, unknown>();
     
     async getData(id: string) {
       if (this.cache.has(id)) {
         return this.cache.get(id);
       }
       const data = await fetch(id);
       this.cache.set(id, data);
       return data;
     }
   }
   ```

### Frontend Optimization

**Strategies:**

1. **Use OnPush Change Detection**
   ```typescript
   @Component({
     selector: 'app-example',
     changeDetection: ChangeDetectionStrategy.OnPush,
     templateUrl: './example.component.html',
   })
   export class ExampleComponent {}
   ```

2. **Use Signals for Reactivity**
   ```typescript
   @Component({...})
   export class MyComponent {
     data = signal<Data[]>([]);
     filteredData = computed(() => 
       this.data().filter(item => item.active)
     );
   }
   ```

3. **Lazy Load Modules**
   ```typescript
   const routes: Routes = [
     {
       path: 'features',
       loadChildren: () => import('./features/features.module')
         .then(m => m.FeaturesModule)
     }
   ];
   ```

4. **Optimize Bundle Size**
   - Remove unused dependencies
   - Use tree-shaking friendly imports
   - Code split large features

## Memory Management

### Main Process

**Strategies:**

1. **Clean Up Resources**
   ```typescript
   app.on('will-quit', () => {
     windows.closeAll();
     container.dispose();
     eventBus.removeAllListeners();
   });
   ```

2. **Use Weak References**
   ```typescript
   const registry = new FinalizationRegistry((heldValue) => {
     // Cleanup when object is garbage collected
     cleanup(heldValue);
   });
   
   registry.register(object, heldValue);
   ```

3. **Limit Data in Memory**
   ```typescript
   class DataStore {
     private maxSize = 100;
     private data = new Map<string, Data>();
     
     add(key: string, value: Data) {
       if (this.data.size >= this.maxSize) {
         const firstKey = this.data.keys().next().value;
         this.data.delete(firstKey);
       }
       this.data.set(key, value);
     }
   }
   ```

### Frontend

**Strategies:**

1. **Clean Up Subscriptions**
   ```typescript
   @Component({...})
   export class MyComponent implements OnDestroy {
     private unsubscribe: (() => void)[] = [];
     
     ngOnDestroy() {
       this.unsubscribe.forEach(fn => fn());
     }
   }
   ```

2. **Use TrackBy for ngFor**
   ```typescript
   @Component({...})
   export class ListComponent {
     trackByFn(index: number, item: Item) {
       return item.id;
     }
   }
   ```

   ```html
   <div *ngFor="let item of items; trackBy: trackByFn">
     {{ item.name }}
   </div>
   ```

3. **Avoid Memory Leaks**
   ```typescript
   // Bad: Subscription not cleaned up
   ngOnInit() {
     this.service.data$.subscribe(data => {
       this.data = data;
     });
   }
   
   // Good: Proper cleanup
   ngOnInit() {
     const sub = this.service.data$.subscribe(data => {
       this.data = data;
     });
     this.unsubscribe.push(() => sub.unsubscribe());
   }
   ```

## Bundle Size Optimization

### Analyze Bundle

```bash
# Install analyzer
npm install -g webpack-bundle-analyzer

# Analyze after build
webpack-bundle-analyzer dist/stats.json
```

### Reduce Bundle Size

**Strategies:**

1. **Remove Unused Dependencies**
   ```bash
   # Check dependencies
   bun ls
   
   # Remove unused
   bun remove unused-package
   ```

2. **Use Tree-Shaking**
   ```typescript
   // Good: Import only what's needed
   import { ok, err } from '@shared/errors';
   
   // Bad: Import everything
   import * as errors from '@shared/errors';
   ```

3. **Lazy Load Features**
   ```typescript
   const routes: Routes = [
     {
       path: 'heavy-feature',
       loadChildren: () => import('./heavy/heavy.module')
         .then(m => m.HeavyModule)
     }
   ];
   ```

4. **Optimize Images**
   - Use modern formats (WebP, AVIF)
   - Compress images
   - Use appropriate sizes

### Bundle Size Budgets

```json
// angular.json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "5mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "6kb",
      "maximumError": "10kb"
    }
  ]
}
```

## IPC Performance

### Optimize IPC

**Strategies:**

1. **Batch IPC Calls**
   ```typescript
   // Bad: Multiple calls
   for (const item of items) {
     await ipcRenderer.invoke('process:item', item);
   }
   
   // Good: Single batch call
   await ipcRenderer.invoke('process:items', items);
   ```

2. **Minimize Payload Size**
   ```typescript
   // Bad: Send entire object
   ipcRenderer.invoke('update:user', user);
   
   // Good: Send only changed fields
   ipcRenderer.invoke('update:user', {
     id: user.id,
     changes: { name: user.name }
   });
   ```

3. **Use Events for Notifications**
   ```typescript
   // Bad: Polling
   setInterval(async () => {
     const data = await ipcRenderer.invoke('get:data');
   }, 1000);
   
   // Good: Event-based
   ipcRenderer.on('data:updated', (event, data) => {
     // Handle update
   });
   ```

4. **Cache Results**
   ```typescript
   class CachedService {
     private cache = new Map<string, unknown>();
     
     async getData(key: string) {
       if (this.cache.has(key)) {
         return this.cache.get(key);
       }
       const result = await ipcRenderer.invoke('get:data', key);
       this.cache.set(key, result);
       return result;
     }
   }
   ```

## Loading Performance

### Initial Load

**Strategies:**

1. **Show Loading Screen**
   ```typescript
   const window = new BrowserWindow({
     show: false,
   });
   
   // Show loading screen
   window.loadFile('loading.html');
   
   // Load main app
   window.loadURL(appUrl);
   
   // Show when ready
   window.once('ready-to-show', () => {
     window.show();
   });
   ```

2. **Load Essential Resources First**
   ```typescript
   // Load critical CSS inline
   // Load critical JS first
   // Defer non-critical resources
   ```

3. **Use Skeleton Screens**
   ```html
   <!-- Show skeleton while loading -->
   <div class="skeleton" *ngIf="loading">
     <div class="skeleton-line"></div>
     <div class="skeleton-line"></div>
   </div>
   ```

### Runtime Loading

**Strategies:**

1. **Prefetch Likely Needed Data**
   ```typescript
   // Prefetch data when user hovers
   <button (mouseenter)="prefetchData()">
     Load Data
   </button>
   ```

2. **Use Virtual Scrolling**
   ```typescript
   <cdk-virtual-scroll-viewport itemSize="50">
     <div *cdkVirtualFor="let item of items">
       {{ item.name }}
     </div>
   </cdk-virtual-scroll-viewport>
   ```

3. **Lazy Load Images**
   ```html
   <img [src]="placeholder" [data-src]="actualImage" loading="lazy" />
   ```

## Monitoring

### Performance Metrics

**Track:**

1. **Build Times**
   - Time to build main process
   - Time to build frontend
   - Total build time

2. **Bundle Sizes**
   - Main process bundle
   - Frontend bundle
   - Individual chunk sizes

3. **Runtime Metrics**
   - Memory usage
   - CPU usage
   - IPC latency
   - Frame rate

### DevTools

**Use DevTools to:**

1. **Profile Performance**
   - Open DevTools > Performance tab
   - Record performance profile
   - Identify bottlenecks

2. **Monitor Memory**
   - Open DevTools > Memory tab
   - Take heap snapshots
   - Identify memory leaks

3. **Analyze Network**
   - Open DevTools > Network tab
   - Monitor requests
   - Check timing

### Performance Budget

```json
{
  "performance": {
    "budgets": {
      "buildTime": {
        "warning": 10000,
        "error": 30000
      },
      "bundleSize": {
        "warning": 2000000,
        "error": 5000000
      },
      "memoryUsage": {
        "warning": 200000000,
        "error": 500000000
      }
    }
  }
}
```

## Best Practices

### General Guidelines

1. **Measure Before Optimizing**
   - Profile first
   - Identify actual bottlenecks
   - Don't optimize prematurely

2. **Profile Regularly**
   - Check performance after changes
   - Monitor in production
   - Set up alerts

3. **Optimize Critical Path First**
   - Focus on user-facing performance
   - Optimize initial load
   - Improve perceived performance

4. **Test on Target Hardware**
   - Test on low-end devices
   - Check various platforms
   - Consider network conditions

### Development Practices

1. **Use Production Mode for Testing**
   ```bash
   ng build --configuration=production
   ```

2. **Enable Source Maps for Debugging**
   ```json
   {
     "sourceMap": true
   }
   ```

3. **Use Performance Markers**
   ```typescript
   console.time('operation');
   await operation();
   console.timeEnd('operation');
   ```

4. **Monitor in Production**
   - Use analytics
   - Track performance metrics
   - Set up alerts

## Troubleshooting

### Slow Builds

**Problem:** Builds take too long.

**Solution:**
1. Use Rspack instead of webpack
2. Enable caching
3. Use incremental compilation
4. Exclude unnecessary files
5. Upgrade hardware

### Large Bundle Size

**Problem:** Bundle size too large.

**Solution:**
1. Analyze bundle
2. Remove unused dependencies
3. Use lazy loading
4. Optimize imports
5. Use tree-shaking

### High Memory Usage

**Problem:** Application uses too much memory.

**Solution:**
1. Check for memory leaks
2. Clean up subscriptions
3. Release unused resources
4. Use memory profiler
5. Limit cached data

### Slow IPC

**Problem:** IPC calls are slow.

**Solution:**
1. Batch IPC calls
2. Minimize payload size
3. Cache results
4. Use events instead of polling
5. Optimize handlers

## Related Documentation

- [Building](building.md) - Build process
- [Development Guide](development.md) - Development workflow
- [Scripts Reference](scripts-reference.md) - Build commands
