#!/usr/bin/env node
/**
 * Copy Assets Script
 * Copies assets to the build directory
 */

import * as path from 'node:path';
import { buildLogger as logger } from './lib/logger.ts';
import { copyDir, copyFile, dirExists, ensureDir, setupProcessHandlers } from './lib/utils.ts';

const SOURCE_ASSETS = './assets';
const BUILD_DIR = './dist';

// Specific files to copy (in addition to full directory)
const FILES_TO_COPY = [{ from: './package.json', to: path.join(BUILD_DIR, 'package.json') }];

async function copyAssets(): Promise<boolean> {
  logger.start('asset copy');

  // Ensure build directory exists
  ensureDir(BUILD_DIR);

  // Copy assets directory
  if (dirExists(SOURCE_ASSETS)) {
    logger.copying('assets/*', BUILD_DIR);
    try {
      copyDir(SOURCE_ASSETS, BUILD_DIR);
      logger.copied('assets/*', BUILD_DIR);
    } catch (error) {
      logger.error('Failed to copy assets', error as Error);
      return false;
    }
  } else {
    logger.skip('assets', 'directory does not exist');
  }

  // Copy specific files
  logger.group('Individual Files');

  for (const { from, to } of FILES_TO_COPY) {
    try {
      logger.copying(from, to);
      copyFile(from, to);
      logger.copied(from, to);
    } catch (error) {
      logger.error(`Failed to copy ${from}`, error as Error);
      // Continue even if individual file copy fails
    }
  }

  logger.groupEnd();
  logger.complete('asset copy');
  return true;
}

// Setup process handlers
setupProcessHandlers();

// Run copy
copyAssets()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    logger.error('Asset copy failed', error);
    process.exit(1);
  });
