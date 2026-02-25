#!/usr/bin/env node
/**
 * Development Server Script
 * Starts the development environment with hot reloading
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { devLogger as logger } from './lib/logger.ts';
import {
  exec,
  fileExists,
  getAvailablePort,
  installPackage,
  isPackageInstalled,
  setupProcessHandlers,
  waitFor,
} from './lib/utils.ts';

// Dependencies
const REQUIRED_DEPS = ['get-port', 'wait-on', '@rspack/cli', 'electron'];

// Paths
const RSPACK_BIN = './node_modules/.bin/rspack';
const ELECTRON_BIN = './node_modules/.bin/electron';

// Child processes
let rspackProcess: ChildProcess | null = null;
let electronProcess: ChildProcess | null = null;

// Ensure dependencies
async function ensureDependencies(): Promise<boolean> {
  logger.start('dependency check');

  for (const dep of REQUIRED_DEPS) {
    if (!isPackageInstalled(dep)) {
      logger.missing(dep, 'installing...');
      try {
        installPackage(dep, true);
        logger.installed(dep);
      } catch (error) {
        logger.error(`Failed to install ${dep}`, error as Error);
        return false;
      }
    }
  }

  logger.complete('dependency check');
  return true;
}

// Verify required files
async function verifyFiles(): Promise<boolean> {
  logger.checking('required files');

  const requiredFiles = [
    RSPACK_BIN,
    './src/main/index.ts',
    './frontend/src/index.html',
    './frontend/src/main.ts',
  ];

  const missingFiles = requiredFiles.filter((f) => !fileExists(f));

  if (missingFiles.length > 0) {
    for (const file of missingFiles) {
      logger.missing(file);
    }

    // Try to build
    logger.warn('Attempting initial build...');
    try {
      exec('npm run build');
      logger.complete('initial build');
    } catch (error) {
      logger.error('Initial build failed', error as Error);
      return false;
    }
  }

  logger.complete('file verification');
  return true;
}

// Start development server
async function startDev(): Promise<void> {
  logger.start('development environment');

  // Step 1: Ensure dependencies
  if (!(await ensureDependencies())) {
    process.exit(1);
  }

  // Step 2: Verify files
  if (!(await verifyFiles())) {
    process.exit(1);
  }

  // Step 3: Get available port for frontend dev server
  const port = await getAvailablePort();
  process.env.PORT = port.toString();
  logger.info(`Using port: ${port}`);

  // Step 4: Start Angular dev server
  logger.start('Angular dev server');

  rspackProcess = spawn(
    './frontend/node_modules/.bin/ng',
    ['serve', '--port', port.toString(), '--host', 'localhost', '--verbose=false'],
    {
      stdio: 'inherit',
      env: { ...process.env, PORT: port.toString(), CI: 'true' },
    }
  );

  rspackProcess.on('error', (error) => {
    logger.error('Rspack process error', error);
    cleanup();
    process.exit(1);
  });

  // Step 5: Wait for Rspack and start Electron
  setTimeout(async () => {
    try {
      logger.timing('Waiting for Rspack server...');
      await waitFor(`http://localhost:${port}`, 30000);
      logger.success('Rspack server ready');

      // Set Electron start URL
      process.env.ELECTRON_START_URL = `http://localhost:${port}`;

      // Start Electron
      logger.start('Electron');

      electronProcess = spawn(ELECTRON_BIN, ['main.cjs', '--start-dev'], {
        stdio: 'inherit',
        env: { ...process.env, ELECTRON_START_URL: `http://localhost:${port}` },
      });

      electronProcess.on('close', (code) => {
        logger.stop(`Electron exited with code ${code}`);
        cleanup();
        process.exit(code || 0);
      });

      electronProcess.on('error', (error) => {
        logger.error('Electron process error', error);
        cleanup();
        process.exit(1);
      });
    } catch (error) {
      logger.error('Failed to start dev server', error as Error);
      cleanup();
      process.exit(1);
    }
  }, 2000);

  rspackProcess.on('close', (code) => {
    logger.stop(`Rspack exited with code ${code}`);
    cleanup();
    process.exit(code || 0);
  });
}

// Cleanup processes
function cleanup(): void {
  if (rspackProcess && !rspackProcess.killed) {
    rspackProcess.kill();
  }
  if (electronProcess && !electronProcess.killed) {
    electronProcess.kill();
  }
}

// Setup process handlers
setupProcessHandlers(cleanup);

// Run dev server
startDev().catch((error) => {
  logger.error('Fatal error', error);
  cleanup();
  process.exit(1);
});
