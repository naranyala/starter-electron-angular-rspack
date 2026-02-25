# Security

Security features and best practices for Electron applications.

## Built-in Security Features

### Context Isolation

Renderer process runs in isolated context:

```typescript
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
  }
});
```

### Sandbox Mode

Renderer process is sandboxed:

```typescript
const window = new BrowserWindow({
  webPreferences: {
    sandbox: true,
  }
});
```

### Web Security

Same-origin policy enforced:

```typescript
const window = new BrowserWindow({
  webPreferences: {
    webSecurity: true,
  }
});
```

## Security Tools

### Security Audit

```bash
bun run security:audit
```

Checks for common security issues.

### Security Scan

```bash
bun run security:scan
```

Scans for vulnerabilities.

### Code Analysis

```bash
bun run security:analyze
```

Analyzes code for security issues.

### Full Security Pipeline

```bash
bun run security:ci
```

Runs all security checks for CI/CD.

## IPC Security

### Validate Input

```typescript
ipcMain.handle('channel', async (event, data) => {
  // Validate input
  if (!isValid(data)) {
    throw new Error('Invalid input');
  }
  // Process
});
```

### Use Type-Safe Channels

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

ipcMain.handle(IPC_CHANNELS.LOG.WRITE, handler);
```

## Preload Script Security

### Secure contextBridge

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld('api', {
  getData: () => ipcRenderer.invoke('channel'),
});
```

### Limit Exposed APIs

Only expose necessary APIs:

```typescript
contextBridge.exposeInMainWorld('api', {
  // Only what's needed
  loadData: () => ipcRenderer.invoke('load:data'),
  saveData: (data) => ipcRenderer.invoke('save:data', data),
});
```

## Dependency Security

### Check Dependencies

```bash
bun run check-deps
bun run deps:latest
```

### Audit Dependencies

```bash
bun audit
```

## Best Practices

1. Enable context isolation
2. Enable sandbox mode
3. Disable nodeIntegration
4. Validate all IPC input
5. Keep dependencies updated
6. Run security audits regularly
7. Use CSP (Content Security Policy)
8. Never expose Node.js APIs directly

## Security Checklist

- [ ] Context isolation enabled
- [ ] Sandbox mode enabled
- [ ] Node integration disabled
- [ ] Web security enabled
- [ ] IPC handlers validate input
- [ ] Dependencies up to date
- [ ] Security audits passing
- [ ] CSP configured

## Related Documentation

- Security Testing - Security audits
- IPC Communication - IPC security
- Context Isolation - Context isolation details
