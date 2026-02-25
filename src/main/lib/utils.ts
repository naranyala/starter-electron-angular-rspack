/**
 * Backend-specific utility functions for Electron main process
 */

import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the user data path for the application
 */
export function getUserDataPath(): string {
  return app.getPath('userData');
}

/**
 * Get the application data path
 */
export function getAppDataPath(): string {
  return app.getPath('appData');
}

/**
 * Get the home directory path
 */
export function getHomePath(): string {
  return app.getPath('home');
}

/**
 * Read a file with error handling
 */
export async function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Write a file with error handling
 */
export async function writeFile(filePath: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Show an error dialog
 */
export async function showErrorDialog(message: string, title: string = 'Error'): Promise<void> {
  await dialog.showMessageBox({
    type: 'error',
    title,
    message,
  });
}

/**
 * Show an info dialog
 */
export async function showInfoDialog(
  message: string,
  title: string = 'Information'
): Promise<void> {
  await dialog.showMessageBox({
    type: 'info',
    title,
    message,
  });
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Create a directory if it doesn't exist
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get the application version
 */
export function getAppVersion(): string {
  return app.getVersion();
}

/**
 * Get the application name
 */
export function getAppName(): string {
  return app.getName();
}
