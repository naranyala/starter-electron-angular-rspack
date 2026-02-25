import { defineConfig } from 'bun:test';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/security/**/*.test.ts', 'test/security/**/*.bun.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**'],
    reporter: ['verbose'],
    coverage: {
      provider: 'v8',
      enabled: true,
      include: ['src/**/*'],
      exclude: ['**/node_modules/**', '**/test/**', '**/tests/**'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage/security',
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
    timeout: 30000, // 30 seconds timeout for security tests
    retries: 1,
  },
});
