/**
 * Dependency Injection Module
 * Central export for DI functionality
 */

export { Container, container, createPlatformContainer } from './container.js';
export {
  getInjectableMetadata,
  getConstructorDependencies,
  getInjectTokens,
  Injectable,
  Inject,
  InjectionToken,
  type Provider,
  type ServiceDecoratorOptions,
  type Token,
  ROOT_CONTAINER,
  PLATFORM_CONTAINER,
} from './tokens.js';
export {
  ServiceRegistry,
  serviceRegistry,
  type ServiceMeta,
  type ServiceEntry,
} from './registry.js';
