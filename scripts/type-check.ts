#!/usr/bin/env node
/**
 * Type Check Script
 * Runs TypeScript type checking
 */

import { buildLogger as logger } from './lib/logger.ts';
import { exec, setupProcessHandlers } from './lib/utils.ts';

const STRICT = process.argv.includes('--strict');

async function typeCheck(): Promise<boolean> {
  logger.start('type check');

  try {
    logger.checking('TypeScript');

    const result = exec('npx tsc --noEmit', { stdio: 'pipe' });

    if (result) {
      logger.warn('Type issues found:\n' + result);
      if (STRICT) {
        logger.error('Type check failed (strict mode)');
        return false;
      }
      logger.warn('Continuing despite type issues');
    } else {
      logger.success('Type check passed');
    }

    logger.complete('type check');
    return true;
  } catch (error) {
    logger.error('Type check failed', error as Error);
    if (STRICT) {
      return false;
    }
    logger.warn('Continuing despite type check failure');
    return true;
  }
}

// Setup process handlers
setupProcessHandlers();

// Run type check
typeCheck()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    logger.error('Unexpected error', error);
    process.exit(1);
  });
