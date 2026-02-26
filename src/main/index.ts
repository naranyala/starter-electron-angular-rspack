/**
 * Electron Main Entry Point
 *
 * Simplified entry point using App Facade pattern.
 * All complexity is delegated to the app module.
 *
 * @module main
 */

// Import reflect-metadata for decorator support
import 'reflect-metadata';

import { lifecycleHandlers } from './app/index';
import { registerMainErrorHooks } from './error-hooks';

// Register lifecycle handlers
lifecycleHandlers.register();

// Log unhandled errors and process issues
registerMainErrorHooks();

// Export for testing
export { lifecycleHandlers };
