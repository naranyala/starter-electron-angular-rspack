/**
 * Backend Event Bus Implementation
 * 
 * A powerful, type-safe event bus for the Electron main process.
 * Supports priorities, acknowledgments, event history, and cross-process communication.
 * 
 * @module main/events
 */

import { ipcMain, WebContents } from 'electron';
import {
  type BaseEvent,
  type EventChannel,
  type EventHandler,
  type EventHistoryEntry,
  type EventPriority,
  type PublishOptions,
  type SubscriptionOptions,
  type EventBusStats,
  type TypedEvent,
  type EventSource,
} from '../../shared/events/types';
import { IPC_CHANNELS } from '../../shared/ipc/channels';

/**
 * Internal subscription representation
 */
interface Subscription {
  id: string;
  channel: string;
  handler: EventHandler;
  options: SubscriptionOptions;
  createdAt: number;
}

/**
 * Event Bus configuration
 */
export interface EventBusConfig {
  /** Maximum events to keep in history */
  maxHistory: number;
  /** Enable event history tracking */
  enableHistory: boolean;
  /** Default acknowledgment timeout (ms) */
  defaultAckTimeout: number;
  /** Enable cross-process events */
  enableCrossProcess: boolean;
  /** Log all events (debug mode) */
  debug: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: EventBusConfig = {
  maxHistory: 100,
  enableHistory: true,
  defaultAckTimeout: 5000,
  enableCrossProcess: true,
  debug: false,
};

/**
 * Priority level numeric values for comparison
 */
const PRIORITY_LEVELS: Record<EventPriority, number> = {
  low: 1,
  normal: 2,
  high: 3,
  critical: 4,
};

/**
 * Main Process Event Bus
 * 
 * Features:
 * - Type-safe event channels
 * - Priority-based event handling
 * - Event history tracking
 * - Cross-process communication
 * - Acknowledgment support
 * - Subscription filtering
 * - Performance statistics
 * 
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 * 
 * // Subscribe to events
 * eventBus.subscribe('app:ready', (event) => {
 *   console.log('App ready:', event.payload);
 * });
 * 
 * // Publish events
 * await eventBus.publish('app:ready', {
 *   version: '1.0.0',
 *   environment: 'development',
 *   platform: process.platform
 * });
 * 
 * // Subscribe once
 * eventBus.subscribe('window:closed', handler, { once: true });
 * 
 * // High priority event
 * await eventBus.publish('error:occurred', payload, { priority: 'critical' });
 * ```
 */
export class EventBus {
  private subscriptions = new Map<EventChannel, Set<Subscription>>();
  private history: EventHistoryEntry[] = [];
  private stats: EventBusStats = {
    totalPublished: 0,
    totalReceived: 0,
    activeSubscriptions: 0,
    historySize: 0,
    avgHandlingTime: 0,
    eventsByChannel: {},
  };
  private handlingTimes: number[] = [];
  private config: EventBusConfig;
  private webContents: WebContents | null = null;
  private isDisposed = false;

  constructor(config?: Partial<EventBusConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (this.config.debug) {
      console.log('[EventBus] Initialized with config:', this.config);
    }
  }

