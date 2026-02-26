# IPC Communication

Comprehensive guide to inter-process communication between Electron main process and renderer/frontend.

## Overview

IPC (Inter-Process Communication) enables secure communication between the Electron main process (Node.js) and the renderer/frontend processes. This guide covers IPC patterns, security, and best practices.

## Architecture

```
+------------------+                           +------------------+
|  Main Process    |                           |   Frontend       |
|  (Node.js)       |                           |   (Angular)      |
|                  |                           |                  |
|  ipcMain.handle  |<-------- IPC Bridge ----->|  ipcRenderer     |
|  ipcMain.emit    |        (contextBridge)    |  .invoke         |
|                  |                           |  .on             |
+------------------+                           +------------------+
```

## Channel Definitions

All IPC channels are defined centrally in shared code for type safety and consistency.

### Import Channels

```typescript
import { IPC_CHANNELS } from '@shared/ipc';
```

### Channel Structure

```typescript
export const IPC_CHANNELS = {
  LOG: {
    WRITE: 'log:write',
    GET_LEVEL: 'log:get-level',
    CLEAR: 'log:clear',
  },
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
    FOCUS: 'window:focus',
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
  },
  APP: {
    INFO: 'get-app-info',
    QUIT: 'app:quit',
    RESTART: 'app:restart',
  },
  EVENT: {
    PUBLISH: 'event:publish',
    SUBSCRIBE: 'event:subscribe',
  },
  DATA: {
    GET: 'data:get',
    SET: 'data:set',
    DELETE: 'data:delete',
  },
};
```

## Main Process

### Register Handler

```typescript
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';

ipcMain.handle(IPC_CHANNELS.LOG.WRITE, async (event, entry) => {
  logger.write(entry);
  return { success: true };
});
```

### Register Multiple Handlers

```typescript
import { registerIpcHandlers } from '@main/ipc';

registerIpcHandlers();
```

### Send to Renderer

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

mainWindow.webContents.send(IPC_CHANNELS.EVENT.PUBLISH, {
  channel: 'window:created',
  payload: { id: '1', title: 'Main Window' }
});
```

### Remove Handler

```typescript
ipcMain.removeHandler(IPC_CHANNELS.LOG.WRITE);
```

## Renderer Process

### Invoke Handler

```typescript
import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc';

const result = await ipcRenderer.invoke(IPC_CHANNELS.LOG.GET_LEVEL);
console.log('Log level:', result);
```

### Listen for Events

```typescript
ipcRenderer.on(IPC_CHANNELS.EVENT.PUBLISH, (event, data) => {
  console.log('Event received:', data.channel, data.payload);
});
```

### Remove Listener

```typescript
const listener = (event, data) => {
  console.log('Event:', data);
};

ipcRenderer.on(IPC_CHANNELS.EVENT.PUBLISH, listener);

// Later, remove listener
ipcRenderer.removeListener(IPC_CHANNELS.EVENT.PUBLISH, listener);
```

### Send Without Response

```typescript
ipcRenderer.send(IPC_CHANNELS.LOG.WRITE, {
  level: 'info',
  message: 'Hello from renderer'
});
```

## Frontend (Angular)

### Using electronAPI

The preload script exposes a type-safe API:

```typescript
// Invoke handler
const result = await window.electronAPI.invoke('log:get-level');

// Send event
window.electronAPI.send('log:write', {
  level: 'info',
  message: 'Message'
});

// Listen for events
window.electronAPI.on('event:publish', (data) => {
  console.log('Event:', data);
});
```

### Using IPC Service

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IpcService {
  async invoke<T>(channel: string, data?: unknown): Promise<T> {
    return await window.electronAPI.invoke(channel, data);
  }

  send(channel: string, data: unknown): void {
    window.electronAPI.send(channel, data);
  }

  on(channel: string, callback: (data: unknown) => void): () => void {
    return window.electronAPI.on(channel, callback);
  }
}
```

### Using Event Bus

