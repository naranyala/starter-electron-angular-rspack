# Security

Comprehensive guide to security features, best practices, and tools for Electron Angular Rspack Starter.

## Built-in Security Features

### Context Isolation

Context isolation separates the renderer process from the main process and Node.js APIs.

**Configuration:**

```typescript
const window = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
  }
});
```

**Benefits:**
- Renderer cannot access Node.js APIs directly
- Prevents prototype pollution attacks
- Isolates Electron APIs from web content

### Sandbox Mode

Sandbox mode restricts the renderer process capabilities.

**Configuration:**

```typescript
const window = new BrowserWindow({
  webPreferences: {
    sandbox: true,
  }
});
```

**Benefits:**
- Limits renderer process permissions
- Prevents malicious code execution
- Adds security boundary

### Web Security

Same-origin policy and web security features.

**Configuration:**

```typescript
const window = new BrowserWindow({
  webPreferences: {
    webSecurity: true,
  }
});
```

**Benefits:**
- Enforces same-origin policy
- Prevents XSS attacks
- Blocks mixed content

## Security Configuration

### Window Security Settings

```typescript
function createSecureWindow(options: BrowserWindowConstructorOptions): BrowserWindow {
  return new BrowserWindow({
    ...options,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableRemoteModule: false,
    }
  });
}
```

### Preload Script Security

Secure context bridge setup:

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

const ALLOWED_CHANNELS = [
  'log:write',
  'window:create',
  'data:get',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, data?: unknown) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Channel ${channel} not allowed`);
  },
  on: (channel: string, callback: (data: unknown) => void) => {
    const allowedListeners = ['event:publish', 'log:entry'];
    if (allowedListeners.includes(channel)) {
      const subscription = (_event: unknown, ...args: unknown[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  },
  send: (channel: string, data: unknown) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
```

## IPC Security

### Input Validation

Always validate input in IPC handlers:

```typescript
ipcMain.handle(IPC_CHANNELS.DATA.SET, async (event, data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid data' };
  }
  
  // Validate required fields
  if (!data.key || typeof data.key !== 'string') {
    return { success: false, error: 'Invalid key' };
  }
  
  // Validate key format
  if (!/^[a-zA-Z0-9_-]+$/.test(data.key)) {
    return { success: false, error: 'Invalid key format' };
  }
  
  // Sanitize and process
  const sanitizedKey = sanitizeString(data.key);
  return await saveData(sanitizedKey, data.value);
});
```

### Channel Allowlisting

Only allow specific IPC channels:

```typescript
const ALLOWED_CHANNELS = new Set([
  'log:write',
  'log:get-level',
  'window:create',
  'window:close',
  'data:get',
  'data:set',
]);

ipcMain.handle('*', (event, channel, data) => {
  if (!ALLOWED_CHANNELS.has(channel)) {
    throw new Error(`Channel ${channel} is not allowed`);
  }
});
```

### Rate Limiting

Implement rate limiting for sensitive operations:

```typescript
class RateLimiter {
  private calls = new Map<string, number[]>();
  
  isAllowed(channel: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const channelCalls = this.calls.get(channel) || [];
    
    // Remove old calls outside window
    const recentCalls = channelCalls.filter(time => now - time < windowMs);
    
    if (recentCalls.length >= limit) {
      return false;
    }
    
    recentCalls.push(now);
    this.calls.set(channel, recentCalls);
    return true;
  }
}

const rateLimiter = new RateLimiter();

ipcMain.handle(IPC_CHANNELS.DATA.GET, async (event, data) => {
  if (!rateLimiter.isAllowed(IPC_CHANNELS.DATA.GET, 10, 1000)) {
    throw new Error('Rate limit exceeded');
  }
  return getData(data);
});
```

## Content Security Policy (CSP)

### CSP Configuration

```typescript
const session = require('electron').session;

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' https:",
        "connect-src 'self' https://api.example.com"
      ].join('; ')
    }
  });
});
```

### CSP Best Practices

1. **Restrict Script Sources**
   - Only allow scripts from trusted sources
   - Avoid 'unsafe-inline' and 'unsafe-eval'

2. **Limit Style Sources**
   - Allow styles from trusted sources only
   - Use 'unsafe-inline' sparingly

3. **Control Image Sources**
   - Allow images from trusted sources
   - Include data: for inline images

4. **Restrict Connections**
   - Limit API endpoints
   - Block unauthorized connections

## Dependency Security

### Check Dependencies

```bash
# Check for vulnerabilities
bun audit

# Check for outdated packages
bun run check-deps

# Update dependencies
bun run deps:latest
```

### Dependency Scanning

```typescript
import { describe, it, expect } from 'bun:test';

describe('Dependency Security', () => {
  it('should have no known vulnerabilities', async () => {
    const vulnerabilities = await scanDependencies();
    expect(vulnerabilities.length).toBe(0);
  });

  it('should use secure versions', async () => {
    const outdated = await checkOutdatedPackages();
    expect(outdated.critical.length).toBe(0);
  });
});
```

