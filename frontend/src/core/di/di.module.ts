/**
 * Frontend Dependency Injection Module
 * Provides Angular-compatible DI abstractions and factories
 */

import {
  InjectionToken,
  Injectable,
  inject,
} from '@angular/core';

/**
 * Injection token for application configuration
 */
export interface AppConfig {
  production: boolean;
  apiBaseUrl?: string;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableBackend: boolean;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Default application configuration
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  production: false,
  apiBaseUrl: '',
  logging: {
    level: 'debug',
    enableConsole: true,
    enableBackend: true,
  },
};

/**
 * Service registry for tracking registered services
 */
@Injectable({ providedIn: 'root' })
export class ServiceRegistry {
  private services = new Map<string, any>();
  private initialized = new Set<string>();

  /**
   * Register a service instance
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a registered service
   */
  get<T>(name: string): T | undefined {
    return this.services.get(name);
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Mark a service as initialized
   */
  markInitialized(name: string): void {
    this.initialized.add(name);
  }

  /**
   * Check if a service is initialized
   */
  isInitialized(name: string): boolean {
    return this.initialized.has(name);
  }

  /**
   * Get all registered services
   */
  getAll(): Array<{ name: string; initialized: boolean }> {
    return Array.from(this.services.keys()).map(name => ({
      name,
      initialized: this.initialized.has(name),
    }));
  }
}

/**
 * Helper to inject a service (wrapper around Angular's inject)
 */
export function injectService<T>(token: InjectionToken<T> | (new (...args: any[]) => T)): T {
  return inject(token as any);
}

/**
 * Module for core services
 */
@Injectable({ providedIn: 'root' })
export class CoreModule {
  constructor(private registry: ServiceRegistry) {
    this.registry.markInitialized('core');
  }
}
