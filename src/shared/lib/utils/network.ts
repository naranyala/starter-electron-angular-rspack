/**
 * Advanced networking utilities with caching, retries, and offline support
 */

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: 'no-cache' | 'reload' | 'force-cache' | 'only-if-cached' | 'default';
  cacheTTL?: number; // Time to live in milliseconds
  retryDelay?: number;
  signal?: AbortSignal;
  credentials?: 'omit' | 'same-origin' | 'include';
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
  url: string;
}

export interface NetworkConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cacheTTL?: number;
  interceptors?: {
    request?: (config: RequestOptions) => RequestOptions;
    response?: (response: ApiResponse) => ApiResponse;
  };
}

export class AdvancedHttpClient {
  private config: NetworkConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private pendingRequests: Map<string, Promise<ApiResponse>>;

  constructor(config: NetworkConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders
      },
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes default
      interceptors: config.interceptors || {}
    };
    
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Construct full URL
    const fullUrl = this.config.baseUrl ? `${this.config.baseUrl}${url}` : url;
    
    // Create cache key
    const cacheKey = `${options.method || 'GET'}:${fullUrl}:${JSON.stringify(options.body || '')}`;
    
    // Check cache first for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check for pending request to avoid duplicate calls
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Prepare request options
    const requestOptions = this.prepareRequest(fullUrl, options);
    
    // Apply request interceptor
    if (this.config.interceptors?.request) {
      requestOptions.options = this.config.interceptors.request(requestOptions.options);
    }

    // Create request promise
    const requestPromise = this.makeRequest<T>(requestOptions.url, requestOptions.options, cacheKey);
    
    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      
      // Apply response interceptor
      if (this.config.interceptors?.response) {
        return this.config.interceptors.response(response);
      }
      
      return response;
    } finally {
      // Remove pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async makeRequest<T>(
    url: string,
    options: RequestOptions,
    cacheKey: string
  ): Promise<ApiResponse<T>> {
    const maxRetries = options.retries ?? this.config.retries!;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
        
        if (options.signal) {
          options.signal.addEventListener('abort', () => controller.abort());
        }

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.text();
        const parsedData = responseData ? JSON.parse(responseData) : null;

        const apiResponse: ApiResponse<T> = {
          data: parsedData,
          status: response.status,
          headers: response.headers,
          ok: response.ok,
          url: response.url
        };

        // Cache successful GET responses
        if (response.ok && (options.method === 'GET' || !options.method)) {
          this.setCache(cacheKey, apiResponse, options.cacheTTL || this.config.cacheTTL);
        }

        return apiResponse;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        const delay = (options.retryDelay || 1000) * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private prepareRequest(url: string, options: RequestOptions) {
    const preparedOptions: RequestOptions = {
      method: options.method || 'GET',
      headers: {
        ...this.config.defaultHeaders,
        ...options.headers
      },
      ...(options.body && { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) }),
      credentials: options.credentials || 'same-origin'
    };

    return { url, options: preparedOptions };
  }

  private getFromCache<T>(cacheKey: string): ApiResponse<T> | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCache<T>(cacheKey: string, data: ApiResponse<T>, ttl: number) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Convenience methods
  get<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  post<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  put<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  delete<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  patch<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  removeCache(key: string): void {
    this.cache.delete(key);
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Offline-first utilities
 */
export class OfflineManager {
  private online: boolean;
  private retryQueue: Array<() => Promise<any>>;
  private subscribers: Array<(online: boolean) => void>;

  constructor() {
    this.online = navigator.onLine;
    this.retryQueue = [];
    this.subscribers = [];

    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  private setOnline(online: boolean): void {
    this.online = online;
    this.subscribers.forEach(subscriber => subscriber(online));
    
    if (online) {
      this.processQueue();
    }
  }

  isOnline(): boolean {
    return this.online;
  }

  subscribe(callback: (online: boolean) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  async executeWhenOnline<T>(operation: () => Promise<T>): Promise<T> {
    if (this.online) {
      return operation();
    }

    return new Promise<T>((resolve, reject) => {
      const queuedOperation = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.retryQueue.push(queuedOperation);

      // Also try when we come back online
      const unsubscribe = this.subscribe(isOnline => {
        if (isOnline) {
          this.processQueue();
          unsubscribe();
        }
      });
    });
  }

  private async processQueue(): Promise<void> {
    while (this.retryQueue.length > 0) {
      const operation = this.retryQueue.shift()!;
      try {
        await operation();
      } catch (error) {
        console.error('Failed to execute queued operation:', error);
        // Put it back at the front of the queue
        this.retryQueue.unshift(operation);
        break;
      }
    }
  }
}

/**
 * WebSocket utilities
 */
export interface WebSocketConfig {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private config: WebSocketConfig;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Array<(data: any) => void>> = new Map();
  private eventHandlers: {
    onOpen?: () => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    onMessage?: (data: any) => void;
  } = {};

  constructor(url: string, config: WebSocketConfig = {}) {
    this.url = url;
    this.config = {
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000
    };
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = (event) => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      if (this.eventHandlers.onOpen) this.eventHandlers.onOpen();
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      if (this.eventHandlers.onClose) this.eventHandlers.onClose(event);
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.config.maxReconnectAttempts!) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.config.reconnectInterval);
      }
    };

    this.ws.onerror = (event) => {
      if (this.eventHandlers.onError) this.eventHandlers.onError(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle specific message types
        if (data.type && this.messageHandlers.has(data.type)) {
          const handlers = this.messageHandlers.get(data.type)!;
          handlers.forEach(handler => handler(data.payload));
        }
        
        // Handle general messages
        if (this.eventHandlers.onMessage) this.eventHandlers.onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  onMessage(type: string, handler: (data: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);

    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  on(event: 'open' | 'close' | 'error' | 'message', handler: any): () => void {
    switch (event) {
      case 'open':
        this.eventHandlers.onOpen = handler;
        break;
      case 'close':
        this.eventHandlers.onClose = handler;
        break;
      case 'error':
        this.eventHandlers.onError = handler;
        break;
      case 'message':
        this.eventHandlers.onMessage = handler;
        break;
    }

    return () => {
      if (this.eventHandlers[event] === handler) {
        delete this.eventHandlers[event];
      }
    };
  }

  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}