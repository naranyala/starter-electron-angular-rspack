/**
 * Dependency Injection Container
 * Supports singleton, transient, and scoped lifetimes
 * with automatic dependency resolution
 */

import type { Provider, ServiceDecoratorOptions, Token } from './tokens';
import {
  getInjectableMetadata,
  getConstructorDependencies,
  getInjectTokens,
} from './tokens';

interface ResolvedProvider<T> {
  instance?: T;
  factory?: (container?: Container) => T;
  useClass?: new (...args: any[]) => T;
  deps?: Token<unknown>[];
  scope: 'singleton' | 'transient' | 'scoped';
  metadata?: ServiceDecoratorOptions;
}

interface ScopeContext {
  id: string;
  instances: Map<Token<unknown>, unknown>;
  parent?: Container;
}

export class Container {
  private providers = new Map<Token<unknown>, ResolvedProvider<unknown>>();
  private singletons = new Map<Token<unknown>, unknown>();
  private scopedContexts = new Map<string, ScopeContext>();
  private currentScopeId: string | null = null;
  private isDisposed = false;

  /**
   * Register a provider with a factory function
   */
  register<T>(
    token: Token<T>,
    factory: (container?: Container) => T,
    scope: 'singleton' | 'transient' | 'scoped' = 'singleton'
  ): this {
    this.throwIfDisposed();
    this.providers.set(token, { factory, scope } as ResolvedProvider<T>);
    return this;
  }

  /**
   * Register a pre-created instance (use sparingly)
   */
  registerValue<T>(token: Token<T>, value: T): this {
    this.throwIfDisposed();
    this.providers.set(token, { instance: value, scope: 'singleton' } as ResolvedProvider<T>);
    return this;
  }

  /**
   * Register a class to be instantiated by the container
   * Automatically resolves dependencies if not specified
   */
  registerClass<T>(
    token: Token<T>,
    useClass: new (...args: any[]) => T,
    options?: {
      scope?: 'singleton' | 'transient' | 'scoped';
      deps?: Token<unknown>[];
    }
  ): this {
    this.throwIfDisposed();
    
    const metadata = getInjectableMetadata(useClass as any);
    const autoDeps = getConstructorDependencies(useClass as any);
    const injectTokens = getInjectTokens(useClass as any);
    
    // Merge explicit deps with metadata
    let deps = options?.deps || metadata?.deps;
    
    if (!deps && autoDeps.length > 0) {
      // Apply @Inject token overrides
      deps = autoDeps.map((dep, idx) => {
        const override = injectTokens.get(idx);
        return (override as Token<unknown>) || (dep as Token<unknown>);
      });
    }

    this.providers.set(token, {
      useClass: useClass as any,
      scope: options?.scope || metadata?.scope || 'singleton',
      deps,
      metadata,
    } as ResolvedProvider<T>);
    return this;
  }

