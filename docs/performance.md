# Performance

Performance optimization guide.

## Build Performance

### Rspack Optimization

Rspack provides fast builds:

- Sub-second build times
- Incremental compilation
- Efficient caching

### Angular Optimization

Angular CLI optimizations:

- AOT compilation
- Tree shaking
- Bundle optimization

## Runtime Performance

### Main Process

Optimize main process:

1. Lazy load services
2. Use efficient data structures
3. Minimize IPC calls
4. Cache frequently used data

### Frontend

Optimize frontend:

1. Use OnPush change detection
2. Lazy load modules
3. Optimize bundle size
4. Use signals for reactivity

## Memory Management

### Main Process

```typescript
// Clean up resources
app.on('will-quit', () => {
  windows.closeAll();
  container.dispose();
});
```

### Frontend

```typescript
// Clean up subscriptions
ngOnDestroy() {
  this.unsubscribe.forEach(fn => fn());
}
```

## Bundle Size

### Reduce Bundle Size

1. Remove unused dependencies
2. Use tree shaking
3. Lazy load features
4. Optimize imports

### Analyze Bundle

```bash
# Install analyzer
npm install -g webpack-bundle-analyzer

# Analyze build
webpack-bundle-analyzer dist/stats.json
```

## IPC Performance

### Optimize IPC

1. Batch IPC calls
2. Use efficient serialization
3. Minimize payload size
4. Cache results when possible

### Example

```typescript
// Bad: Multiple IPC calls
for (const item of items) {
  await ipcRenderer.invoke('process:item', item);
}

// Good: Batch IPC call
await ipcRenderer.invoke('process:items', items);
```

## Loading Performance

### Initial Load

1. Show loading screen
2. Load essential resources first
3. Defer non-critical operations
4. Use skeleton screens

### Runtime

1. Lazy load features
2. Prefetch likely needed data
3. Cache frequently accessed data
4. Use web workers for heavy tasks

## Monitoring

### Performance Metrics

Track:

- Build times
- Bundle sizes
- Memory usage
- IPC latency
- Frame rate

### DevTools

Use DevTools to:

1. Profile performance
2. Identify bottlenecks
3. Monitor memory
4. Analyze network requests

## Best Practices

1. Measure before optimizing
2. Profile regularly
3. Optimize critical path first
4. Test on target hardware
5. Monitor in production

## Related Documentation

- Building - Build process
- Development - Development workflow
