# Testing Setup

This project uses [Vitest](https://vitest.dev/) for testing, providing a fast and lightweight testing solution similar to Jest but with better performance.

## Test Structure

- **Unit Tests**: Located in `__tests__` directories alongside the code they test
- **Integration Tests**: Located in `test/integration/`
- **Test Results**: Output to `test-results/` directory
- **Coverage Reports**: Generated in `coverage/` directory

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only integration tests
npm run test:integration

# Run only unit tests
npm run test:unit
```

## Test Configuration

- **Environment**: Node.js by default, with JSDOM for browser APIs when needed
- **Reporters**: Console output and JUnit XML for CI systems
- **Coverage**: Istanbul-compatible coverage reports
- **Setup**: Global mocks in `test/setup.ts`

## Writing Tests

Tests follow the BDD-style with `describe`, `it`, and `expect` functions. Mocks are handled with Vitest's built-in mocking capabilities.

Example test structure:
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('myFunction', () => {
  it('should behave correctly', () => {
    expect(myFunction()).toBe(expectedResult);
  });
});
```

## Mocking

The test setup includes mocks for:
- Node.js globals (`process`, `fs`, etc.)
- Electron APIs
- Browser APIs (when needed)

## Continuous Integration

Tests are configured to output JUnit XML reports for CI systems and generate coverage reports to ensure code quality.