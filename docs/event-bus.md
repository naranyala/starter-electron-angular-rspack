# Event Bus System

Comprehensive guide to the cross-process event communication system.

## Overview

The event bus provides type-safe, cross-process event communication between the Electron main process and the Angular frontend. It implements a publish/subscribe pattern with support for local and cross-process events.

## Architecture

```
+------------------+           +------------------+
|  Main Process    |           |   Frontend       |
|  Event Bus       |<--------->|   Event Bus      |
|                  |    IPC    |                  |
+------------------+           +------------------+
        |                              |
        v                              v
+------------------+           +------------------+
|  Publishers      |           |  Subscribers     |
+------------------+           +------------------+
```

## Backend Usage

### Import Event Bus

```typescript
import { events } from '@main/events';
```

### Subscribe to Events

**Basic Subscription:**

```typescript
events.on('window:created', (payload) => {
  console.log('Window created:', payload.title);
});
```

**Multiple Subscribers:**

```typescript
events.on('window:created', handler1);
events.on('window:created', handler2);
// Both handlers will be called
```

**Once Subscription:**

```typescript
events.once('app:ready', () => {
  console.log('App is ready');
});
// Handler is called only once
```

**Unsubscribe:**

```typescript
const unsubscribe = events.on('window:created', (payload) => {
  console.log('Window created');
});

// Later, unsubscribe
unsubscribe();
```

### Publish Events

**Local Emit:**

```typescript
events.emit('window:created', {
  id: 'window-1',
  title: 'Main Window'
});
```

**Cross-Process Broadcast:**

```typescript
events.broadcast('navigation:complete', {
  from: 'home',
  to: 'settings',
  timestamp: Date.now()
});
```

**High Priority Alert:**

```typescript
events.alert('error:occurred', {
  code: 'CRITICAL_ERROR',
  message: 'Something went wrong'
});
```

### Event Metadata

Add metadata for tracing:

```typescript
events.broadcast('user:action', {
  action: 'click',
  target: 'button'
}, {
  userId: '123',
  sessionId: 'abc',
  timestamp: Date.now()
});
```

## Frontend Usage

### Import Event Bus

```typescript
import { EventBusFacade } from '@core/events';
```

### Inject Event Bus

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private events: EventBusFacade) {}
}
```

### Subscribe to Events

**Basic Subscription:**

```typescript
this.events.on('window:created', (payload) => {
  console.log('Window created:', payload.title);
});
```

**Subscription in Component:**

```typescript
@Component({...})
export class MyComponent implements OnInit, OnDestroy {
  private unsubscribe: (() => void)[] = [];

  constructor(private events: EventBusFacade) {}

  ngOnInit() {
    const unsubscribe = this.events.on('data:updated', (data) => {
      this.handleDataUpdate(data);
    });
    this.unsubscribe.push(unsubscribe);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(fn => fn());
  }
}
```

### Publish Events

**Local Emit:**

```typescript
this.events.emit('navigation:start', {
  from: 'home',
  to: 'settings'
});
```

**Send to Main Process:**

```typescript
this.events.sendToMain('window:create', {
  title: 'New Window',
  width: 800,
  height: 600
});
```

**Broadcast to All:**

```typescript
this.events.broadcast('user:login', {
  userId: '123',
  timestamp: Date.now()
});
```

## Reactive Signals

The event bus integrates with Angular signals for reactive programming.

### Get Event Count Signal

```typescript
export class MyViewModel {
  windowCount = this.events.getSignal('window:created');
  
  constructor(private events: EventBusFacade) {}
}

// Template
// {{ windowCount() }} windows created
```

### Get Latest Payload Signal

```typescript
export class MyViewModel {
  lastWindow = this.events.getLatest('window:created');
  
  constructor(private events: EventBusFacade) {}
}

// Access latest payload
const window = this.lastWindow();
```

### Custom Selector

```typescript
export class MyViewModel {
  windowTitles = this.events.select(
    'window:created',
    (payload) => payload.title
  );
  
  constructor(private events: EventBusFacade) {}
}
```

### Combine Signals

```typescript
export class MyViewModel {
  windowCount = this.events.getSignal('window:created');
  closeCount = this.events.getSignal('window:closed');
  
  activeWindows = computed(() => {
    return this.windowCount() - this.closeCount();
  });
  
