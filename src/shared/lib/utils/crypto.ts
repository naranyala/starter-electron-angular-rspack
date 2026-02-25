/**
 * Crypto and hashing utility functions for shared use
 */

/**
 * Generate a simple hash of a string (not cryptographically secure)
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36); // Convert to base 36 string
}

/**
 * Generate a UUID (v4) - simplified version
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Base64 encode a string
 */
export function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    // Browser environment
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } else {
    // Node.js environment
    return Buffer.from(str, 'utf8').toString('base64');
  }
}

/**
 * Base64 decode a string
 */
export function base64Decode(str: string): string {
  if (typeof atob !== 'undefined') {
    // Browser environment
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } else {
    // Node.js environment
    return Buffer.from(str, 'base64').toString('utf8');
  }
}

/**
 * Simple XOR encryption (not secure for sensitive data)
 */
export function xorEncryptDecrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a cryptographically secure random number within a range
 */
export function secureRandom(min: number, max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment with crypto API
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return Math.floor((array[0] / (0xffffffff + 1)) * (max - min + 1)) + min;
  } else {
    // Fallback to Math.random (less secure)
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
