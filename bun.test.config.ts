import { defineConfig } from 'bun:test';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'test/**/*.test.ts',
      'test/**/*.bun.ts',
      'frontend/test/**/*.test.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**'],
    reporter: ['verbose'],
    coverage: {
      provider: 'v8',
      enabled: process.env.COVERAGE === '1',
      include: ['src/**/*'],
      exclude: ['**/node_modules/**', '**/test/**', '**/tests/**', '**/frontend/**'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
    timeout: 30000,
    retries: 1,
  },
});
