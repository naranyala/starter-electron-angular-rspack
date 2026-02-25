/// <reference types="vitest" />

import { vi } from 'vitest';

// Mock Node.js globals that might be needed for tests
global.process = {
  ...process,
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
} as NodeJS.Process;

// Mock common Node.js modules
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: vi.fn(),
      writeFile: vi.fn(),
      stat: vi.fn(),
      readdir: vi.fn(),
    },
  };
});

vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return actual;
});

// Mock Electron if needed
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(),
    getVersion: vi.fn(),
    getName: vi.fn(),
    quit: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Add any other global mocks or setup here