  /**
   * Subscribe to an event channel
   */
  subscribe<T extends EventChannel>(
    channel: T,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    this.throwIfDisposed();

    const subscription: Subscription = {
      id: this.generateId(),
      channel,
      handler,
      options,
      createdAt: Date.now(),
    };

    // Get or create subscription set for channel
    let channelSubs = this.subscriptions.get(channel);
    if (!channelSubs) {
      channelSubs = new Set();
      this.subscriptions.set(channel, channelSubs);
    }

    channelSubs.add(subscription);
    this.stats.activeSubscriptions++;

    if (this.config.debug) {
      console.log(`[EventBus] Subscribed to ${channel}`, { 
        subscriptionId: subscription.id,
        once: options.once 
      });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, subscription.id);
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T extends EventChannel>(
    channel: T,
    handler: EventHandler<T>,
    options: Omit<SubscriptionOptions, 'once'> = {}
  ): () => void {
    return this.subscribe(channel, handler, { ...options, once: true });
  }

  /**
   * Subscribe to multiple channels
   */
  subscribeMany<T extends EventChannel>(
    subscriptions: Array<{
      channel: T;
      handler: EventHandler<T>;
      options?: SubscriptionOptions;
    }>
  ): () => void {
    const unsubscribers = subscriptions.map(sub =>
      this.subscribe(sub.channel, sub.handler, sub.options)
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends EventChannel>(
    channel: T,
    payload: T extends keyof AllEvents 
      ? AllEvents[T] extends void 
        ? undefined 
        : AllEvents[T]
      : unknown,
    options: PublishOptions = {}
  ): Promise<void> {
    this.throwIfDisposed();

    const startTime = Date.now();
    const event: TypedEvent<typeof payload> = {
      id: this.generateId(),
      channel,
      timestamp: new Date().toISOString(),
      source: 'main',
      payload,
      priority: options.priority || 'normal',
      meta: options.meta,
    } as TypedEvent<typeof payload>;

    this.stats.totalPublished++;
    this.stats.eventsByChannel[channel] = (this.stats.eventsByChannel[channel] || 0) + 1;

    if (this.config.debug) {
      console.log(`[EventBus] Publishing ${channel}`, { 
        eventId: event.id,
        priority: event.priority 
      });
    }

    // Get subscribers for this channel
    const channelSubs = this.subscriptions.get(channel);
    if (!channelSubs || channelSubs.size === 0) {
      if (this.config.debug) {
        console.log(`[EventBus] No subscribers for ${channel}`);
      }
      return;
    }

    // Filter and sort subscribers by priority
    const subscribers = Array.from(channelSubs)
      .filter(sub => this.shouldReceiveEvent(event, sub))
      .sort((a, b) => 
        PRIORITY_LEVELS[b.options.minPriority || 'normal'] - 
        PRIORITY_LEVELS[a.options.minPriority || 'normal']
      );

    if (this.config.debug) {
      console.log(`[EventBus] Sending to ${subscribers.length} subscribers`);
    }

    // Handle event delivery
    const handlingPromises = subscribers.map(async sub => {
      const subStart = Date.now();
      let success = true;
      let error: string | undefined;

      try {
        if (sub.options.async) {
          await Promise.resolve(sub.handler(event));
        } else {
          sub.handler(event);
        }

        // Handle once subscriptions
        if (sub.options.once) {
          this.unsubscribe(channel, sub.id);
        }
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        console.error(`[EventBus] Handler error for ${channel}:`, error);
      }

      const handlingTime = Date.now() - subStart;
      this.updateStats(handlingTime);

      // Add to history
      if (this.config.enableHistory) {
        this.addToHistory(event, handlingTime, success, error);
      }
    });

    await Promise.all(handlingPromises);

    // Send to renderer if cross-process enabled
    if (options.crossProcess && this.config.enableCrossProcess && this.webContents) {
      this.sendToRenderer(channel, payload);
    }

    if (this.config.debug) {
      console.log(`[EventBus] Event ${channel} handled in ${Date.now() - startTime}ms`);
    }
  }

  /**
   * Publish event and wait for acknowledgments
   */
  async publishWithAck<T extends EventChannel>(
    channel: T,
    payload: T extends keyof AllEvents 
      ? AllEvents[T] extends void 
        ? undefined 
        : AllEvents[T]
      : unknown,
    options: PublishOptions & { ackTimeout?: number } = {}
  ): Promise<Array<{ subscriberId: string; ack: boolean; time: number }>> {
    const ackTimeout = options.ackTimeout || this.config.defaultAckTimeout;
    const acks: Array<{ subscriberId: string; ack: boolean; time: number }> = [];

    // Publish event with ack requirement
    await this.publish(channel, payload, { ...options, requiresAck: true });

    // Wait for acknowledgments (simplified - in real impl would use IPC)
    await new Promise(resolve => setTimeout(resolve, ackTimeout));

    return acks;
  }

  /**
   * Get event history
   */
  getHistory(channel?: EventChannel, limit?: number): EventHistoryEntry[] {
    let history = this.history;

    if (channel) {
      history = history.filter(entry => entry.event.channel === channel);
    }

    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory(channel?: EventChannel): void {
    if (channel) {
      this.history = this.history.filter(entry => entry.event.channel !== channel);
    } else {
      this.history = [];
    }

    if (this.config.debug) {
      console.log('[EventBus] History cleared', { channel });
    }
  }

  /**
   * Get statistics
   */
  getStats(): EventBusStats {
    return {
      ...this.stats,
      historySize: this.history.length,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalPublished: 0,
      totalReceived: 0,
      activeSubscriptions: 0,
      historySize: 0,
      avgHandlingTime: 0,
      eventsByChannel: {},
    };
    this.handlingTimes = [];
  }

  /**
   * Set renderer web contents for cross-process events
   */
  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
    this.setupIpcHandlers();
  }

  /**
   * Get subscription count for a channel
   */
  getSubscriptionCount(channel: EventChannel): number {
    const subs = this.subscriptions.get(channel);
    return subs ? subs.size : 0;
  }

  /**
   * Get all subscribed channels
   */
  getSubscribedChannels(): EventChannel[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if channel has subscribers
   */
  hasSubscribers(channel: EventChannel): boolean {
    const subs = this.subscriptions.get(channel);
    return subs ? subs.size > 0 : false;
  }

  /**
   * Dispose of the event bus
   */
  dispose(): void {
    this.subscriptions.clear();
    this.history = [];
    this.webContents = null;
    this.isDisposed = true;

    if (this.config.debug) {
      console.log('[EventBus] Disposed');
    }
  }

  private unsubscribe(channel: EventChannel, subscriptionId: string): void {
    const channelSubs = this.subscriptions.get(channel);
    if (!channelSubs) return;

    const sub = Array.from(channelSubs).find(s => s.id === subscriptionId);
    if (sub) {
      channelSubs.delete(sub);
      this.stats.activeSubscriptions--;

      if (channelSubs.size === 0) {
        this.subscriptions.delete(channel);
      }

      if (this.config.debug) {
        console.log(`[EventBus] Unsubscribed from ${channel}`, { subscriptionId });
      }
    }
  }

  private shouldReceiveEvent(event: TypedEvent<unknown>, sub: Subscription): boolean {
    // Check priority filter
    if (sub.options.minPriority) {
      const eventPriority = PRIORITY_LEVELS[(event as PriorityEvent).priority || 'normal'];
      const minPriority = PRIORITY_LEVELS[sub.options.minPriority];
      if (eventPriority < minPriority) {
        return false;
      }
    }

    // Check custom filter
    if (sub.options.filter && !sub.options.filter(event)) {
      return false;
    }

    return true;
  }

  private updateStats(handlingTime: number): void {
    this.stats.totalReceived++;
    this.handlingTimes.push(handlingTime);

    // Keep last 100 handling times for average calculation
    if (this.handlingTimes.length > 100) {
      this.handlingTimes.shift();
    }

    this.stats.avgHandlingTime = 
      this.handlingTimes.reduce((a, b) => a + b, 0) / this.handlingTimes.length;
  }

  private addToHistory(
    event: TypedEvent<unknown>,
    handlingTime: number,
    success: boolean,
    error?: string
  ): void {
    const entry: EventHistoryEntry = {
      event: event as BaseEvent,
      handledAt: new Date().toISOString(),
      handlingTime,
      success,
      error,
    };

    this.history.push(entry);

    // Trim history if exceeds max
    if (this.history.length > this.config.maxHistory) {
      this.history.shift();
    }
  }

  private sendToRenderer(channel: string, payload: unknown): void {
    if (!this.webContents || this.webContents.isDestroyed()) return;

    this.webContents.send(IPC_CHANNELS.EVENT.PUBLISH, {
      channel,
      payload,
      timestamp: new Date().toISOString(),
      source: 'main',
    });
  }

  private setupIpcHandlers(): void {
    // Listen for events from renderer
    ipcMain.on(IPC_CHANNELS.EVENT.PUBLISH, (event, { channel, payload }) => {
      this.publish(channel as EventChannel, payload);
    });

    // Handle subscription requests
    ipcMain.handle(IPC_CHANNELS.EVENT.SUBSCRIBE, (event, channel: string) => {
      return true;
    });

    // Handle history requests
    ipcMain.handle(IPC_CHANNELS.EVENT.HISTORY, (event, channel?: string, limit?: number) => {
      return this.getHistory(channel as EventChannel, limit);
    });

    // Handle stats requests
    ipcMain.handle(IPC_CHANNELS.EVENT.STATS, () => {
      return this.getStats();
    });
  }

  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private throwIfDisposed(): void {
    if (this.isDisposed) {
      throw new Error('EventBus has been disposed');
    }
  }
}

// Import types needed for the implementation
import type { AllEvents } from './types';

/**
 * Singleton event bus instance
 */
export const eventBus = new EventBus();
