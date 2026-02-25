#!/usr/bin/env node
/**
 * Build Script
 * Main build orchestrator - runs build steps in sequence
 */

import { LogLevel, buildLogger as logger } from './lib/logger.ts';
import { checkRequiredFiles, exec, setupProcessHandlers } from './lib/utils.ts';

// Configuration
const REQUIRED_FILES = [
  './src/main/index.ts',
  './frontend/src/index.html',
  './frontend/src/main.ts',
];

// Options
const WITH_TYPE_CHECK = process.argv.includes('--type-check');
const QUIET = process.argv.includes('--quiet');
const VERBOSE = process.argv.includes('--verbose');

if (QUIET) {
  logger['level'] = LogLevel.ERROR;
}

async function build(): Promise<boolean> {
  logger.building();
  logger.group('Build Steps');

  // Step 1: Check dependencies
  logger.start('dependency check');
  try {
    exec('npx tsx scripts/check-deps.ts');
    logger.complete('dependency check');
  } catch (error) {
    logger.error('Dependency check failed', error as Error);
    return false;
  }

  // Step 2: Verify source files
  logger.checking('source files');
  if (!checkRequiredFiles(REQUIRED_FILES)) {
    logger.error('Required source files missing');
    return false;
  }
  logger.complete('source file verification');

  // Step 3: Clean previous build
  logger.start('cleaning previous build');
  try {
    exec('npx tsx scripts/clean.ts');
    logger.complete('clean');
  } catch (error) {
    logger.warn('Clean step had issues, continuing...');
  }

  // Step 4: Type check (optional)
  if (WITH_TYPE_CHECK) {
    logger.start('type checking');
    try {
      exec('npx tsx scripts/type-check.ts');
      logger.complete('type check');
    } catch (error) {
      logger.warn('Type check issues found, continuing build...');
    }
  }

  logger.groupEnd();

  // Step 5: Build frontend with Angular CLI (AOT compilation)
  logger.group('Frontend Build (Angular CLI)');
  logger.start('Building Angular frontend with AOT');

  try {
    exec('cd frontend && ./node_modules/.bin/ng build --configuration=production', {
      stdio: VERBOSE ? 'inherit' : 'pipe',
    });
    logger.success('Angular frontend build completed');
  } catch (error) {
    logger.error('Angular frontend build failed', error as Error);
    logger.groupEnd();
    return false;
  }

  logger.groupEnd();

  // Step 6: Build main process with Rspack
  logger.group('Main Process Build');
  logger.start('Building main process with Rspack');

  try {
    exec('./node_modules/.bin/rspack build');
    logger.success('Main process built successfully with Rspack');
  } catch (error) {
    logger.error('Main process build failed', error as Error);
    logger.groupEnd();
    return false;
  }

  logger.groupEnd();

  // Step 7: Copy assets
  logger.start('copying assets');
  try {
    exec('npx tsx scripts/copy-assets.ts');
    logger.complete('asset copy');
  } catch (error) {
    logger.warn('Asset copy had issues');
  }

  // Verify build output
  logger.checking('build output');
  const fs = await import('node:fs');
  if (fs.existsSync('./frontend/dist/browser/index.html')) {
    logger.success('Build output verified');
    logger.built();
    logger.info('📂 Output: ./frontend/dist/browser/');
    return true;
  } else {
    logger.error('Build output verification failed');
    return false;
  }
}

// Setup process handlers
setupProcessHandlers();

// Run build
build()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    logger.error('Build failed unexpectedly', error);
    process.exit(1);
  });
