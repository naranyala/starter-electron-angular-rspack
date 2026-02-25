#!/usr/bin/env node
/**
 * Check Dependencies Script
 * Checks and optionally installs required dependencies
 */

import { LogLevel, depsLogger as logger } from './lib/logger.ts';
import { installPackage, isPackageInstalled, setupProcessHandlers } from './lib/utils.ts';

// Dependencies required for building
const BUILD_DEPENDENCIES = ['@rspack/cli', 'typescript', 'css-loader', 'style-loader'];

// Dependencies required for development
const DEV_DEPENDENCIES = ['get-port', 'wait-on', '@rspack/cli', 'electron'];

// Check mode
const CHECK_ONLY = process.argv.includes('--check-only');
const DEV_MODE = process.argv.includes('--dev');
const QUIET = process.argv.includes('--quiet');

if (QUIET) {
  logger['level'] = LogLevel.ERROR;
}

async function checkDependencies(): Promise<boolean> {
  const deps = DEV_MODE ? DEV_DEPENDENCIES : BUILD_DEPENDENCIES;
  const allInstalled = true;
  const missing: string[] = [];

  logger.start('dependency check');
  logger.group('Dependencies');

  for (const dep of deps) {
    logger.checking(dep);

    if (isPackageInstalled(dep)) {
      logger.found(dep);
    } else {
      logger.missing(dep, CHECK_ONLY ? 'skipping install' : 'will install');
      missing.push(dep);
    }
  }

  logger.groupEnd();

  if (missing.length === 0) {
    logger.complete('dependency check');
    return true;
  }

  if (CHECK_ONLY) {
    logger.error(`${missing.length} dependencies missing`);
    return false;
  }

  // Install missing dependencies
  logger.group('Installation');

  for (const dep of missing) {
    try {
      logger.installing(dep);
      installPackage(dep, true);
      logger.installed(dep);
    } catch (error) {
      logger.error(`Failed to install ${dep}`, error as Error);
      return false;
    }
  }

  logger.groupEnd();
  logger.complete('dependency installation');
  return true;
}

// Setup process handlers
setupProcessHandlers();

// Run check
checkDependencies()
  .then((success) => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    logger.error('Unexpected error', error);
    process.exit(1);
  });