### Secure Dependencies

1. **Pin Versions**
   - Use exact versions in package.json
   - Avoid ^ or ~ for critical packages

2. **Review Dependencies**
   - Check package reputation
   - Review package maintenance
   - Check for security advisories

3. **Minimize Dependencies**
   - Remove unused packages
   - Use built-in functionality
   - Prefer smaller packages

## Security Tools

### Security Audit

```bash
bun run security:audit
```

Checks for common security issues:
- Context isolation
- Sandbox mode
- Node integration
- Web security
- IPC security

### Security Scan

```bash
bun run security:scan
```

Scans codebase for vulnerabilities:
- Insecure patterns
- Missing security features
- Potential exploits

### Code Analysis

```bash
bun run security:analyze
```

Analyzes code for security patterns:
- Security anti-patterns
- Missing validations
- Unsafe operations

### Full Security Pipeline

```bash
bun run security:ci
```

Complete security check for CI/CD:
1. Security build
2. Security audit
3. Security scan
4. Security tests

## Security Checklist

### Window Configuration

- [ ] Context isolation enabled
- [ ] Sandbox mode enabled
- [ ] Node integration disabled
- [ ] Web security enabled
- [ ] Remote module disabled
- [ ] Insecure content blocked

### IPC Security

- [ ] Input validation in all handlers
- [ ] Channel allowlisting
- [ ] Rate limiting for sensitive operations
- [ ] Error handling in handlers
- [ ] Type-safe channel definitions

### Preload Script

- [ ] Minimal API exposure
- [ ] Channel validation
- [ ] Input sanitization
- [ ] Type definitions
- [ ] Error handling

### Content Security

- [ ] CSP configured
- [ ] Script sources restricted
- [ ] Style sources limited
- [ ] Image sources controlled
- [ ] Connection endpoints defined

### Dependencies

- [ ] No known vulnerabilities
- [ ] Versions pinned
- [ ] Dependencies reviewed
- [ ] Unused packages removed
- [ ] Regular updates

### Code Security

- [ ] No eval() usage
- [ ] No child_process without validation
- [ ] File system access restricted
- [ ] Network requests validated
- [ ] User input sanitized

## Security Testing

### Automated Tests

```typescript
import { describe, it, expect } from 'bun:test';

describe('Security Tests', () => {
  it('should have context isolation', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.contextIsolation).toBe(true);
  });

  it('should have sandbox enabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.sandbox).toBe(true);
  });

  it('should have nodeIntegration disabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.nodeIntegration).toBe(false);
  });

  it('should validate IPC input', async () => {
    const result = await ipcRenderer.invoke('data:set', null);
    expect(result.success).toBe(false);
  });
});
```

### Manual Security Review

1. **Review Window Configuration**
   - Check all BrowserWindow instances
   - Verify security settings
   - Ensure consistent configuration

2. **Review IPC Handlers**
   - Check input validation
   - Verify error handling
   - Review channel definitions

3. **Review Preload Script**
   - Check exposed APIs
   - Verify channel validation
   - Review error handling

4. **Review Dependencies**
   - Check for vulnerabilities
   - Review package sources
   - Verify versions

## Security Best Practices

### General Guidelines

1. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Restrict capabilities by default
   - Enable features explicitly

2. **Defense in Depth**
   - Multiple security layers
   - Don't rely on single protection
   - Fail securely

3. **Secure by Default**
   - Security enabled by default
   - Explicit opt-in for risky features
   - Safe defaults

4. **Regular Audits**
   - Run security audits regularly
   - Review code for vulnerabilities
   - Update dependencies

### Development Practices

1. **Use TypeScript**
   - Type safety prevents errors
   - Catch issues at compile time
   - Better code quality

2. **Validate All Input**
   - Never trust user input
   - Validate on both sides
   - Sanitize before use

3. **Handle Errors Securely**
   - Don't expose internal errors
   - Log errors appropriately
   - Fail securely

4. **Use Secure APIs**
   - Use built-in security features
   - Avoid unsafe APIs
   - Follow security guidelines

## Incident Response

### Security Incident Handling

1. **Identify**
   - Detect security issue
   - Assess severity
   - Document findings

2. **Contain**
   - Limit impact
   - Isolate affected systems
   - Prevent spread

3. **Remediate**
   - Fix vulnerability
   - Update affected code
   - Deploy fix

4. **Review**
   - Analyze root cause
   - Update processes
   - Prevent recurrence

### Reporting Security Issues

1. **Document Issue**
   - Describe vulnerability
   - Provide reproduction steps
   - Include impact assessment

2. **Report Responsibly**
   - Follow responsible disclosure
   - Allow time for fix
   - Coordinate release

## Related Documentation

- [Security Testing](security-testing.md) - Security audits
- [IPC Communication](ipc-communication.md) - IPC security
- [Context Isolation](context-isolation.md) - Context isolation details
- [Sandbox Mode](sandbox-mode.md) - Renderer sandboxing
