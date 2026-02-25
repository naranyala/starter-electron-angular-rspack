/**
 * Enhanced state management utilities for reactive applications
 */

export interface Store<T> {
  getState(): T;
  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void;
  subscribe(listener: (state: T) => void): () => void;
  destroy(): void;
}

export interface StoreOptions {
  name?: string;
  persist?: boolean;
  storage?: Storage;
  throttleMs?: number;
}

export class ReactiveStore<T extends Record<string, any>> implements Store<T> {
  private state: T;
  private listeners: Array<(state: T) => void> = [];
  private options: StoreOptions;
  private throttledUpdates: Map<string, number> = new Map();

  constructor(initialState: T, options: StoreOptions = {}) {
    this.state = { ...initialState };
    this.options = {
      name: options.name,
      persist: options.persist ?? false,
      storage: options.storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined),
      throttleMs: options.throttleMs ?? 0,
    };

    // Load persisted state if applicable
    if (this.options.persist && this.options.name && this.options.storage) {
      this.loadPersistedState();
    }
  }

  getState(): T {
    return { ...this.state };
  }

  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void {
    const newState = typeof partial === 'function' ? partial(this.state) : partial;
    
    // Apply throttling if configured
    if (this.options.throttleMs > 0) {
      const key = JSON.stringify(newState);
      const now = Date.now();
      const lastUpdate = this.throttledUpdates.get(key) || 0;
      
      if (now - lastUpdate < this.options.throttleMs) {
        return;
      }
      this.throttledUpdates.set(key, now);
    }

    this.state = { ...this.state, ...newState };

    // Persist state if applicable
    if (this.options.persist && this.options.name && this.options.storage) {
      this.persistState();
    }

    this.notifyListeners();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  destroy(): void {
    this.listeners = [];
    this.throttledUpdates.clear();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private loadPersistedState(): void {
    try {
      const stored = this.options.storage!.getItem(`store_${this.options.name}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...this.state, ...parsed };
      }
    } catch (error) {
      console.warn(`Failed to load persisted state for store ${this.options.name}:`, error);
    }
  }

  private persistState(): void {
    try {
      this.options.storage!.setItem(`store_${this.options.name}`, JSON.stringify(this.state));
    } catch (error) {
      console.warn(`Failed to persist state for store ${this.options.name}:`, error);
    }
  }
}

/**
 * Memoization utility for expensive function calls
 */
export function memoize<T extends (...args: any[]) => any>(fn: T, resolver?: (...args: Parameters<T>) => string): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn.apply(this, args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Debounce with immediate execution option
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(this: any, ...args: Parameters<T>): any {
    const callNow = immediate && !timeout;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  } as T;
}

/**
 * Rate limiter utility
 */
export class RateLimiter {
  private calls: number[] = [];
  private interval: number; // in milliseconds
  private maxCalls: number;

  constructor(maxCalls: number, interval: number) {
    this.maxCalls = maxCalls;
    this.interval = interval;
  }

  isAllowed(): boolean {
    const now = Date.now();
    // Remove calls that are outside the interval window
    this.calls = this.calls.filter(callTime => now - callTime < this.interval);
    
    if (this.calls.length < this.maxCalls) {
      this.calls.push(now);
      return true;
    }
    
    return false;
  }

  async waitForAvailable(): Promise<void> {
    while (!this.isAllowed()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

/**
 * Batch processor for grouping operations
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private timer: NodeJS.Timeout | null = null;
  private batchSize: number;
  private interval: number;
  private processor: (items: T[]) => Promise<void>;

  constructor(
    processor: (items: T[]) => Promise<void>,
    options: { batchSize?: number; interval?: number } = {}
  ) {
    this.processor = processor;
    this.batchSize = options.batchSize ?? 10;
    this.interval = options.interval ?? 1000;
  }

  async add(item: T): Promise<void> {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.processQueue();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.processQueue(), this.interval);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length > 0) {
      const items = [...this.queue];
      this.queue = [];
      
      try {
        await this.processor(items);
      } catch (error) {
        console.error('Batch processor error:', error);
        // Optionally re-queue failed items
        this.queue.push(...items);
      }
    }
  }

  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this.processQueue();
  }
}

/**
 * Advanced caching with TTL and LRU eviction
 */
export interface CacheOptions {
  maxAge?: number; // TTL in milliseconds
  maxSize?: number; // Maximum number of items
  staleWhileRevalidate?: boolean; // Allow serving stale items while revalidating
}

export class AdvancedCache {
  private cache: Map<string, { value: any; timestamp: number; size: number }>;
  private options: CacheOptions;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.options = options;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if item is expired
    if (this.options.maxAge && Date.now() - item.timestamp > this.options.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Apply per-item options or use defaults
    const maxAge = options?.maxAge ?? this.options.maxAge;
    
    // Evict oldest items if cache is too large
    if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size: JSON.stringify(value).length
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Error boundary pattern for catching and handling errors gracefully
 */
export interface ErrorBoundaryHandler {
  handleError(error: Error, context?: string): void;
  getFallback(error: Error): any;
}

export class ErrorBoundary {
  private errorHandler: ErrorBoundaryHandler;
  private lastError: Error | null = null;

  constructor(handler: ErrorBoundaryHandler) {
    this.errorHandler = handler;
  }

  async execute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
    try {
      const result = await operation();
      this.lastError = null; // Reset error state on success
      return result;
    } catch (error) {
      this.lastError = error as Error;
      this.errorHandler.handleError(error as Error, context);
      throw error;
    }
  }

  executeSync<T>(operation: () => T, context?: string): T {
    try {
      const result = operation();
      this.lastError = null; // Reset error state on success
      return result;
    } catch (error) {
      this.lastError = error as Error;
      this.errorHandler.handleError(error as Error, context);
      throw error;
    }
  }

  hasError(): boolean {
    return this.lastError !== null;
  }

  getLastError(): Error | null {
    return this.lastError;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    jitter = true,
    retryCondition = () => true
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts - 1 || !retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(baseDelay * Math.pow(factor, attempt), maxDelay);
      
      // Add jitter to prevent thundering herd
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}