  constructor(private events: EventBusFacade) {}
}
```

## Built-in Events

### App Events

| Event | Payload | Description |
|-------|---------|-------------|
| `app:ready` | `{ timestamp: number }` | Application started |
| `app:shutdown` | `{ reason: string }` | Application shutting down |
| `app:minimize` | `{ windowId: string }` | Window minimized |
| `app:maximize` | `{ windowId: string }` | Window maximized |
| `app:restore` | `{ windowId: string }` | Window restored |

### Window Events

| Event | Payload | Description |
|-------|---------|-------------|
| `window:created` | `{ id: string, title: string }` | New window created |
| `window:closed` | `{ id: string }` | Window closed |
| `window:focused` | `{ id: string }` | Window focused |
| `window:blurred` | `{ id: string }` | Window blurred |
| `window:bounds-changed` | `{ id: string, bounds: Bounds }` | Window resized |
| `window:moved` | `{ id: string, position: Position }` | Window moved |

### Log Events

| Event | Payload | Description |
|-------|---------|-------------|
| `log:entry` | `{ level: string, message: string }` | Log message |
| `log:level-change` | `{ level: string }` | Log level changed |
| `log:cleared` | `{ count: number }` | Logs cleared |

### Error Events

| Event | Payload | Description |
|-------|---------|-------------|
| `error:occurred` | `{ code: string, message: string }` | Error occurred |
| `error:recovered` | `{ code: string }` | Error recovered |
| `error:dashboard-opened` | `{ count: number }` | Error dashboard opened |

### Navigation Events

| Event | Payload | Description |
|-------|---------|-------------|
| `navigation:start` | `{ from: string, to: string }` | Navigation started |
| `navigation:complete` | `{ from: string, to: string }` | Navigation completed |
| `navigation:cancel` | `{ from: string, to: string }` | Navigation cancelled |

## Event Channels

### Channel Types

**Local Events:**
- Stay within the same process
- Fast, no IPC overhead
- Use `emit()` method

**Cross-Process Events:**
- Travel between main and frontend
- Use IPC bridge
- Use `broadcast()` or `sendToMain()`

**High Priority Events:**
- Urgent notifications
- Use `alert()` method
- Bypass normal queue

### Channel Naming

Follow consistent naming conventions:

```
entity:action       // window:created, user:login
feature:event       // navigation:start, search:complete
level:sublevel      // app:ready, log:entry
```

## Best Practices

### General Guidelines

1. **Use Type-Safe Event Channels**
   - Define event types
   - Use constants for channel names
   - Validate payloads

2. **Handle Errors in Handlers**
   - Wrap handlers in try-catch
   - Log errors appropriately
   - Prevent handler errors from breaking subscriptions

3. **Clean Up Subscriptions**
   - Unsubscribe in ngOnDestroy
   - Use unsubscribe functions
   - Prevent memory leaks

4. **Use Appropriate Priority**
   - Normal events: `emit()` or `broadcast()`
   - Urgent events: `alert()`
   - One-time events: `once()`

5. **Add Metadata for Tracing**
   - Include timestamps
   - Add user/session context
   - Enable debugging

### Backend Specific

1. **Emit After State Changes**
   ```typescript
   async createWindow(options: WindowOptions) {
     const window = await this.windowService.create(options);
     events.emit('window:created', { id: window.id, title: window.title });
   }
   ```

2. **Use Broadcast for Cross-Process**
   ```typescript
   events.broadcast('data:synced', { type: 'users' });
   ```

3. **Alert for Critical Errors**
   ```typescript
   events.alert('error:critical', { code: 'DB_CONNECTION_FAILED' });
   ```

### Frontend Specific

1. **Subscribe in ViewModel**
   ```typescript
   export class MyViewModel {
     constructor(private events: EventBusFacade) {
       this.events.on('data:updated', (data) => {
         this.handleUpdate(data);
       });
     }
   }
   ```

2. **Clean Up in Component**
   ```typescript
   ngOnDestroy() {
     this.unsubscribe.forEach(fn => fn());
   }
   ```

3. **Use Signals for Reactivity**
   ```typescript
   eventCount = this.events.getSignal('window:created');
   ```

## Testing

### Test Event Publishing

```typescript
import { describe, it, expect } from 'bun:test';
import { events } from '@main/events';

describe('Event Bus', () => {
  it('should publish events', () => {
    let received = false;
    events.on('test:event', () => {
      received = true;
    });
    
    events.emit('test:event', {});
    expect(received).toBe(true);
  });
});
```

### Test Event Payload

```typescript
it('should pass payload correctly', () => {
  let payload: unknown;
  events.on('test:event', (p) => {
    payload = p;
  });
  
  events.emit('test:event', { data: 'test' });
  expect(payload).toEqual({ data: 'test' });
});
```

### Test Frontend Events

```typescript
import { TestBed } from '@angular/core/testing';
import { EventBusFacade } from '@core/events';

describe('EventBusFacade', () => {
  let events: EventBusFacade;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    events = TestBed.inject(EventBusFacade);
  });
  
  it('should publish events', () => {
    let received = false;
    events.on('test:event', () => {
      received = true;
    });
    
    events.emit('test:event', {});
    expect(received).toBe(true);
  });
});
```

## Debugging

### Enable Debug Mode

```typescript
events.enableDebug();
// Logs all events to console
```

### Log Events

```typescript
events.on('*', (channel, payload) => {
  console.log('Event:', channel, payload);
});
```

### Use DevTools

1. Navigate to `/devtools`
2. Select Events tab
3. View published events
4. Inspect event payloads
5. Monitor event flow

## Performance Considerations

### Minimize Event Volume

- Batch related events
- Debounce frequent events
- Use signals instead of events when possible

### Efficient Handlers

- Keep handlers fast
- Avoid blocking operations
- Use async handlers for I/O

### Memory Management

- Clean up subscriptions
- Use weak references when appropriate
- Monitor subscription count

## Troubleshooting

### Events Not Received

**Problem:** Subscribers not receiving events.

**Solution:**
1. Verify channel name matches
2. Check subscription timing
3. Ensure event is being published

### Memory Leaks

**Problem:** Memory usage increasing over time.

**Solution:**
1. Check for missing unsubscriptions
2. Use ngOnDestroy cleanup
3. Monitor subscription count

### Cross-Process Issues

**Problem:** Events not crossing process boundary.

**Solution:**
1. Use `broadcast()` instead of `emit()`
2. Verify IPC bridge is working
3. Check preload script

## Related Documentation

- [IPC Communication](ipc-communication.md) - IPC details
- [Architecture](architecture.md) - System design
- [Dependency Injection](dependency-injection.md) - DI system
