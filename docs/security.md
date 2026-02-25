# Security Guidelines

## Security Architecture

This Electron application implements security best practices by default to protect against common vulnerabilities.

### Security Defaults

- **Context Isolation**: Enabled by default
- **Node Integration**: Disabled in renderer process
- **Web Security**: Enabled
- **Allow Running Insecure Content**: Disabled
- **Experimental Features**: Disabled
- **Enable Blink Features**: None enabled by default

## Security Configuration

### Main Process Security Settings

```javascript
// In main process window creation
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,        // Isolate renderer from Node.js
    nodeIntegration: false,        // Disable Node.js in renderer
    sandbox: true,                 // Sandbox renderer process
    webSecurity: true,             // Enable web security
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
  }
});
```

### Preload Script Security

The preload script acts as a secure bridge between main and renderer processes:

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose only safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, listener: (event: any, ...args: any[]) => void) => 
    ipcRenderer.on(channel, listener)
});
```

## IPC Security

### Safe IPC Communication

All IPC communication is validated and sanitized:

```typescript
// Main process - validate inputs
ipc.register('safe-action', async (event, params) => {
  // Validate parameters
  if (!isValidInput(params)) {
    throw new Error('Invalid input');
  }
  
  // Perform safe operation
  return await performAction(params);
});
```

### Input Validation

Always validate inputs received from renderer process:

```typescript
function isValidFilePath(filePath: string): boolean {
  // Prevent directory traversal
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return false;
  }
  
  // Validate file extension if needed
  const allowedExtensions = ['.txt', '.json', '.config'];
  return allowedExtensions.some(ext => filePath.endsWith(ext));
}
```

## Content Security Policy

### CSP Headers

The application implements a strict Content Security Policy:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               font-src 'self' data:; 
               connect-src 'self' http: https:;">
```

## File System Security

### Safe File Operations

File system operations are wrapped with security checks:

```typescript
class SecureFileSystem {
  async readFile(filePath: string): Promise<string> {
    // Validate file path
    if (!this.isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    
    // Check file exists and is readable
    if (!await this.isFileAccessible(filePath)) {
      throw new Error('File not accessible');
    }
    
    return await fs.promises.readFile(filePath, 'utf-8');
  }
  
  private isValidPath(filePath: string): boolean {
    // Prevent directory traversal attacks
    const normalizedPath = path.normalize(filePath);
    const basePath = path.resolve(__dirname);
    const fullPath = path.resolve(basePath, normalizedPath);
    
    return fullPath.startsWith(basePath);
  }
}
```

## Network Security

### Restricted Network Access

Network requests are limited to trusted domains:

```typescript
// In main process
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Only allow navigation to trusted domains
    if (!trustedDomains.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });
});
```

## Vulnerability Prevention

### XSS Prevention

- All dynamic content is properly escaped
- Template literals are sanitized before insertion
- User input is validated before rendering

### Prototype Pollution

- Object spread operations are validated
- Input objects are cloned safely
- Prototype modifications are prevented

### Command Injection

- Shell commands are constructed safely
- User input is never directly used in command construction
- Parameter validation is enforced

## Security Best Practices

### 1. Never Trust Renderer Input

Always validate and sanitize data coming from the renderer process:

```typescript
// ❌ Never do this
const result = await exec(userData);

// ✅ Always validate first
if (isValidCommand(userData)) {
  const result = await exec(sanitize(userData));
}
```

### 2. Use Context Bridge Safely

Only expose necessary APIs through context bridge:

```typescript
// ❌ Don't expose dangerous APIs
contextBridge.exposeInMainWorld('electronAPI', {
  dangerousFunction: () => dangerousOperation()
});

// ✅ Only expose safe APIs
contextBridge.exposeInMainWorld('electronAPI', {
  safeFunction: (params) => safeOperation(params)
});
```

### 3. Validate File Paths

Always validate file paths to prevent directory traversal:

```typescript
function validateFilePath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  const allowedBaseDir = path.resolve(app.getPath('userData'));
  
  return normalized.startsWith(allowedBaseDir);
}
```

### 4. Limit Permissions

Request only necessary permissions:

```typescript
// Configure permissions in main process
app.on('select-client-certificate', (event, webContents, url, certificateList, callback) => {
  // Handle certificate selection securely
});
```

## Security Monitoring

### Logging Security Events

Security-relevant events are logged for monitoring:

```typescript
import { logger } from './lib/logger';

function logSecurityEvent(event: string, details: any) {
  logger.warn(`SECURITY EVENT: ${event}`, {
    timestamp: new Date().toISOString(),
    details,
    userId: getCurrentUserId() // If applicable
  });
}
```

## Third-Party Security

### Dependency Security

- Regular dependency audits
- Use of trusted packages only
- Automatic security updates where possible
- Vulnerability scanning

### Supply Chain Security

- Pin dependency versions
- Use integrity checks
- Verify package signatures when available
- Monitor for known vulnerabilities

## Security Updates

### Keeping Dependencies Updated

Regularly update dependencies to patch security vulnerabilities:

```bash
npm run deps:latest
```

### Security Advisories

Monitor security advisories for:
- Electron
- TypeScript
- Rspack
- All direct dependencies

## Reporting Security Issues

For security vulnerabilities, please contact the maintainers directly rather than opening public issues.