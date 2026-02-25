/**
 * Event Bus Module - Frontend
 * 
 * Central export for frontend event bus functionality.
 */

export { FrontendEventBus } from './event-bus.js';
export { EventBusFacade } from './event-bus.facade.js';
export type { EventListener } from './event-bus.facade.js';
export type { BaseEvent, TypedEvent, EventChannel, SubscriptionOptions, PublishOptions, EventBusStats } from './event-bus.js';
