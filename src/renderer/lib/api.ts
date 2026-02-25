/**
 * Enhanced HTTP API utilities for renderer process
 * Provides comprehensive HTTP client with caching, retries, and error handling
 */

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  baseURL?: string;
  headers?: Record<string, string>;
  // Include all properties from RequestInit
  method?: string;
  body?: BodyInit | null;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cacheOption?: RequestCache; // Renamed to avoid conflict
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal;
  window?: null;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
  url: string;
  cached: boolean;
  timestamp: number;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: any;
  config?: RequestOptions;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiration: number;
  url: string;
}

export class ApiClient {
  private baseURL: string = '';
  private defaultHeaders: Record<string, string> = {};
  private cache: Map<string, CacheEntry> = new Map();
  private interceptors: {
    request: Array<(config: RequestOptions) => RequestOptions>;
    response: Array<(response: ApiResponse) => ApiResponse>;
  } = { request: [], response: [] };

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.setupDefaults();
  }

  /**
   * Setup default configuration
   */
  private setupDefaults(): void {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...this.defaultHeaders,
    };
  }

  /**
   * Build full URL
   */
  private buildURL(url: string, baseURL?: string): string {
    const base = baseURL || this.baseURL;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return base ? `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url;
  }

  /**
   * Make HTTP request with enhanced features
   */
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const config = this.mergeConfig(options);
    const fullURL = this.buildURL(url, config.baseURL);
    const cacheKey = this.getCacheKey(fullURL, config);

    // Check cache first
    if (config.cache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    // Apply request interceptors
    const finalConfig = this.applyRequestInterceptors(config);

    try {
      const response = await this.fetchWithRetry(fullURL, finalConfig);
      const data = await this.parseResponse(response);

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        ok: response.ok,
        url: response.url,
        cached: false,
        timestamp: Date.now(),
      };

      // Apply response interceptors
      const finalResponse = this.applyResponseInterceptors(apiResponse);

      // Cache successful responses
      if (config.cache && response.ok) {
        this.setCache(cacheKey, data, config.cacheTTL);
      }

      return finalResponse;
    } catch (error: any) {
      throw this.createApiError(error, config, fullURL);
    }
  }

  /**
   * Fetch with retry mechanism
   */
  private async fetchWithRetry(
    url: string,
    config: RequestOptions,
    attempt: number = 1
  ): Promise<Response> {
    const timeout = config.timeout || 10000;
    const retries = config.retries || 3;
    const retryDelay = config.retryDelay || 1000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      if (attempt <= retries && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying (${attempt}/${retries}):`, error.message);
        await this.delay(retryDelay * attempt);
        return this.fetchWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    return false;
  }

  /**
   * Delay function for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Parse response body
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return response.json();
    } else if (contentType.includes('text/')) {
      return response.text();
    } else {
      return response.blob();
    }
  }

  /**
   * Parse headers into plain object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Merge configurations
   */
  private mergeConfig(options: RequestOptions): RequestOptions {
    return {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };
  }

  /**
   * Create cache key
   */
  private getCacheKey(url: string, config: RequestOptions): string {
    const method = config.method || 'GET';
    const body = config.body ? JSON.stringify(config.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T = any>(key: string): ApiResponse<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiration) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      url: entry.url,
      cached: true,
      timestamp: entry.timestamp,
    };
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any, ttl: number = 300000): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + ttl,
      url: key,
    };

    this.cache.set(key, entry);
  }

  /**
   * Apply request interceptors
   */
  private applyRequestInterceptors(config: RequestOptions): RequestOptions {
    return this.interceptors.request.reduce(
      (currentConfig, interceptor) => interceptor(currentConfig),
      config
    );
  }

  /**
   * Apply response interceptors
   */
  private applyResponseInterceptors<T>(response: ApiResponse<T>): ApiResponse<T> {
    return this.interceptors.response.reduce(
      (currentResponse, interceptor) => interceptor(currentResponse) as ApiResponse<T>,
      response
    );
  }

  /**
   * Create API error
   */
  private createApiError(error: any, config: RequestOptions, url: string): ApiError {
    const apiError: ApiError = new Error(error.message) as ApiError;
    apiError.config = config;
    apiError.response = error.response;

    if (error.status) {
      apiError.status = error.status;
      apiError.statusText = error.statusText;
    }

    return apiError;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    url: string,
    file: File,
    options: RequestOptions & { onProgress?: (progress: number) => void } = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress!(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        const response: ApiResponse<T> = {
          data: JSON.parse(xhr.responseText),
          status: xhr.status,
          statusText: xhr.statusText,
          headers: this.parseXHRHeaders(xhr.getAllResponseHeaders()),
          ok: xhr.status >= 200 && xhr.status < 300,
          url: xhr.responseURL,
          cached: false,
          timestamp: Date.now(),
        };

        if (response.ok) {
          resolve(response);
        } else {
          reject(this.createApiError(new Error(xhr.statusText), options, url));
        }
      });

      xhr.addEventListener('error', () => {
        reject(this.createApiError(new Error('Network error'), options, url));
      });

      xhr.open('POST', this.buildURL(url, options.baseURL));

      // Set headers
      Object.entries({ ...this.defaultHeaders, ...options.headers }).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  }

  /**
   * Parse XHR headers
   */
  private parseXHRHeaders(headerString: string): Record<string, string> {
    const headers: Record<string, string> = {};
    headerString.split('\r\n').forEach((line) => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0]] = parts[1];
      }
    });
    return headers;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestOptions) => RequestOptions): void {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: ApiResponse) => ApiResponse): void {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: CacheEntry[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()),
    };
  }

  /**
   * Set base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Create default instance
export const api = new ApiClient();

// Utility functions for common patterns
export const apiUtils = {
  /**
   * Create authenticated client
   */
  createAuthenticatedClient(baseURL: string, token: string): ApiClient {
    return new ApiClient(baseURL, {
      Authorization: `Bearer ${token}`,
    });
  },

  /**
   * Retry failed request with exponential backoff
   */
  async withRetry<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<ApiResponse<T>> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        if (attempt === maxAttempts) {
          throw error;
        }

        const delay = baseDelay * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retry attempts exceeded');
  },

  /**
   * Batch multiple requests
   */
  async batchRequests<T>(
    requests: Array<() => Promise<ApiResponse<T>>>
  ): Promise<ApiResponse<T>[]> {
    return Promise.all(requests.map((req) => req()));
  },

  /**
   * Request with timeout
   */
  withTimeout<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    timeout: number = 5000
  ): Promise<ApiResponse<T>> {
    return Promise.race([
      requestFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      ),
    ]);
  },
};
