import type { PlatformInfo } from '../types/index.js';

export function isDevelopment(): boolean {
  return process.argv.includes('--start-dev') || process.env.NODE_ENV === 'development';
}

export function getPlatformInfo(): PlatformInfo {
  return {
    isDev: isDevelopment(),
    platform: process.platform,
    arch: process.arch,
    isMacOS: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux',
  };
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function getArchitecture(): string {
  return process.arch;
}

export function getPlatform(): string {
  return process.platform;
}

export function getEnvPath(): string {
  return process.env.PATH || '';
}

export function getHomeDirectory(): string {
  return process.env.HOME || process.env.USERPROFILE || '';
}

export function getAppDataDirectory(): string {
  return (
    process.env.APPDATA || (isMacOS() ? `${getHomeDirectory()}/Library/Application Support` : '')
  );
}

export function getTempDirectory(): string {
  return process.env.TMPDIR || process.env.TEMP || '/tmp';
}
