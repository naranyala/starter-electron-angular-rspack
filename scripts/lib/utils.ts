#!/usr/bin/env node
/**
 * Utility Functions
 * Shared utility functions for build scripts
 */

import { type ChildProcess, execSync, spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { logger } from './logger.ts';

const require = createRequire(import.meta.url);

/**
 * Execute a command with error handling
 */
export function exec(command: string, options?: { stdio?: 'inherit' | 'pipe' }): string {
  try {
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: options?.stdio || 'pipe',
    });
    return result?.toString() || '';
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${(error as Error).message}`);
  }
}

/**
 * Spawn a process and return it
 */
export function spawnProcess(
  command: string,
  args: string[],
  options?: { env?: NodeJS.ProcessEnv; stdio?: 'inherit' | 'pipe' }
): ChildProcess {
  return spawn(command, args, {
    stdio: options?.stdio || 'inherit',
    env: { ...process.env, ...options?.env },
  });
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if a directory exists
 */
export function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Ensure directory exists, create if not
 */
export function ensureDir(dirPath: string): void {
  if (!dirExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Remove directory or file
 */
export function remove(path: string): void {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
}

/**
 * Copy file from source to destination
 */
export function copyFile(source: string, destination: string): void {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

/**
 * Copy directory recursively
 */
export function copyDir(source: string, destination: string): void {
  ensureDir(destination);

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

/**
 * Check if a package is installed
 */
export function isPackageInstalled(packageName: string): boolean {
  try {
    // Try multiple methods to check if package exists
    // Method 1: Check node_modules
    const projectRoot = path.resolve(process.cwd());
    const pkgPath = path.join(projectRoot, 'node_modules', packageName);
    if (fs.existsSync(pkgPath)) {
      return true;
    }

    // Method 2: Try require.resolve (works with createRequire)
    try {
      require.resolve(packageName);
      return true;
    } catch {
      // Continue to next method
    }

    // Method 3: Check if binary exists for CLI tools
    const binPath = path.join(projectRoot, 'node_modules', '.bin', packageName);
    if (fs.existsSync(binPath)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Install a package
 */
export function installPackage(packageName: string, dev = true): void {
  const flag = dev ? '--save-dev' : '--save';
  exec(`npm install ${packageName} ${flag}`, { stdio: 'inherit' });
}

/**
 * Install multiple packages
 */
export function installPackages(packages: string[], dev = true): void {
  const flag = dev ? '--save-dev' : '--save';
  const packageList = packages.join(' ');
  exec(`npm install ${packageList} ${flag}`, { stdio: 'inherit' });
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
  return path.resolve(process.cwd());
}

/**
 * Get path relative to project root
 */
export function getPath(relativePath: string): string {
  return path.join(getProjectRoot(), relativePath);
}

/**
 * Read JSON file
 */
export function readJson<T = any>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write JSON file
 */
export function writeJson(filePath: string, data: any): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Check required files exist
 */
export function checkRequiredFiles(files: string[]): boolean {
  let allExist = true;

  for (const file of files) {
    if (!fileExists(file)) {
      logger.missing(file);
      allExist = false;
    }
  }

  return allExist;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a resource to be available
 */
export async function waitFor(url: string, timeout: number = 30000): Promise<void> {
  const { default: waitOn } = await import('wait-on');
  await waitOn({
    resources: [url],
    timeout,
    interval: 100,
  });
}

/**
 * Get available port
 */
export async function getAvailablePort(): Promise<number> {
  const getPort = (await import('get-port')).default;
  const port = await getPort();
  return port;
}

/**
 * Handle process termination
 */
export function setupProcessHandlers(onTerminate?: () => void): void {
  const terminate = (signal: string) => {
    logger.stop(`Received ${signal}`);
    onTerminate?.();
    logger.bye();
    process.exit(0);
  };

  process.on('SIGINT', () => terminate('SIGINT'));
  process.on('SIGTERM', () => terminate('SIGTERM'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason as Error);
    process.exit(1);
  });
}
