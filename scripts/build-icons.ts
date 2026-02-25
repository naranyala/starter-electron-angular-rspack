#!/usr/bin/env node
/**
 * Build Icons Script
 * Copies icon files to build directory
 */

import * as path from 'node:path';
import { logger } from './lib/logger.ts';
import { copyFile, ensureDir, fileExists, setupProcessHandlers } from './lib/utils.ts';

const ASSETS_DIR = './assets';
const BUILD_DIR = './build';

const ICON_FILES = ['icon.ico', 'icon.png', 'icon.icns', 'icon.svg'];

async function copyIcons(): Promise<boolean> {
  logger.start('icon copy');

  // Ensure build directory exists
  ensureDir(BUILD_DIR);

  let copiedCount = 0;
  let missingCount = 0;

  logger.group('Icon Files');

  for (const file of ICON_FILES) {
    const sourcePath = path.join(ASSETS_DIR, file);
    const destPath = path.join(BUILD_DIR, file);

    if (fileExists(sourcePath)) {
      try {
        logger.copying(sourcePath, destPath);
        copyFile(sourcePath, destPath);
        logger.copied(sourcePath, destPath);
        copiedCount++;
      } catch (error) {
        logger.error(`Failed to copy ${file}`, error as Error);
      }
    } else {
      logger.missing(sourcePath, 'skipping');
      missingCount++;
    }
  }

  logger.groupEnd();

  if (copiedCount === 0 && missingCount > 0) {
    logger.warn('No icons were copied');
  } else {
    logger.success(`Copied ${copiedCount} icons, ${missingCount} missing`);
  }

  logger.complete('icon copy');
  return true;
}

// Setup process handlers
setupProcessHandlers();

// Run copy
copyIcons()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Icon copy failed', error);
    process.exit(1);
  });