The event bus automatically bridges IPC for cross-process events:

```typescript
constructor(private events: EventBusFacade) {}

// Send to main process
this.events.sendToMain('window:create', options);

// Listen for main process events
this.events.on('window:created', (payload) => {
  console.log('Window created:', payload);
});
```

## Type Safety

### Define Request/Response Types

```typescript
// src/shared/ipc/types.ts

export interface LogWriteRequest {
  entry: LogEntry;
}

export interface LogWriteResponse {
  success: boolean;
  error?: string;
}

export interface GetAppInfoResponse {
  name: string;
  version: string;
  platform: string;
}
```

### Use Types in Handlers

```typescript
ipcMain.handle(
  IPC_CHANNELS.LOG.WRITE,
  async (event, request: LogWriteRequest): Promise<LogWriteResponse> => {
    try {
      logger.write(request.entry);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
);
```

### Use Types in Frontend

```typescript
async writeLog(entry: LogEntry): Promise<void> {
  const request: LogWriteRequest = { entry };
  const response = await window.electronAPI.invoke<LogWriteResponse>(
    IPC_CHANNELS.LOG.WRITE,
    request
  );
  
  if (!response.success) {
    throw new Error(response.error);
  }
}
```

## Security

### Validate Input

Always validate input in handlers:

```typescript
ipcMain.handle(IPC_CHANNELS.DATA.SET, async (event, data) => {
  // Validate data structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data');
  }
  
  // Validate required fields
  if (!data.key || typeof data.key !== 'string') {
    throw new Error('Invalid key');
  }
  
  // Validate value
  if (!data.value) {
    throw new Error('Invalid value');
  }
  
  // Process validated data
  return saveData(data);
});
```

### Use Allowlist

Only allow specific channels:

```typescript
// src/preload/index.ts
const ALLOWED_CHANNELS = [
  'log:write',
  'log:get-level',
  'window:create',
  'window:close',
];

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, data?: unknown) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Channel ${channel} not allowed`);
  }
});
```

### Sanitize Data

Sanitize data before processing:

```typescript
ipcMain.handle(IPC_CHANNELS.FILE.WRITE, async (event, data) => {
  // Sanitize file path
  const sanitizedPath = path.normalize(data.path);
  
  // Validate path is within allowed directory
  if (!sanitizedPath.startsWith(allowedDirectory)) {
    throw new Error('Access denied');
  }
  
  // Sanitize content
  const sanitizedContent = sanitizeContent(data.content);
  
  return writeFile(sanitizedPath, sanitizedContent);
});
```

### Rate Limiting

Implement rate limiting for sensitive operations:

```typescript
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(channel: string, limit: number): boolean {
  const now = Date.now();
  const calls = rateLimiter.get(channel) || [];
  
  // Remove old calls
  const recentCalls = calls.filter(time => now - time < 1000);
  
  if (recentCalls.length >= limit) {
    return false;
  }
  
  recentCalls.push(now);
  rateLimiter.set(channel, recentCalls);
  return true;
}

ipcMain.handle(IPC_CHANNELS.DATA.GET, async (event, data) => {
  if (!checkRateLimit(IPC_CHANNELS.DATA.GET, 10)) {
    throw new Error('Rate limit exceeded');
  }
  
  return getData(data);
});
```

## Best Practices

### General Guidelines

1. **Always Use IPC_CHANNELS Constants**
   - Never hardcode channel names
   - Use centralized definitions
   - Prevents typos

2. **Define Types for All Messages**
   - Request types
   - Response types
   - Event payload types

3. **Validate Input in Handlers**
   - Check data structure
   - Validate field types
   - Sanitize user input

4. **Handle Errors Gracefully**
   - Catch exceptions in handlers
   - Return structured errors
   - Log errors appropriately

5. **Document All Channels**
   - Channel purpose
   - Request format
   - Response format
   - Error cases

### Main Process Specific

1. **Use Async Handlers**
   ```typescript
   ipcMain.handle('async-operation', async (event, data) => {
     return await performAsyncOperation(data);
   });
   ```

2. **Return Structured Responses**
   ```typescript
   return {
     success: true,
     data: result
   };
   ```

3. **Log IPC Activity**
   ```typescript
   logger.info('IPC handler called', { channel, data });
   ```

### Frontend Specific

1. **Use Service Abstraction**
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class ApiService {
     async getData(): AsyncResult<Data> {
       return tryAsync(async () => {
         return await window.electronAPI.invoke('data:get');
       });
     }
   }
   ```

