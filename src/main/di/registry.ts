/**
 * Service Registry Module
 * Provides automatic service discovery and registration
 */

import type { Container } from '../di/container';
import type { Token } from '../di/tokens';

/**
 * Service metadata for registry
 */
export interface ServiceMeta {
  /** Service name/identifier */
  name: string;
  /** Service class or token */
  token: Token<unknown>;
  /** Service class constructor */
  useClass?: new (...args: unknown[]) => unknown;
  /** Dependencies */
  deps?: Token<unknown>[];
  /** Scope */
  scope?: 'singleton' | 'transient' | 'scoped';
  /** Initialization order */
  order?: number;
  /** Whether to auto-initialize */
  autoInit?: boolean;
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Service registry entry
 */
export interface ServiceEntry {
  meta: ServiceMeta;
  initialized: boolean;
  instance?: unknown;
}

/**
 * Service Registry for managing application services
 * @example
 * const registry = new ServiceRegistry();
 * registry.register({ name: 'logger', token: LoggerService, autoInit: true });
 * registry.register({ name: 'window', token: WindowService, deps: [LoggerService] });
 * 
 * await registry.bootstrap(container);
 */
export class ServiceRegistry {
  private services = new Map<string, ServiceEntry>();
  private initialized = false;

  /**
   * Register a service
   */
  register(meta: ServiceMeta): this {
    const entry: ServiceEntry = {
      meta,
      initialized: false,
    };
    this.services.set(meta.name, entry);
    return this;
  }

  /**
   * Register multiple services at once
   */
  registerMany(metas: ServiceMeta[]): this {
    for (const meta of metas) {
      this.register(meta);
    }
    return this;
  }

  /**
   * Get a service by name
   */
  get(name: string): ServiceEntry | undefined {
    return this.services.get(name);
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered services
   */
  getAll(): ServiceEntry[] {
    return Array.from(this.services.values());
  }

  /**
   * Get services by tag
   */
  getByTag(tag: string): ServiceEntry[] {
    return this.getAll().filter(entry => entry.meta.tags?.includes(tag));
  }

  /**
   * Bootstrap all services with autoInit enabled
   */
  async bootstrap(container: Container): Promise<void> {
    if (this.initialized) {
      throw new Error('Registry already initialized');
    }

    // Sort by order
    const services = this.getAll().sort(
      (a, b) => (a.meta.order ?? 1000) - (b.meta.order ?? 1000)
    );

    for (const entry of services) {
      if (entry.meta.autoInit && entry.meta.useClass) {
        await this.initializeService(container, entry);
      } else if (entry.meta.useClass) {
        // Register but don't initialize yet
        container.registerClass(entry.meta.token, entry.meta.useClass as any, {
          scope: entry.meta.scope,
          deps: entry.meta.deps,
        });
      }
    }

    this.initialized = true;
  }

  /**
   * Initialize a specific service
   */
  async initializeService(container: Container, entry: ServiceEntry): Promise<void> {
    if (entry.initialized) {
      return;
    }

    const { meta } = entry;
    
    if (!meta.useClass) {
      throw new Error(`Cannot initialize service ${meta.name}: no useClass defined`);
    }

    // Register the service
    container.registerClass(meta.token, meta.useClass as any, {
      scope: meta.scope,
      deps: meta.deps,
    });

    // Resolve to trigger initialization
    const instance = container.resolve(meta.token);
    entry.instance = instance;
    entry.initialized = true;

    // Call onInit if exists
    if (typeof (instance as any).onInit === 'function') {
      await (instance as any).onInit();
    }

    console.log(`[ServiceRegistry] Initialized: ${meta.name}`);
  }

  /**
   * Initialize all services (including non-autoInit ones)
   */
  async initializeAll(container: Container): Promise<void> {
    for (const entry of this.getAll()) {
      if (!entry.initialized) {
        await this.initializeService(container, entry);
      }
    }
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the registry (for testing)
   */
  reset(): this {
    for (const entry of this.services.values()) {
      entry.initialized = false;
      entry.instance = undefined;
    }
    this.initialized = false;
    return this;
  }

  /**
   * Get service status report
   */
  getStatus(): Array<{ name: string; initialized: boolean; scope?: string }> {
    return this.getAll().map(entry => ({
      name: entry.meta.name,
      initialized: entry.initialized,
      scope: entry.meta.scope,
    }));
  }
}

/**
 * Global service registry instance
 */
export const serviceRegistry = new ServiceRegistry();
