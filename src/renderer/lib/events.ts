/**
 * Enhanced event utilities for renderer process
 * Provides comprehensive event handling, custom events, and state management
 */

export interface CustomEventData {
  [key: string]: any;
}

export interface EventSubscription {
  target: EventTarget;
  event: string;
  handler: EventListener;
  options?: AddEventListenerOptions;
}

export interface StateChangeEvent<T = any> extends CustomEvent {
  detail: {
    oldValue?: T;
    newValue: T;
    property?: string;
    timestamp: number;
  };
}

export class EventManager {
  private static instance: EventManager;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: CustomEvent[] = [];
  private maxHistorySize: number = 100;

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Create and dispatch custom event
   */
  createAndDispatch(
    target: EventTarget,
    eventName: string,
    detail?: CustomEventData,
    options?: CustomEventInit
  ): boolean {
    const event = this.createCustomEvent(eventName, detail, options);
    const success = target.dispatchEvent(event);

    // Add to history
    this.addToHistory(event);

    return success;
  }

  /**
   * Create custom event with enhanced options
   */
  createCustomEvent(
    name: string,
    detail?: CustomEventData,
    options: CustomEventInit = {}
  ): CustomEvent {
    return new CustomEvent(name, {
      detail: {
        timestamp: Date.now(),
        ...detail,
      },
      bubbles: true,
      cancelable: true,
      ...options,
    });
  }

  /**
   * Create state change event
   */
  createStateChangeEvent<T = any>(
    propertyName: string,
    oldValue: T | undefined,
    newValue: T
  ): StateChangeEvent<T> {
    return new CustomEvent('stateChange', {
      detail: {
        oldValue,
        newValue,
        property: propertyName,
        timestamp: Date.now(),
      },
    }) as StateChangeEvent<T>;
  }

  /**
   * Add event listener with subscription tracking
   */
  addEventListenerWithTracking(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const subscription: EventSubscription = {
      target,
      event,
      handler,
      options,
    };

    target.addEventListener(event, handler, options);

    if (!this.subscriptions.has(subscriptionId)) {
      this.subscriptions.set(subscriptionId, []);
    }
    this.subscriptions.get(subscriptionId)!.push(subscription);

    return subscriptionId;
  }

  /**
   * Remove event listener by subscription ID
   */
  removeEventListenerBySubscription(subscriptionId: string): boolean {
    const subscriptions = this.subscriptions.get(subscriptionId);
    if (!subscriptions) {
      return false;
    }

    subscriptions.forEach((sub) => {
      sub.target.removeEventListener(sub.event, sub.handler, sub.options);
    });

    this.subscriptions.delete(subscriptionId);
    return true;
  }

  /**
   * Add event listener with automatic cleanup
   */
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    target.addEventListener(event, handler, options);

    return () => {
      target.removeEventListener(event, handler, options);
    };
  }

  /**
   * Add multiple event listeners
   */
  addEventListeners(
    subscriptions: Array<{
      target: EventTarget;
      event: string;
      handler: EventListener;
      options?: AddEventListenerOptions;
    }>
  ): Array<() => void> {
    const cleanupFunctions: Array<() => void> = [];

    subscriptions.forEach(({ target, event, handler, options }) => {
      const cleanup = this.addEventListener(target, event, handler, options);
      cleanupFunctions.push(cleanup);
    });

    return cleanupFunctions;
  }

  /**
   * Create event bus for decoupled communication
   */
  createEventBus(): EventBus {
    return new EventBus();
  }

  /**
   * Debounce event handler
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          func(...args);
        }
      }, wait);

      if (callNow) {
        func(...args);
      }
    };
  }

  /**
   * Throttle event handler
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Once event listener - fires only once
   */
  once(target: EventTarget, event: string, handler: EventListener): void {
    const onceHandler = (e: Event) => {
      handler(e);
      target.removeEventListener(event, onceHandler);
    };

    target.addEventListener(event, onceHandler);
  }

  /**
   * Wait for event to occur
   */
  waitForEvent(target: EventTarget, event: string, timeout: number = 5000): Promise<Event> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;

      const cleanup = this.addEventListener(target, event, (e) => {
        clearTimeout(timeoutId);
        resolve(e);
      });

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error(`Event '${event}' did not occur within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Relay events from one target to another
   */
  relayEvents(
    source: EventTarget,
    target: EventTarget,
    events: string[],
    options?: {
      transform?: (event: Event) => Event;
      filter?: (event: Event) => boolean;
    }
  ): Array<() => void> {
    const cleanupFunctions: Array<() => void> = [];

    events.forEach((eventName) => {
      const handler = (originalEvent: Event) => {
        if (options?.filter && !options.filter(originalEvent)) {
          return;
        }

        const eventToDispatch = options?.transform
          ? options.transform(originalEvent)
          : new CustomEvent(eventName, { detail: originalEvent });

        target.dispatchEvent(eventToDispatch);
      };

      cleanupFunctions.push(this.addEventListener(source, eventName, handler));
    });

    return cleanupFunctions;
  }

  /**
   * Get event history
   */
  getEventHistory(maxItems?: number): CustomEvent[] {
    const items = maxItems || this.maxHistorySize;
    return this.eventHistory.slice(-items);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Generate subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add event to history
   */
  private addToHistory(event: CustomEvent): void {
    this.eventHistory.push(event);

    // Keep history size under limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((subscriptions, subscriptionId) => {
      subscriptions.forEach((sub) => {
        sub.target.removeEventListener(sub.event, sub.handler, sub.options);
      });
    });

    this.subscriptions.clear();
    this.clearEventHistory();
  }
}

/**
 * Event bus for decoupled communication
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: Map<string, CustomEvent[]> = new Map();

  /**
   * Subscribe to event
   */
  on(event: string, handler: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Subscribe to event (once)
   */
  once(event: string, handler: EventListener): void {
    const onceHandler = (e: Event) => {
      handler(e);
      this.off(event, onceHandler);
    };

    this.on(event, onceHandler);
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, handler: EventListener): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event: string, detail?: CustomEventData): void {
    const customEvent = new CustomEvent(event, {
      detail: {
        timestamp: Date.now(),
        ...detail,
      },
    });

    // Add to history
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, []);
    }
    const history = this.eventHistory.get(event)!;
    history.push(customEvent);

    // Keep history size limited
    if (history.length > 50) {
      history.shift();
    }

    // Notify listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(customEvent));
    }
  }

  /**
   * Get event history
   */
  getHistory(event?: string): CustomEvent[] | Map<string, CustomEvent[]> {
    if (event) {
      return this.eventHistory.get(event) || [];
    }
    return this.eventHistory;
  }

  /**
   * Clear event history
   */
  clearHistory(event?: string): void {
    if (event) {
      this.eventHistory.delete(event);
    } else {
      this.eventHistory.clear();
    }
  }

  /**
   * Get list of subscribed events
   */
  getEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for event
   */
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// Export singleton instance
export const events = EventManager.getInstance();