2. **Handle Errors**
   ```typescript
   try {
     const result = await window.electronAPI.invoke('data:get');
   } catch (error) {
     this.errorService.handle(error);
   }
   ```

3. **Clean Up Listeners**
   ```typescript
   ngOnDestroy() {
     this.ipcListeners.forEach(unsubscribe => unsubscribe());
   }
   ```

## Patterns

### Request-Response Pattern

```typescript
// Frontend: Send request
const response = await window.electronAPI.invoke('data:get', { id: '123' });

// Main: Handle request
ipcMain.handle('data:get', async (event, { id }) => {
  const data = await database.findById(id);
  return { success: true, data };
});
```

### Publish-Subscribe Pattern

```typescript
// Main: Publish event
mainWindow.webContents.send('event:publish', {
  channel: 'data:updated',
  payload: { type: 'users' }
});

// Frontend: Subscribe
window.electronAPI.on('event:publish', (data) => {
  if (data.channel === 'data:updated') {
    console.log('Data updated:', data.payload);
  }
});
```

### Fire-and-Forget Pattern

```typescript
// Frontend: Send without waiting
window.electronAPI.send('log:write', {
  level: 'info',
  message: 'User action'
});

// Main: Handle without response
ipcMain.on('log:write', (event, data) => {
  logger.write(data);
});
```

### Batch Operations Pattern

```typescript
// Frontend: Send batch
const results = await window.electronAPI.invoke('data:batch-get', {
  ids: ['1', '2', '3']
});

// Main: Process batch
ipcMain.handle('data:batch-get', async (event, { ids }) => {
  const results = await Promise.all(
    ids.map(id => database.findById(id))
  );
  return { success: true, results };
});
```

## Debugging

### Enable IPC Logging

```typescript
// Main process
ipcMain.handle('*', (event, channel, data) => {
  logger.info('IPC called', { channel, data });
});
```

### Use DevTools

1. Navigate to `/devtools`
2. Select IPC tab
3. View sent and received messages
4. Inspect message payloads
5. Monitor IPC traffic

### Trace IPC

```typescript
// Add tracing wrapper
const originalHandle = ipcMain.handle;
ipcMain.handle = (channel, handler) => {
  return originalHandle.call(ipcMain, channel, async (event, data) => {
    console.log('IPC IN:', channel, data);
    try {
      const result = await handler(event, data);
      console.log('IPC OUT:', channel, result);
      return result;
    } catch (error) {
      console.log('IPC ERROR:', channel, error);
      throw error;
    }
  });
};
```

## Troubleshooting

### Handler Not Found

**Problem:** `No handler registered for channel`

**Solution:**
1. Verify handler is registered
2. Check channel name matches
3. Ensure registration happens before invoke

### Timeout

**Problem:** IPC call times out

**Solution:**
1. Check handler returns/resolves
2. Verify no blocking operations
3. Increase timeout if needed

### Data Not Serialized

**Problem:** Complex objects not transferring

**Solution:**
1. Use JSON-serializable data
2. Convert functions to strings
3. Use transferable objects

### Security Errors

**Problem:** `Unable to load preload script`

**Solution:**
1. Check contextIsolation is enabled
2. Verify preload script path
3. Check file permissions

## Related Documentation

- [Security](security.md) - Security features
- [Event Bus](event-bus.md) - Event system
- [Architecture](architecture.md) - System design
