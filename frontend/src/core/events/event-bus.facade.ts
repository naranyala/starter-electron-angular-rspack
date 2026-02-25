/**
 * Event Bus Facade - Frontend
 * 
 * Simplified API for the event bus system in Angular frontend.
 */

import { Injectable, signal, computed, Signal } from '@angular/core';
import { FrontendEventBus, type TypedEvent, type SubscriptionOptions, type PublishOptions } from './event-bus.js';

/**
 * Event listener function type
 */
export type EventListener<T = unknown> = (
  payload: T,
  meta: { id: string; timestamp: string; source: string }
) => void;

/**
 * Event Bus Facade for Angular
 */
@Injectable({ providedIn: 'root' })
export class EventBusFacade {
  constructor(private bus: FrontendEventBus) {}

  on<T>(
    channel: string,
    handler: EventListener<T>,
    options?: SubscriptionOptions
  ): () => void {
    return this.bus.subscribe(channel, (event) => {
      handler(event.payload as T, {
        id: event.id,
        timestamp: event.timestamp,
        source: event.source,
      });
    }, options);
  }

  once<T>(
    channel: string,
    handler: (payload: T) => void,
    options?: Omit<SubscriptionOptions, 'once'>
  ): () => void {
    return this.bus.once(channel, (event) => {
      handler(event.payload as T);
    }, options);
  }

  emit<T>(
    channel: string,
    payload: T,
    options?: PublishOptions
  ): void {
    this.bus.publish(channel, payload, options);
  }

  sendToMain<T>(
    channel: string,
    payload: T,
    options?: Omit<PublishOptions, 'crossProcess'>
  ): void {
    this.bus.publish(channel, payload, { ...options, crossProcess: true });
  }

  getSignal(channel: string): Signal<number> {
    return this.bus.getSignal(channel);
  }

  getLatest<T>(channel: string): Signal<T | null> {
    return computed(() => {
      const latest = this.bus.getLatest(channel);
      return latest ? (latest.payload as T) : null;
    });
  }

  select<T, R>(
    channel: string,
    selector: (payload: T) => R
  ): Signal<R | null> {
    return computed(() => {
      const latest = this.bus.getLatest(channel);
      return latest ? selector(latest.payload as T) : null;
    });
  }

  navigationStart(from: string, to: string, params?: Record<string, unknown>): void {
    this.emit('navigation:start', { from, to, params });
  }

  navigationComplete(from: string, to: string, params?: Record<string, unknown>): void {
    this.emit('navigation:complete', { from, to, params });
  }

  log(level: string, namespace: string, message: string, context?: Record<string, unknown>): void {
    this.emit('log:entry', { level, namespace, message, context });
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.emit('error:occurred', {
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'error',
      message,
      stack: error?.stack,
      context,
      recoverable: true,
    });
  }

  getHistory(channel?: string, limit?: number) {
    return this.bus.getHistory(channel, limit);
  }

  clearHistory(channel?: string): void {
    this.bus.clearHistory(channel);
  }

  getStats() {
    return this.bus.getStats();
  }

  listenerCount(channel: string): number {
    return this.bus.getSubscriptionCount(channel);
  }

  hasListeners(channel: string): boolean {
    return this.bus.hasSubscribers(channel);
  }

  getChannels(): string[] {
    return Array.from(this.bus['subscriptions'].keys());
  }

  dispose(): void {
    this.bus.dispose();
  }
}
