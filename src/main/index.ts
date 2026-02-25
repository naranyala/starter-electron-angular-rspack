/**
 * Electron Main Entry Point
 * 
 * Simplified entry point using App Facade pattern.
 * All complexity is delegated to the app module.
 * 
 * @module main
 */

import { app } from 'electron';
import { lifecycleHandlers } from './app/index.js';

// Register lifecycle handlers
lifecycleHandlers.register();

// Log unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  app.quit();
});

// Export for testing
export { lifecycleHandlers };
