/**
 * Shared Event Bus Types
 * 
 * Type definitions for the event bus system used across main and renderer processes.
 * All events should be defined here for type safety.
 * 
 * @module shared/events
 */

/**
 * Base event interface that all events must extend
 */
export interface BaseEvent {
  /** Unique event ID */
  id: string;
  /** Event name/channel */
  channel: string;
  /** Event timestamp */
  timestamp: string;
  /** Event source (main, renderer, frontend) */
  source: EventSource;
  /** Optional event payload */
  payload?: unknown;
  /** Optional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Event source identifier
 */
export type EventSource = 'main' | 'renderer' | 'frontend';

/**
 * Event priority levels
 */
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Extended event with priority and acknowledgment
 */
export interface PriorityEvent extends BaseEvent {
  /** Event priority */
  priority: EventPriority;
  /** Whether acknowledgment is required */
  requiresAck: boolean;
}

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (event: TypedEvent<T>) => void | Promise<void>;

/**
 * Typed event with known payload type
 */
export interface TypedEvent<T = unknown> extends BaseEvent {
  payload: T;
}

/**
 * Event subscription options
 */
export interface SubscriptionOptions {
  /** Only receive events once */
  once?: boolean;
  /** Receive only events with specific priority or higher */
  minPriority?: EventPriority;
  /** Filter events by metadata */
  filter?: (event: BaseEvent) => boolean;
  /** Execute handler asynchronously */
  async?: boolean;
}

/**
 * Event publish options
 */
export interface PublishOptions {
  /** Event priority */
  priority?: EventPriority;
  /** Require acknowledgment from handlers */
  requiresAck?: boolean;
  /** Send to other processes (main <-> frontend) */
  crossProcess?: boolean;
  /** Timeout for acknowledgments (ms) */
  ackTimeout?: number;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  /** Total events published */
  totalPublished: number;
  /** Total events received */
  totalReceived: number;
  /** Active subscriptions count */
  activeSubscriptions: number;
  /** Events in history */
  historySize: number;
  /** Average handling time (ms) */
  avgHandlingTime: number;
  /** Events by channel */
  eventsByChannel: Record<string, number>;
}

/**
 * Event history entry
 */
export interface EventHistoryEntry {
  event: BaseEvent;
  handledAt: string;
  handlingTime: number;
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// APPLICATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Application lifecycle events payload types
 */
export interface AppReadyPayload {
  version: string;
  environment: string;
  platform: string;
}

export interface AppShutdownPayload {
  reason: string;
  code: number;
}

/**
 * Application events
 */
export interface AppEvents {
  'app:ready': AppReadyPayload;
  'app:shutdown': AppShutdownPayload;
  'app:minimize': void;
  'app:maximize': void;
  'app:restore': void;
  'app:theme-change': { theme: 'light' | 'dark' };
}

// ═══════════════════════════════════════════════════════════════════════════
// WINDOW EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Window events payload types
 */
export interface WindowCreatedPayload {
  windowId: string;
  title: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface WindowClosedPayload {
  windowId: string;
  reason: 'user' | 'programmatic' | 'error';
}

export interface WindowFocusedPayload {
  windowId: string;
  previousWindowId?: string;
}

export interface WindowBoundsChangedPayload {
  windowId: string;
  bounds: { x: number; y: number; width: number; height: number };
  isUserAction: boolean;
}

/**
 * Window events
 */
export interface WindowEvents {
  'window:created': WindowCreatedPayload;
  'window:closed': WindowClosedPayload;
  'window:focused': WindowFocusedPayload;
  'window:blurred': { windowId: string };
  'window:minimized': { windowId: string };
  'window:maximized': { windowId: string };
  'window:restored': { windowId: string };
  'window:bounds-changed': WindowBoundsChangedPayload;
  'window:resize-all': { width?: number; height?: number };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Log event payload
 */
export interface LogEventPayload {
  level: 'debug' | 'info' | 'warn' | 'error';
  namespace: string;
  message: string;
  context?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

/**
 * Logging events
 */
export interface LogEvents {
  'log:entry': LogEventPayload;
  'log:level-change': { oldLevel: string; newLevel: string };
  'log:clear': void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Error event payload
 */
export interface ErrorEventPayload {
  errorId: string;
  type: 'error' | 'warning' | 'exception';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

/**
 * Error events
 */
export interface ErrorEvents {
  'error:occurred': ErrorEventPayload;
  'error:recovered': { errorId: string; recovery: string };
  'error:cleared': { errorId: string };
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Navigation event payload
 */
export interface NavigationPayload {
  from: string;
  to: string;
  params?: Record<string, unknown>;
}

/**
 * Navigation events
 */
export interface NavigationEvents {
  'navigation:start': NavigationPayload;
  'navigation:complete': NavigationPayload;
  'navigation:error': NavigationPayload & { error: string };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA EVENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Data event payload types
 */
export interface DataLoadedPayload<T = unknown> {
  dataType: string;
  count: number;
  data?: T;
}

export interface DataUpdatedPayload<T = unknown> {
  dataType: string;
  id: string | number;
  changes: Partial<T>;
  previous?: T;
}

export interface DataDeletedPayload {
  dataType: string;
  id: string | number;
}

/**
 * Data events
 */
export interface DataEvents<T = unknown> {
  'data:loaded': DataLoadedPayload<T>;
  'data:updated': DataUpdatedPayload<T>;
  'data:deleted': DataDeletedPayload;
  'data:refresh': { dataType: string };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION OF ALL EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All registered event types
 * Extend this interface to add custom events
 */
export interface AllEvents extends 
  AppEvents, 
  WindowEvents, 
  LogEvents, 
  ErrorEvents,
  NavigationEvents,
  DataEvents {}

/**
 * Get event names as union type
 */
export type EventChannel = keyof AllEvents;

/**
 * Get payload type for a specific event channel
 */
export type EventPayload<T extends EventChannel> = 
  AllEvents[T] extends void ? undefined : AllEvents[T];

/**
 * Create a typed event
 */
export function createTypedEvent<T extends EventChannel>(
  channel: T,
  payload: EventPayload<T>,
  source: EventSource = 'main'
): TypedEvent<EventPayload<T>> {
  return {
    id: generateEventId(),
    channel,
    timestamp: new Date().toISOString(),
    source,
    payload: payload as EventPayload<T>,
  };
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
