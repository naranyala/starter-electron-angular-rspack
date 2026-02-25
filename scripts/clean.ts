#!/usr/bin/env node
/**
 * Clean Script
 * Removes build artifacts and cache directories
 */

import * as fs from 'node:fs';
import { cleanLogger as logger } from './lib/logger.ts';
import { dirExists, remove, setupProcessHandlers } from './lib/utils.ts';

// Directories to clean
const CLEAN_TARGETS = ['./dist', './build', './release', './.rspack-cache'];

// Files to clean
const CLEAN_FILES = ['./main.cjs', './main.cjs.map'];

// Options
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

async function clean(): Promise<boolean> {
  logger.start('cleanup');

  let cleanedCount = 0;
  let skippedCount = 0;

  // Clean directories
  logger.group('Directories');

  for (const target of CLEAN_TARGETS) {
    if (dirExists(target)) {
      if (DRY_RUN) {
        logger.info(`Would remove: ${target}`);
        skippedCount++;
      } else {
        logger.cleaning();
        if (VERBOSE) logger.info(`Removing: ${target}`);
        remove(target);
        logger.cleaned();
        cleanedCount++;
      }
    } else {
      if (VERBOSE) logger.skip(target, 'does not exist');
      skippedCount++;
    }
  }

  logger.groupEnd();

  // Clean files
  logger.group('Files');

  for (const file of CLEAN_FILES) {
    if (dirExists(file) || fs.existsSync(file)) {
      if (DRY_RUN) {
        logger.info(`Would remove: ${file}`);
        skippedCount++;
      } else {
        logger.cleaning();
        if (VERBOSE) logger.info(`Removing: ${file}`);
        remove(file);
        logger.cleaned();
        cleanedCount++;
      }
    } else {
      if (VERBOSE) logger.skip(file, 'does not exist');
      skippedCount++;
    }
  }

  logger.groupEnd();

  // Summary
  if (DRY_RUN) {
    logger.info(`Would clean ${skippedCount} items (dry run)`);
  } else {
    logger.success(`Cleaned ${cleanedCount} items, skipped ${skippedCount}`);
  }

  logger.complete('cleanup');
  return true;
}

// Setup process handlers
setupProcessHandlers();

// Run clean
clean()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Clean failed', error);
    process.exit(1);
  });
