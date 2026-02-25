/**
 * Event Bus Facade - Backend
 * 
 * Simplified API for the event bus system in the main process.
 * Provides convenient methods for common event patterns.
 */

import { EventBus, eventBus } from './event-bus.js';
import type { 
  EventChannel, 
  EventPayload, 
  EventHandler,
  SubscriptionOptions,
  PublishOptions,
  AppReadyPayload,
  WindowCreatedPayload,
  LogEventPayload,
} from '@shared/index.js';
import type { BrowserWindow } from 'electron';

/**
 * Event Bus Facade
 * 
 * Provides a simplified, high-level API for the event bus system.
 * Use this instead of the raw EventBus for most operations.
 */
export class EventBusFacade {
  constructor(private bus: EventBus = eventBus) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Subscribe to an event
   */
  on<T extends EventChannel>(
    channel: T,
    handler: (payload: EventPayload<T>, event: { id: string; timestamp: string; source: string }) => void,
    options?: SubscriptionOptions
  ): () => void {
    return this.bus.subscribe(channel, (event) => {
      handler(event.payload as EventPayload<T>, {
        id: event.id,
        timestamp: event.timestamp,
        source: event.source,
      });
    }, options);
  }

  /**
   * Subscribe to an event once
   */
  once<T extends EventChannel>(
    channel: T,
    handler: (payload: EventPayload<T>) => void,
    options?: Omit<SubscriptionOptions, 'once'>
  ): () => void {
    return this.bus.once(channel, (event) => {
      handler(event.payload as EventPayload<T>);
    }, options);
  }

  /**
   * Subscribe to multiple events
   */
  onMany<T extends EventChannel>(
    subscriptions: Array<{
      channel: T;
      handler: (payload: EventPayload<T>) => void;
      options?: SubscriptionOptions;
    }>
  ): () => void {
    return this.bus.subscribeMany(subscriptions.map(sub => ({
      channel: sub.channel,
      handler: (event) => sub.handler(event.payload as EventPayload<T>),
      options: sub.options,
    })));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLISH METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Publish an event
   */
  emit<T extends EventChannel>(
    channel: T,
    payload: EventPayload<T>,
    options?: PublishOptions
  ): void {
    this.bus.publish(channel, payload, options);
  }

  /**
   * Publish an event to other processes
   */
  broadcast<T extends EventChannel>(
    channel: T,
    payload: EventPayload<T>,
    options?: Omit<PublishOptions, 'crossProcess'>
  ): void {
    this.bus.publish(channel, payload, { ...options, crossProcess: true });
  }

  /**
   * Publish a high-priority event
   */
  alert<T extends EventChannel>(
    channel: T,
    payload: EventPayload<T>,
    options?: Omit<PublishOptions, 'priority'>
  ): void {
    this.bus.publish(channel, payload, { ...options, priority: 'high', crossProcess: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVENIENCE METHODS FOR COMMON EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Emit app ready event
   */
  appReady(payload: AppReadyPayload): void {
    this.broadcast('app:ready', payload);
  }

  /**
   * Emit app shutdown event
   */
  appShutdown(reason: string, code: number): void {
    this.broadcast('app:shutdown', { reason, code });
  }

  /**
   * Emit window created event
   */
  windowCreated(window: BrowserWindow): void {
    const bounds = window.getBounds();
    this.broadcast('window:created', {
      windowId: window.id.toString(),
      title: window.getTitle(),
      bounds,
    });
  }

  /**
   * Emit window closed event
   */
  windowClosed(windowId: string, reason: 'user' | 'programmatic' | 'error' = 'user'): void {
    this.broadcast('window:closed', { windowId, reason });
  }

  /**
   * Emit log entry event
   */
  log(level: LogEventPayload['level'], namespace: string, message: string, context?: Record<string, unknown>): void {
    this.emit('log:entry', {
      level,
      namespace,
      message,
      context,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get event history
   */
  getHistory(channel?: EventChannel, limit?: number) {
    return this.bus.getHistory(channel, limit);
  }

  /**
   * Clear event history
   */
  clearHistory(channel?: EventChannel): void {
    this.bus.clearHistory(channel);
  }

  /**
   * Get statistics
   */
  getStats() {
    return this.bus.getStats();
  }

  /**
   * Get subscription count for a channel
   */
  listenerCount(channel: EventChannel): number {
    return this.bus.getSubscriptionCount(channel);
  }

  /**
   * Check if channel has listeners
   */
  hasListeners(channel: EventChannel): boolean {
    return this.bus.hasSubscribers(channel);
  }

  /**
   * Get all channels with listeners
   */
  getChannels(): EventChannel[] {
    return this.bus.getSubscribedChannels();
  }

  /**
   * Set web contents for cross-process events
   */
  setWebContents(webContents: Electron.WebContents): void {
    this.bus.setWebContents(webContents);
  }

  /**
   * Dispose of the event bus
   */
  dispose(): void {
    this.bus.dispose();
  }
}

/**
 * Singleton facade instance
 */
export const events = new EventBusFacade();
