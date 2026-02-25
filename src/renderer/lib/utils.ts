/**
 * Frontend-specific utility functions for Electron renderer process
 */

// Importing debounce and throttle from shared utils since they are general-purpose
// If renderer-specific implementations are needed, they can be added here
import { debounce as sharedDebounce, throttle as sharedThrottle } from '../../shared/lib/utils';

export { sharedDebounce as debounce, sharedThrottle as throttle };

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Check if the app is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || location.hostname === 'localhost';
}

/**
 * Get query parameters from URL
 */
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

/**
 * Get a specific query parameter
 */
export function getUrlParam(name: string): string | null {
  return getUrlParams().get(name);
}

/**
 * Add a class to an element with animation frame for performance
 */
export function addClassWithAnimation(element: HTMLElement, className: string): void {
  requestAnimationFrame(() => {
    element.classList.add(className);
  });
}

/**
 * Remove a class from an element with animation frame for performance
 */
export function removeClassWithAnimation(element: HTMLElement, className: string): void {
  requestAnimationFrame(() => {
    element.classList.remove(className);
  });
}

/**
 * Toggle a class on an element with animation frame for performance
 */
export function toggleClassWithAnimation(element: HTMLElement, className: string): void {
  requestAnimationFrame(() => {
    element.classList.toggle(className);
  });
}

/**
 * Wait for a specified amount of time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(dm)) + ' ' + sizes[i];
}
