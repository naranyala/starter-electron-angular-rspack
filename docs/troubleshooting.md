# Troubleshooting & FAQ

## Common Issues

### Development Issues

#### 1. Build Fails with TypeScript Errors
**Problem**: TypeScript compilation fails during build
**Solution**: 
```bash
npm run type-check
# Fix the reported TypeScript errors
```

#### 2. Hot Module Replacement Not Working
**Problem**: Changes don't reflect in the running application
**Solution**:
- Ensure you're running `npm run dev`, not `npm run build`
- Check that the development server is running
- Restart the development server: `npm run dev`

#### 3. IPC Communication Not Working
**Problem**: Renderer process can't communicate with main process
**Solution**:
- Verify the IPC handler is registered in main process
- Check that preload script is properly configured
- Ensure context isolation is not blocking the API

#### 4. Dependencies Not Installing
**Problem**: `npm install` fails with dependency errors
**Solution**:
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
```

### Build Issues

#### 1. Production Build Fails
**Problem**: `npm run build` fails
**Solution**:
- Run with verbose output: `npm run build:verbose`
- Check for TypeScript errors: `npm run type-check`
- Verify all imports are valid

#### 2. Large Bundle Size
**Problem**: Generated bundle is unexpectedly large
**Solution**:
- Check for accidentally imported large libraries
- Verify tree-shaking is working properly
- Use bundle analyzer: `npm run build --analyze`

#### 3. Missing Assets in Production
**Problem**: Images, fonts, or other assets missing in production build
**Solution**:
- Verify assets are in the correct directory
- Check asset copying script: `npm run assets`
- Ensure paths are correctly referenced

### Platform-Specific Issues

#### Windows
- **Issue**: Long path errors during installation
- **Solution**: Enable long path support in Windows registry or use shorter project paths

#### macOS
- **Issue**: App not opening due to security restrictions
- **Solution**: Right-click app and select "Open" to bypass Gatekeeper initially

#### Linux
- **Issue**: AppImage not executing properly
- **Solution**: Make executable: `chmod +x app.AppImage`

## Frequently Asked Questions

### General Questions

#### Q: What makes this starter different from others?
A: This starter combines Rspack's ultra-fast bundling with vanilla TypeScript for maximum performance and minimal overhead. It includes production-ready security, comprehensive tooling, and a clean architecture that scales from prototypes to enterprise applications.

#### Q: Can I use frameworks like React or Vue?
A: Yes! While this starter uses vanilla TypeScript, you can easily add React, Vue, or other frameworks. The architecture is designed to accommodate different frontend libraries.

#### Q: How do I add new dependencies?
A: Simply use npm or bun to install dependencies:
```bash
npm install package-name
# OR
bun add package-name
```

### Development Questions

#### Q: How do I add a new window type?
A: Create a new use case in `/src/renderer/use-cases/` and register it with the `WindowUseCaseFactory`.

#### Q: How do I handle file operations safely?
A: Use the `FileSystem` class in the main process and communicate via IPC. Never expose direct file system access to the renderer.

#### Q: How do I customize the build process?
A: Modify `rspack.config.cjs` for bundling configuration and `package.json` build section for packaging options.

### Performance Questions

#### Q: Why is Rspack faster than Webpack?
A: Rspack is written in Rust and optimized for performance, offering 10x faster build times compared to traditional JavaScript-based bundlers.

#### Q: How can I optimize bundle size?
A: Use tree-shaking, lazy loading, and code splitting. Check the performance documentation for detailed optimization strategies.

### Security Questions

#### Q: Is this starter secure by default?
A: Yes, it implements Electron security best practices including context isolation, disabled nodeIntegration in renderer, and secure IPC communication.

#### Q: Can I safely execute user-provided code?
A: No, never execute user-provided code directly. Use sandboxes or validation if you need to process user input.

## Debugging Tips

### Main Process Debugging

1. Use the VS Code debug configuration
2. Add console.log statements in main process files
3. Check Electron logs in the console

### Renderer Process Debugging

1. Open DevTools (Ctrl+Shift+I in development)
2. Use browser debugging tools
3. Check console for errors

### IPC Debugging

1. Add logging to IPC handlers
2. Use `console.log` in both main and renderer processes
3. Enable verbose mode: `npm run dev:verbose`

## Error Messages

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| IPC_ERROR_001 | Invalid IPC channel | Check channel name spelling |
| FS_ERROR_002 | File not found | Verify file path exists |
| NET_ERROR_003 | Network request failed | Check network connectivity |
| MEM_ERROR_004 | Out of memory | Reduce data processing load |

### Error Handling Best Practices

1. Always handle promises with `.catch()` or try/catch
2. Log errors with context for easier debugging
3. Provide user-friendly error messages
4. Implement graceful degradation when possible

## Support Resources

### Official Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [Rspack Documentation](https://rspack.dev/guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)

### Community Support
- Check existing GitHub issues
- Search Stack Overflow for similar problems
- Join Electron community forums

### When to Report Issues
- Bug in the starter template itself
- Security vulnerability
- Feature request that fits the project scope
- Documentation error

## Performance Monitoring

### Identifying Performance Issues

1. Use Chrome DevTools Performance tab
2. Monitor memory usage
3. Check for memory leaks
4. Profile CPU usage during operations

### Common Performance Pitfalls

- Large data sets in renderer process
- Frequent DOM manipulations
- Unoptimized IPC communication
- Blocking main thread with synchronous operations

## Migration Guide

### From Previous Versions
If upgrading from an older version:
1. Backup your custom code
2. Update dependencies: `npm run deps:latest`
3. Check for breaking changes in release notes
4. Test thoroughly after migration

### From Other Starters
When migrating from other Electron starters:
1. Review architecture differences
2. Adapt IPC patterns to match this starter
3. Update build configurations
4. Verify security settings