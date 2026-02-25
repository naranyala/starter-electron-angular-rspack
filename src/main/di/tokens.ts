/**
 * Dependency Injection Tokens and Metadata
 * Provides type-safe injection tokens and service decorators
 */

import type { Container } from './container';

/**
 * Type-safe injection token for non-class dependencies
 * @example
 * const API_URL = new InjectionToken<string>('API_URL');
 * container.registerValue(API_URL, 'https://api.example.com');
 */
export class InjectionToken<T> {
  readonly $$typeof: symbol;
  
  constructor(public readonly description: string) {
    this.$$typeof = Symbol.for(`InjectionToken(${description})`);
  }

  toString(): string {
    return `InjectionToken(${this.description})`;
  }
}

export type Token<T> = InjectionToken<T> | (new (...args: any[]) => T);

/**
 * Provider configuration for a dependency
 */
export interface Provider<T> {
  /** The injection token or class */
  token: Token<T>;
  /** Factory function to create the instance */
  factory?: (container?: Container) => T;
  /** Pre-created instance (use with caution) */
  value?: T;
  /** Class to instantiate */
  useClass?: new (...args: any[]) => T;
  /** Dependencies to inject */
  deps?: Token<unknown>[];
  /** Service lifetime scope */
  scope?: 'singleton' | 'transient' | 'scoped';
}

/**
 * Service decorator options
 */
export interface ServiceDecoratorOptions {
  /** Service lifetime scope (default: 'singleton') */
  scope?: 'singleton' | 'transient';
  /** Named scope for scoped services */
  scopeName?: string;
  /** Where the service is provided (for documentation) */
  providedIn?: 'root' | 'platform' | string;
  /** Dependencies (auto-detected if not specified) */
  deps?: Token<unknown>[];
}

const INJECTABLE_METADATA_KEY = Symbol('injectable');

/**
 * Marks a class as injectable and configures its DI metadata
 * @example
 * @Injectable({ scope: 'singleton' })
 * export class LoggerService { ... }
 */
export function Injectable(options: ServiceDecoratorOptions = {}): ClassDecorator {
  return (target: Function) => {
    (Reflect as any).defineMetadata(
      INJECTABLE_METADATA_KEY,
      {
        scope: options.scope || 'singleton',
        providedIn: options.providedIn || 'root',
        scopeName: options.scopeName,
        deps: options.deps,
      },
      target
    );
    return target;
  };
}

/**
 * Gets injectable metadata from a class
 */
export function getInjectableMetadata(
  target: Function
): ServiceDecoratorOptions | undefined {
  return (Reflect as any).getMetadata(INJECTABLE_METADATA_KEY, target);
}

/**
 * Gets constructor parameter types for automatic dependency resolution
 */
export function getConstructorDependencies(
  target: Function
): Function[] {
  return (Reflect as any).getMetadata('design:paramtypes', target) || [];
}

export const ROOT_CONTAINER = 'ROOT_CONTAINER';
export const PLATFORM_CONTAINER = 'PLATFORM_CONTAINER';

/**
 * Optional decorator for marking constructor parameters
 * Useful for interface-based injection
 */
export function Inject(token: Token<unknown>): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const key = propertyKey ?? '';
    const existingTokens = (Reflect as any).getMetadata('inject:tokens', target, key) || new Map();
    existingTokens.set(parameterIndex, token);
    (Reflect as any).defineMetadata('inject:tokens', existingTokens, target, key);
  };
}

/**
 * Gets injection tokens for constructor parameters
 */
export function getInjectTokens(
  target: Function
): Map<number, Token<unknown>> {
  return (Reflect as any).getMetadata('inject:tokens', target) || new Map();
}
