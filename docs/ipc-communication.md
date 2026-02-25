# IPC Communication

Inter-process communication between main and renderer processes.

## Overview

IPC (Inter-Process Communication) enables secure communication between Electron main process and renderer/frontend.

## Channel Definitions

All IPC channels are defined centrally:

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

// Channel structure
IPC_CHANNELS = {
  LOG: {
    WRITE: 'log:write',
    GET_LEVEL: 'log:get-level',
  },
  WINDOW: {
    CREATE: 'window:create',
    CLOSE: 'window:close',
  },
  APP: {
    INFO: 'get-app-info',
    QUIT: 'app:quit',
  },
}
```

## Main Process

### Register Handler

```typescript
import { IPC_CHANNELS } from '@shared/ipc';

ipcMain.handle(IPC_CHANNELS.LOG.WRITE, async (event, entry) => {
  logger.write(entry);
  return { success: true };
});
```

### Send to Renderer

```typescript
mainWindow.webContents.send(IPC_CHANNELS.EVENT.PUBLISH, {
  channel: 'window:created',
  payload: data
});
```

## Frontend

### Invoke Handler

```typescript
const result = await ipcRenderer.invoke(
  IPC_CHANNELS.LOG.GET_LEVEL
);
```

### Listen for Events

```typescript
ipcRenderer.on(IPC_CHANNELS.EVENT.PUBLISH, (event, data) => {
  console.log('Event:', data.channel, data.payload);
});
```

## Type Safety

### Define Types

```typescript
interface LogWriteRequest {
  entry: LogEntry;
}

interface LogWriteResponse {
  success: boolean;
}
```

### Use Types

```typescript
ipcMain.handle(
  IPC_CHANNELS.LOG.WRITE,
  async (event, request: LogWriteRequest): Promise<LogWriteResponse> => {
    // Type-safe implementation
  }
);
```

## Best Practices

1. Always use IPC_CHANNELS constants
2. Define types for all messages
3. Validate input in handlers
4. Handle errors gracefully
5. Document all channels
6. Use error handling utilities

## Security

- Validate all input from renderer
- Never expose Node.js APIs directly
- Use contextBridge for secure exposure
- Implement rate limiting for sensitive operations

## Related Documentation

- Security - Security features
- Event Bus - Event system