  /**
   * Register a provider configuration object
   */
  registerProvider<T>(provider: Provider<T>): this {
    this.throwIfDisposed();
    
    const { token, factory, value, useClass, deps, scope = 'singleton' } = provider;
    
    if (value !== undefined) {
      return this.registerValue(token, value);
    }
    
    if (useClass !== undefined) {
      return this.registerClass(token, useClass, { scope, deps });
    }
    
    if (factory !== undefined) {
      return this.register(token, factory, scope);
    }
    
    throw new Error(`Provider for ${String(token)} must have factory, value, or useClass`);
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: Token<T>): T {
    this.throwIfDisposed();
    
    const provider = this.providers.get(token) as ResolvedProvider<T> | undefined;

    if (!provider) {
      // Try auto-registration if token is a class with @Injectable
      if (typeof token === 'function') {
        const metadata = getInjectableMetadata(token as any);
        if (metadata) {
          this.registerClass(token as any, token as any);
          return this.resolve(token);
        }
      }
      throw new Error(`No provider registered for: ${String(token)}`);
    }

    // Return pre-created instance
    if (provider.instance) {
      return provider.instance;
    }

    // Handle scoped services
    if (provider.scope === 'scoped' && this.currentScopeId) {
      return this.resolveScoped(token, provider);
    }

    // Handle singleton services
    if (provider.scope === 'singleton') {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, this.createInstance(token, provider));
      }
      return this.singletons.get(token) as T;
    }

    // Transient or scoped without scope context - create new instance
    return this.createInstance(token, provider);
  }

  /**
   * Create a scoped container context
   * @example
   * const result = container.withScope('request', scope => {
   *   const handler = scope.resolve(RequestHandler);
   *   return handler.process();
   * });
   */
  withScope<T>(scopeId: string, fn: (scope: Container) => T): T {
    this.throwIfDisposed();
    
    const parentScope = this.currentScopeId;
    const scopeContext: ScopeContext = {
      id: scopeId,
      instances: new Map(),
      parent: this,
    };
    
    this.scopedContexts.set(scopeId, scopeContext);
    this.currentScopeId = scopeId;

    try {
      return fn(this);
    } finally {
      // Clean up scoped instances
      scopeContext.instances.clear();
      this.scopedContexts.delete(scopeId);
      this.currentScopeId = parentScope;
    }
  }

  /**
   * Check if a token is registered
   */
  has(token: Token<unknown>): boolean {
    return this.providers.has(token);
  }

  /**
   * Clear all registered providers and instances
   */
  clear(): this {
    this.throwIfDisposed();
    this.providers.clear();
    this.singletons.clear();
    this.scopedContexts.clear();
    this.currentScopeId = null;
    return this;
  }

  /**
   * Create a child container that inherits parent providers
   */
  createChild(): Container {
    this.throwIfDisposed();
    
    const child = new Container();
    // Copy provider references (not instances)
    child.providers = new Map(this.providers);
    return child;
  }

  /**
   * Dispose of the container and release resources
   */
  dispose(): void {
    if (this.isDisposed) return;
    
    // Clear all instances
    this.singletons.clear();
    this.scopedContexts.clear();
    this.providers.clear();
    this.isDisposed = true;
  }

  /**
   * Get all registered tokens (for debugging)
   */
  getRegisteredTokens(): Token<unknown>[] {
    return Array.from(this.providers.keys());
  }

  private throwIfDisposed(): void {
    if (this.isDisposed) {
      throw new Error('Container has been disposed');
    }
  }

  private resolveScoped<T>(token: Token<T>, provider: ResolvedProvider<T>): T {
    if (!this.currentScopeId) {
      // Fall back to transient behavior if no scope context
      return this.createInstance(token, provider);
    }

    const scopeContext = this.scopedContexts.get(this.currentScopeId);
    if (!scopeContext) {
      throw new Error(`Scope context not found: ${this.currentScopeId}`);
    }

    // Check if already created in this scope
    if (scopeContext.instances.has(token)) {
      return scopeContext.instances.get(token) as T;
    }

    // Create and cache in scope
    const instance = this.createInstance(token, provider);
    scopeContext.instances.set(token, instance);
    return instance;
  }

  private createInstance<T>(token: Token<T>, provider: ResolvedProvider<T>): T {
    if (provider.factory) {
      return provider.factory(this);
    }

    if (provider.useClass) {
      return this.instantiateClass(provider.useClass as any, provider.deps);
    }

    throw new Error(`Cannot create instance for: ${String(token)}`);
  }

  private instantiateClass<T>(
    Class: new (...args: unknown[]) => T,
    deps?: Token<unknown>[]
  ): T {
    if (!deps || deps.length === 0) {
      // Try to get dependencies from constructor metadata
      const autoDeps = getConstructorDependencies(Class as any);
      if (autoDeps.length > 0) {
        deps = autoDeps as Token<unknown>[];
      }
    }

    if (!deps || deps.length === 0) {
      // No dependencies - instantiate directly
      return new Class();
    }

    // Resolve dependencies recursively
    const resolvedDeps = deps.map(dep => this.resolve(dep));
    return new Class(...resolvedDeps);
  }
}

/**
 * Root container instance - use for application-wide DI
 */
export const container = new Container();

/**
 * Creates a new container with platform-specific providers
 */
export function createPlatformContainer(parent?: Container): Container {
  const platform = parent?.createChild() || new Container();
  platform.registerValue(Symbol('platform') as any, 'platform');
  return platform;
}
