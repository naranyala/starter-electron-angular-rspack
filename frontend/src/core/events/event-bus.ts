/**
 * Frontend Event Bus Implementation
 * 
 * Angular-compatible event bus with type-safe channels, 
 * cross-process communication, and reactive support.
 */

import { Injectable, NgZone, signal, computed } from '@angular/core';
import { ipcRenderer } from 'electron';

/**
 * Base event interface
 */
export interface BaseEvent {
  id: string;
  channel: string;
  timestamp: string;
  source: string;
  payload?: unknown;
}

/**
 * Typed event
 */
export interface TypedEvent<T = unknown> extends BaseEvent {
  payload: T;
}

/**
 * Event channel type
 */
export type EventChannel = string;

/**
 * Subscription options
 */
export interface SubscriptionOptions {
  once?: boolean;
  filter?: (event: BaseEvent) => boolean;
  async?: boolean;
}

/**
 * Publish options
 */
export interface PublishOptions {
  crossProcess?: boolean;
  meta?: Record<string, unknown>;
}

/**
 * Event bus statistics
 */
export interface EventBusStats {
  totalPublished: number;
  totalReceived: number;
  activeSubscriptions: number;
  historySize: number;
  eventsByChannel: Record<string, number>;
}

/**
 * Internal subscription
 */
interface Subscription {
  id: string;
  channel: string;
  handler: (event: TypedEvent<unknown>) => void;
  options: SubscriptionOptions;
}

/**
 * Frontend Event Bus
 */
@Injectable({ providedIn: 'root' })
export class FrontendEventBus {
  private subscriptions = new Map<EventChannel, Set<Subscription>>();
  private history: BaseEvent[] = [];
  private latestEvents = new Map<EventChannel, TypedEvent<unknown>>();
  private eventSignals = new Map<EventChannel, ReturnType<typeof signal<number>>>();
  private stats = signal<EventBusStats>({
    totalPublished: 0,
    totalReceived: 0,
    activeSubscriptions: 0,
    historySize: 0,
    eventsByChannel: {},
  });
  private isDisposed = false;

  constructor(private ngZone: NgZone) {
    this.setupIpcListeners();
  }

  subscribe<T extends EventChannel>(
    channel: T,
    handler: (event: TypedEvent<T>) => void,
    options: SubscriptionOptions = {}
  ): () => void {
    const subscription: Subscription = {
      id: this.generateId(),
      channel,
      handler: handler as (event: TypedEvent<unknown>) => void,
      options,
    };

    let channelSubs = this.subscriptions.get(channel);
    if (!channelSubs) {
      channelSubs = new Set();
      this.subscriptions.set(channel, channelSubs);
      this.updateStats();
    }

    channelSubs.add(subscription);

    return () => {
      this.unsubscribe(channel, subscription.id);
    };
  }

  once<T extends EventChannel>(
    channel: T,
    handler: (event: TypedEvent<T>) => void,
    options: Omit<SubscriptionOptions, 'once'> = {}
  ): () => void {
    return this.subscribe(channel, handler, { ...options, once: true });
  }

  publish<T extends EventChannel>(
    channel: T,
    payload: unknown,
    options: PublishOptions = {}
  ): void {
    const event: TypedEvent<unknown> = {
      id: this.generateId(),
      channel,
      timestamp: new Date().toISOString(),
      source: 'frontend',
      payload,
    };

    this.latestEvents.set(channel, event);
    this.notifySubscribers(event);

    if (options.crossProcess !== false) {
      ipcRenderer.send('event:publish', {
        channel,
        payload,
        timestamp: event.timestamp,
        source: 'frontend',
      });
    }

    const currentStats = this.stats();
    this.stats.set({
      ...currentStats,
      totalPublished: currentStats.totalPublished + 1,
      eventsByChannel: {
        ...currentStats.eventsByChannel,
        [channel]: (currentStats.eventsByChannel[channel] || 0) + 1,
      },
    });
  }

  getSignal<T extends EventChannel>(channel: T): ReturnType<typeof signal<number>> {
    if (!this.eventSignals.has(channel)) {
      this.eventSignals.set(channel, signal(0));
    }
    return this.eventSignals.get(channel)!;
  }

  getLatest<T extends EventChannel>(channel: T): TypedEvent<T> | null {
    return (this.latestEvents.get(channel) as TypedEvent<T>) || null;
  }

  getHistory(channel?: EventChannel, limit?: number): BaseEvent[] {
    let history = this.history;
    if (channel) {
      history = history.filter(entry => entry.channel === channel);
    }
    if (limit && limit > 0) {
      history = history.slice(-limit);
    }
    return history;
  }

  clearHistory(channel?: EventChannel): void {
    if (channel) {
      this.history = this.history.filter(entry => entry.channel !== channel);
    } else {
      this.history = [];
    }
  }

  getStats() {
    return this.stats.asReadonly();
  }

  getSubscriptionCount(channel: EventChannel): number {
    const subs = this.subscriptions.get(channel);
    return subs ? subs.size : 0;
  }

  hasSubscribers(channel: EventChannel): boolean {
    const subs = this.subscriptions.get(channel);
    return subs ? subs.size > 0 : false;
  }

  dispose(): void {
    this.subscriptions.clear();
    this.history = [];
    this.latestEvents.clear();
    this.isDisposed = true;
  }

  private unsubscribe(channel: EventChannel, subscriptionId: string): void {
    const channelSubs = this.subscriptions.get(channel);
    if (!channelSubs) return;

    const sub = Array.from(channelSubs).find(s => s.id === subscriptionId);
    if (sub) {
      channelSubs.delete(sub);
      this.updateStats();
      if (channelSubs.size === 0) {
        this.subscriptions.delete(channel);
      }
    }
  }

  private notifySubscribers(event: TypedEvent<unknown>): void {
    const channelSubs = this.subscriptions.get(event.channel);
    if (!channelSubs) return;

    const executeHandler = (sub: Subscription) => {
      try {
        sub.handler(event);
        if (sub.options.once) {
          this.unsubscribe(event.channel, sub.id);
        }
      } catch (err) {
        console.error(`[FrontendEventBus] Handler error:`, err);
      }
    };

    Array.from(channelSubs).forEach(sub => {
      if (this.ngZone) {
        this.ngZone.run(() => executeHandler(sub));
      } else {
        executeHandler(sub);
      }
    });

    const signal = this.eventSignals.get(event.channel);
    if (signal) {
      signal.update(count => count + 1);
    }
  }

  private setupIpcListeners(): void {
    ipcRenderer.on('event:publish', (event, { channel, payload }) => {
      const typedEvent: TypedEvent<unknown> = {
        id: this.generateId(),
        channel,
        timestamp: new Date().toISOString(),
        source: 'main',
        payload,
      };

      this.latestEvents.set(channel, typedEvent);
      this.notifySubscribers(typedEvent);
    });
  }

  private updateStats(): void {
    let count = 0;
    this.subscriptions.forEach(subs => {
      count += subs.size;
    });

    const currentStats = this.stats();
    this.stats.set({
      ...currentStats,
      activeSubscriptions: count,
    });
  }

  private generateId(): string {
    return `fev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
