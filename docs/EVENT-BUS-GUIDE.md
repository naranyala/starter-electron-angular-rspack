# Event Bus System Guide

A comprehensive, type-safe event bus system for cross-process communication in Electron applications.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Backend Usage](#backend-usage)
- [Frontend Usage](#frontend-usage)
- [Cross-Process Communication](#cross-process-communication)
- [Event Types](#event-types)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Overview

The Event Bus System provides a unified, type-safe mechanism for publishing and subscribing to events across your Electron application. It supports:

- **Type-Safe Events**: Full TypeScript support with predefined event types
- **Cross-Process Communication**: Seamless event passing between main and renderer processes
- **Priority-Based Handling**: Process critical events before lower-priority ones
- **Event History**: Track and replay past events
- **Reactive Signals**: Angular signals for reactive programming
- **Acknowledgments**: Optional acknowledgment system for critical events
- **Performance Statistics**: Monitor event handling performance

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Process                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  EventBus   │  │   Facade     │  │   IPC Bridge    │    │
│  │             │  │              │  │                 │    │
│  │ - Subscribe │  │ - on()       │  │ - sendToRender  │    │
│  │ - Publish   │  │ - emit()     │  │ - receiveFrom   │    │
│  │ - History   │  │ - broadcast  │  │ - handlers      │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                    IPC Channels
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Angular Frontend                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │  EventBus   │  │   Facade     │  │   Components    │    │
│  │             │  │              │  │                 │    │
│  │ - subscribe │  │ - on()       │  │ - Signals       │    │
│  │ - publish   │  │ - emit()     │  │ - Templates     │    │
│  │ - signals   │  │ - select()   │  │ - Lifecycle     │    │
│  └─────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Installation

The event bus system is built into the project. Import from the shared module:

```typescript
// Backend (Main Process)
import { events, EventBus } from '@main/events';
import type { EventChannel, WindowEvents } from '@shared/events';

// Frontend (Angular)
import { EventBusFacade } from '@core/events';
import type { EventChannel } from '@shared/events';
```

## Backend Usage

### Basic Subscription

```typescript
import { events } from '@main/events';

// Subscribe to an event
const unsubscribe = events.on('app:ready', (payload) => {
  console.log('App ready:', payload);
});

// Unsubscribe when done
unsubscribe();
```

### Publishing Events

```typescript
import { events } from '@main/events';

// Publish an event
events.emit('window:created', {
  windowId: 'main',
  title: 'Main Window',
  bounds: { x: 0, y: 0, width: 1200, height: 800 }
});

// Broadcast to all processes
events.broadcast('navigation:complete', {
  from: 'home',
  to: 'settings'
});

// High-priority alert
events.alert('error:occurred', {
  errorId: '123',
  type: 'error',
  message: 'Critical error',
  recoverable: false
});
```

### Convenience Methods

```typescript
import { events } from '@main/events';

// App lifecycle
events.appReady({ version: '1.0.0', environment: 'dev', platform: 'linux' });
events.appShutdown('user-requested', 0);

// Window events
events.windowCreated(browserWindow);
events.windowClosed('main', 'user');

// Logging
events.log('info', 'app', 'Application started', { timestamp: Date.now() });
```

### Subscription Options

```typescript
import { events } from '@main/events';

// Subscribe once
events.once('window:closed', (payload) => {
  console.log('Window closed once');
});

// Filter events
events.on('log:entry', (payload) => {
  console.log('Error log:', payload);
}, {
  filter: (event) => payload.level === 'error'
});

// Async handler
events.on('data:loaded', async (payload) => {
  await processData(payload.data);
}, {
  async: true
});

// Minimum priority
events.on('alert', (payload) => {
  handleCritical(payload);
}, {
  minPriority: 'high'
});
```

## Frontend Usage

### Injecting the Event Bus

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventBusFacade } from '@core/events';

@Component({
  selector: 'app-my-component',
  template: `...`
})
export class MyComponent implements OnInit, OnDestroy {
  private unsubscribe: (() => void) | null = null;

  constructor(private events: EventBusFacade) {}

  ngOnInit() {
    this.unsubscribe = this.events.on('window:created', (payload) => {
      console.log('Window created:', payload);
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
```

### Reactive Signals

```typescript
import { Component, computed, signal } from '@angular/core';
import { EventBusFacade } from '@core/events';

@Component({
  selector: 'app-dashboard',
  template: `
    <p>Windows opened: {{ windowCount() }}</p>
    <p>Last window: {{ lastWindowTitle() }}</p>
  `
})
export class DashboardComponent {
  // Get event count as signal
  windowCount = this.events.getSignal('window:created');

  // Get latest payload as signal
  lastWindow = this.events.getLatest('window:created');

  // Create computed signal from event data
  lastWindowTitle = computed(() => {
    const latest = this.lastWindow();
    return latest ? latest.title : 'No windows';
  });

  // Custom selector
  windowBounds = this.events.select('window:created', (payload) => {
    return payload.bounds;
  });

  constructor(private events: EventBusFacade) {}
}
```

### Publishing from Frontend

```typescript
import { EventBusFacade } from '@core/events';

@Component({...})
export class NavigationComponent {
  constructor(private events: EventBusFacade) {}

  navigate(to: string) {
    // Emit local event
    this.events.emit('navigation:start', {
      from: 'current',
      to,
      params: { id: 123 }
    });

    // Send to main process
    this.events.sendToMain('log:entry', {
      level: 'info',
      namespace: 'navigation',
      message: `Navigating to ${to}`
    });
  }

  reportError(message: string, error?: Error) {
    this.events.error(message, error, {
      component: 'NavigationComponent'
    });
  }
}
```

## Cross-Process Communication

### Main to Frontend

```typescript
// Main process
import { events } from '@main/events';

// This automatically broadcasts to frontend
events.broadcast('window:resized', {
  windowId: 'main',
  width: 1200,
  height: 800
});
```

```typescript
// Frontend
import { EventBusFacade } from '@core/events';

@Component({...})
export class WindowComponent {
  constructor(private events: EventBusFacade) {
    // Receives events from main process
    this.events.on('window:resized', (payload) => {
      console.log('Window resized:', payload);
    });
  }
}
```

### Frontend to Main

```typescript
// Frontend
import { EventBusFacade } from '@core/events';

this.events.sendToMain('app:minimize', undefined);
```

```typescript
// Main process
import { events } from '@main/events';

events.on('app:minimize', () => {
  const window = BrowserWindow.getFocusedWindow();
  window?.minimize();
});
```

## Event Types

### Built-in Events

#### Application Events

```typescript
interface AppEvents {
  'app:ready': {
    version: string;
    environment: string;
    platform: string;
  };
  'app:shutdown': {
    reason: string;
    code: number;
  };
  'app:minimize': void;
  'app:maximize': void;
  'app:restore': void;
  'app:theme-change': { theme: 'light' | 'dark' };
}
```

#### Window Events

```typescript
interface WindowEvents {
  'window:created': {
    windowId: string;
    title: string;
    bounds: { x: number; y: number; width: number; height: number };
  };
  'window:closed': {
    windowId: string;
    reason: 'user' | 'programmatic' | 'error';
  };
  'window:focused': {
    windowId: string;
    previousWindowId?: string;
  };
  'window:bounds-changed': {
    windowId: string;
    bounds: { x: number; y: number; width: number; height: number };
    isUserAction: boolean;
  };
}
```

#### Logging Events

```typescript
interface LogEvents {
  'log:entry': {
    level: 'debug' | 'info' | 'warn' | 'error';
    namespace: string;
    message: string;
    context?: Record<string, unknown>;
    error?: { name: string; message: string; stack?: string };
  };
  'log:level-change': {
    oldLevel: string;
    newLevel: string;
  };
}
```

#### Error Events

```typescript
interface ErrorEvents {
  'error:occurred': {
    errorId: string;
    type: 'error' | 'warning' | 'exception';
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    recoverable: boolean;
  };
  'error:recovered': {
    errorId: string;
    recovery: string;
  };
}
```

#### Navigation Events

```typescript
interface NavigationEvents {
  'navigation:start': {
    from: string;
    to: string;
    params?: Record<string, unknown>;
  };
  'navigation:complete': {
    from: string;
    to: string;
    params?: Record<string, unknown>;
  };
  'navigation:error': {
    from: string;
    to: string;
    error: string;
  };
}
```

### Custom Events

Extend the event types by augmenting the interface:

```typescript
// In your types file
declare module '@shared/events' {
  interface AllEvents {
    'custom:event': {
      data: string;
      count: number;
    };
  }
}
```

## Advanced Features

### Event History

```typescript
import { events } from '@main/events';

// Get all history
const history = events.getHistory();

// Get history for specific channel
const windowHistory = events.getHistory('window:created');

// Limit results
const recent = events.getHistory('log:entry', 10);

// Clear history
events.clearHistory();
events.clearHistory('log:entry'); // Clear specific channel
```

### Statistics

```typescript
import { events } from '@main/events';

// Get statistics
const stats = events.getStats();
console.log(stats);
// {
//   totalPublished: 100,
//   totalReceived: 95,
//   activeSubscriptions: 15,
//   historySize: 50,
//   avgHandlingTime: 2.5,
//   eventsByChannel: { 'window:created': 10, ... }
// }

// Frontend: Get stats as signal
const stats = this.events.getStats();
```

### Priority Handling

```typescript
import { events } from '@main/events';

// Publish with priority
events.emit('alert', data, { priority: 'critical' });
events.emit('update', data, { priority: 'low' });

// Subscribe with minimum priority
events.on('alert', handler, { minPriority: 'high' });
```

### Event Metadata

```typescript
import { events } from '@main/events';

// Add metadata to events
events.emit('data:updated', data, {
  meta: {
    userId: '123',
    sessionId: 'abc',
    correlationId: 'xyz'
  }
});
```

## Best Practices

### 1. Use the Facade

Always use the facade (`events` or `EventBusFacade`) instead of the raw event bus:

```typescript
// Good
import { events } from '@main/events';
events.emit('event', payload);

// Avoid
import { EventBus } from '@main/events';
const bus = new EventBus();
bus.publish('event', payload);
```

### 2. Clean Up Subscriptions

Always unsubscribe in ngOnDestroy:

```typescript
@Component({...})
export class MyComponent implements OnDestroy {
  private unsubscribe: () => void;

  constructor(private events: EventBusFacade) {
    this.unsubscribe = this.events.on('event', handler);
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
```

### 3. Use Type-Safe Events

Always use defined event types:

```typescript
// Good
this.events.emit('window:created', {
  windowId: '1',
  title: 'Main',
  bounds: { x: 0, y: 0, width: 100, height: 100 }
});

// Avoid - loses type safety
this.events.emit('custom-string', anyData);
```

### 4. Handle Errors in Handlers

```typescript
events.on('data:loaded', (payload) => {
  try {
    process(payload);
  } catch (error) {
    console.error('Handler error:', error);
  }
});
```

### 5. Use Appropriate Priority

```typescript
// Critical errors should be high priority
events.alert('error:critical', errorData);

// Regular updates can be normal priority
events.emit('data:updated', data);

// Analytics can be low priority
events.emit('analytics:event', data, { priority: 'low' });
```

### 6. Leverage Signals in Angular

```typescript
// Good - reactive
windowCount = this.events.getSignal('window:created');

// Avoid - manual tracking
windowCount = 0;
this.events.on('window:created', () => this.windowCount++);
```

## API Reference

### Backend (Main Process)

#### EventBusFacade

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on` | `channel, handler, options?` | `() => void` | Subscribe to event |
| `once` | `channel, handler, options?` | `() => void` | Subscribe once |
| `onMany` | `subscriptions[]` | `() => void` | Subscribe to multiple |
| `emit` | `channel, payload, options?` | `void` | Publish event |
| `broadcast` | `channel, payload, options?` | `void` | Publish cross-process |
| `alert` | `channel, payload, options?` | `void` | High-priority publish |
| `getHistory` | `channel?, limit?` | `EventHistoryEntry[]` | Get event history |
| `getStats` | - | `EventBusStats` | Get statistics |
| `listenerCount` | `channel` | `number` | Get subscriber count |

### Frontend (Angular)

#### EventBusFacade

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `on` | `channel, handler, options?` | `() => void` | Subscribe to event |
| `once` | `channel, handler, options?` | `() => void` | Subscribe once |
| `emit` | `channel, payload, options?` | `void` | Publish event |
| `sendToMain` | `channel, payload, options?` | `void` | Send to main process |
| `getSignal` | `channel` | `Signal<number>` | Get event count signal |
| `getLatest` | `channel` | `Signal<T \| null>` | Get latest payload |
| `select` | `channel, selector` | `Signal<R \| null>` | Select from payload |
| `getHistory` | `channel?, limit?` | `EventHistoryEntry[]` | Get event history |
| `getStats` | - | `Signal<EventBusStats>` | Get statistics signal |

## Examples

### Complete Backend Example

```typescript
// src/main/app/app.component.ts
import { events } from '@main/events';
import { BrowserWindow } from 'electron';

export class AppComponent {
  private mainWindow: BrowserWindow | null = null;

  async initialize() {
    // Subscribe to window events
    events.on('window:closed', ({ windowId }) => {
      console.log(`Window ${windowId} closed`);
      if (windowId === 'main') {
        this.mainWindow = null;
      }
    });

    // Subscribe to navigation events
    events.on('navigation:complete', ({ to }) => {
      console.log(`Navigation completed to ${to}`);
    });

    // Create window and emit event
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800
    });

    events.windowCreated(this.mainWindow);

    // Emit app ready
    events.appReady({
      version: app.getVersion(),
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform
    });
  }
}
```

### Complete Frontend Example

```typescript
// frontend/src/app/components/window-manager.component.ts
import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { EventBusFacade } from '@core/events';

@Component({
  selector: 'app-window-manager',
  template: `
    <div class="window-stats">
      <p>Windows Opened: {{ windowCount() }}</p>
      <p>Last Window: {{ lastWindowTitle() }}</p>
    </div>
    
    <button (click)="createWindow()">Create Window</button>
    <button (click)="closeAllWindows()">Close All</button>
  `
})
export class WindowManagerComponent implements OnInit, OnDestroy {
  // Reactive signals
  windowCount = this.events.getSignal('window:created');
  lastWindow = this.events.getLatest('window:created');
  lastWindowTitle = computed(() => this.lastWindow()?.title || 'None');

  private subscriptions: (() => void)[] = [];

  constructor(private events: EventBusFacade) {}

  ngOnInit() {
    // Subscribe to window events
    this.subscriptions.push(
      this.events.on('window:closed', ({ windowId }) => {
        console.log(`Window closed: ${windowId}`);
        this.events.log('info', 'window-manager', `Window ${windowId} closed`);
      }),

      this.events.on('window:focused', ({ windowId }) => {
        console.log(`Window focused: ${windowId}`);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(unsub => unsub());
  }

  createWindow() {
    this.events.sendToMain('window:create', {
      title: 'New Window',
      width: 800,
      height: 600
    });
  }

  closeAllWindows() {
    this.events.sendToMain('window:close-all', undefined);
  }

  reportError(message: string, error?: Error) {
    this.events.error(message, error, {
      component: 'WindowManagerComponent'
    });
  }
}
```

---

For more information, see:
- `src/shared/events/types.ts` - Event type definitions
- `src/main/events/` - Backend implementation
- `frontend/src/core/events/` - Frontend implementation
