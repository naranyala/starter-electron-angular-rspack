# Event Bus System

Cross-process event communication system.

## Overview

The event bus provides type-safe, cross-process event communication between main and frontend processes.

## Backend Usage

### Subscribe

```typescript
import { events } from '@main/events';

events.on('window:created', (payload) => {
  console.log('Window:', payload.title);
});
```

### Publish

```typescript
// Local
events.emit('window:created', payload);

// Cross-process
events.broadcast('navigation:complete', {
  from: 'home',
  to: 'settings'
});

// High priority
events.alert('error:occurred', errorData);
```

## Frontend Usage

### Subscribe

```typescript
import { EventBusFacade } from '@core/events';

constructor(private events: EventBusFacade) {
  this.events.on('window:created', (payload) => {
    console.log('Window:', payload.title);
  });
}
```

### Publish

```typescript
// Local
this.events.emit('navigation:start', {
  from: 'home',
  to: 'settings'
});

// To main process
this.events.sendToMain('window:create', options);
```

### Reactive Signals

```typescript
// Event count signal
windowCount = this.events.getSignal('window:created');

// Latest payload signal
lastWindow = this.events.getLatest('window:created');

// Custom selector
windowTitle = this.events.select(
  'window:created',
  (payload) => payload.title
);
```

## Built-in Events

### App Events

- `app:ready` - Application started
- `app:shutdown` - Application shutting down
- `app:minimize` - Window minimized
- `app:maximize` - Window maximized

### Window Events

- `window:created` - New window created
- `window:closed` - Window closed
- `window:focused` - Window focused
- `window:bounds-changed` - Window resized

### Log Events

- `log:entry` - Log message
- `log:level-change` - Log level changed

### Error Events

- `error:occurred` - Error occurred
- `error:recovered` - Error recovered

## Best Practices

1. Use type-safe event channels
2. Handle errors in handlers
3. Clean up subscriptions
4. Use appropriate priority
5. Add metadata for tracing

## Related Documentation

- IPC Communication - IPC details
- Architecture - System design
