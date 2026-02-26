# Testing

Comprehensive guide to testing strategies, frameworks, and best practices for Electron Angular Rspack Starter.

## Test Types

### Unit Tests

Test individual components, services, and utilities in isolation.

**Purpose:**
- Verify individual functionality
- Test edge cases
- Ensure code correctness

**Tools:**
- Bun:test
- Angular TestBed

### Security Tests

Test security features and identify vulnerabilities.

**Purpose:**
- Validate security configuration
- Check for vulnerabilities
- Ensure secure coding practices

**Tools:**
- Custom security scripts
- Dependency scanners

### Integration Tests

Test interaction between components.

**Purpose:**
- Verify component interaction
- Test IPC communication
- Validate data flow

### E2E Tests

Test complete application flows.

**Purpose:**
- Test user workflows
- Validate full application
- Catch regression issues

**Tools:**
- Playwright
- Protractor

## Running Tests

### All Tests

```bash
bun run test
```

Runs all test suites.

### Unit Tests

```bash
bun run test:unit
```

Run unit tests only.

### Security Tests

```bash
bun run test:security
```

Run security test suite.

### Test with Coverage

```bash
bun run test:coverage
```

Generate coverage report.

### Watch Mode

```bash
bun run test:watch
```

Run tests in watch mode (re-run on changes).

### Test with UI

```bash
bun run test:ui
```

Run tests with interactive UI.

## Writing Tests

### Unit Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { LoggerService } from '../src/main/services/logger.service';

describe('LoggerService', () => {
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService();
  });

  it('should create instance', () => {
    expect(logger).toBeDefined();
  });

  it('should log messages', () => {
    expect(() => logger.info('test', 'message')).not.toThrow();
  });

  it('should log with different levels', () => {
    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');
    
    expect(logger.getLogs().length).toBe(4);
  });
});
```

### Testing Services with Dependencies

```typescript
import { describe, it, expect } from 'bun:test';
import { container } from '@main/di';
import { DataService } from './data.service';

describe('DataService', () => {
  it('should fetch data', async () => {
    const service = container.resolve(DataService);
    const result = await service.getData('123');
    
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeDefined();
    }
  });
});
```

### Testing Error Handling

```typescript
import { describe, it, expect } from 'bun:test';
import { isOk, isErr } from '@shared/errors';
import { DataService } from './data.service';

describe('DataService Error Handling', () => {
  it('should return error on not found', async () => {
    const service = new DataService();
    const result = await service.getData('invalid');
    
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe(ErrorCode.ResourceNotFound);
    }
  });

  it('should return success on valid data', async () => {
    const service = new DataService();
    const result = await service.getData('valid-id');
    
    expect(isOk(result)).toBe(true);
  });
});
```

### Testing Frontend Components

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Home');
  });
});
```

### Testing Frontend Services

```typescript
import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data', async () => {
    const result = await service.getData();
    expect(result).toBeDefined();
  });
});
```

### Testing with Mocks

```typescript
import { describe, it, expect, mock } from 'bun:test';

describe('Service with Mock', () => {
  it('should use mocked dependency', () => {
    const mockHttp = {
      get: mock(() => Promise.resolve({ data: 'mocked' }))
    };

    const service = new DataService(mockHttp as any);
    const result = await service.getData();
    
    expect(result).toBe('mocked');
    expect(mockHttp.get).toHaveBeenCalled();
  });
});
```

## Security Testing

### Security Test Suite

```typescript
import { describe, it, expect } from 'bun:test';
import { checkContextIsolation } from './security-utils';

describe('Security Tests', () => {
  it('should have context isolation enabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.contextIsolation).toBe(true);
  });

  it('should have sandbox mode enabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.sandbox).toBe(true);
  });

  it('should have nodeIntegration disabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.nodeIntegration).toBe(false);
  });

  it('should have webSecurity enabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.webSecurity).toBe(true);
  });
});
```

### IPC Security Tests

```typescript
describe('IPC Security', () => {
  it('should validate input', async () => {
    const result = await ipcRenderer.invoke('data:set', null);
    expect(result.success).toBe(false);
  });

  it('should reject invalid channels', async () => {
    try {
      await ipcRenderer.invoke('invalid:channel', {});
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error.message).toContain('not allowed');
    }
  });
});
```

### Dependency Security Tests

```typescript
describe('Dependency Security', () => {
  it('should have no known vulnerabilities', async () => {
    const vulnerabilities = await scanDependencies();
    expect(vulnerabilities.length).toBe(0);
  });

  it('should use latest secure versions', async () => {
    const outdated = await checkOutdatedPackages();
    expect(outdated.critical.length).toBe(0);
  });
});
```

## Test Organization

### Directory Structure

```
test/
├── security/                     # Security tests
│   ├── security-suite.test.ts
│   ├── main-process-security.test.ts
│   ├── ipc-security.test.ts
│   ├── file-system-security.test.ts
│   ├── network-security.test.ts
│   ├── electron-vulnerabilities.test.ts
│   ├── dependency-security.test.ts
│   ├── csp-validation.test.ts
│   └── comprehensive-security-suite.test.ts
├── unit/                         # Unit tests
│   └── basic-security.test.ts
├── setup.ts                      # Test setup
└── README.md                     # Test documentation
```

### Frontend Test Structure

```
frontend/src/
├── app/
│   ├── app.component.spec.ts
│   └── app.service.spec.ts
├── core/
│   ├── services/
│   │   ├── logger.service.spec.ts
│   │   └── window.service.spec.ts
│   └── events/
│       └── event-bus.spec.ts
└── features/
    └── search/
        └── search.service.spec.ts
```

## Test Best Practices

### General Guidelines

1. **Write Tests for All Services**
   - Test public methods
   - Test error cases
   - Test edge cases

2. **Use Descriptive Test Names**
   ```typescript
   it('should return error when resource not found', () => {});
   it('should create window with default options', () => {});
   ```

3. **Keep Tests Independent**
   - No shared state between tests
   - Each test should run in isolation
   - Use beforeEach for setup

4. **Test Both Success and Error Cases**
   ```typescript
   it('should succeed with valid input', () => {});
   it('should fail with invalid input', () => {});
   ```

5. **Use Arrange-Act-Assert Pattern**
   ```typescript
   it('should test something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = service.process(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

### Frontend Specific

1. **Use TestBed for Angular Tests**
   ```typescript
   beforeEach(() => {
     TestBed.configureTestingModule({});
   });
   ```

2. **Test Component Lifecycle**
   ```typescript
   it('should initialize data in ngOnInit', () => {
     component.ngOnInit();
     expect(component.data).toBeDefined();
   });
   ```

3. **Test User Interactions**
   ```typescript
   it('should handle button click', () => {
     const button = fixture.nativeElement.querySelector('button');
     button.click();
     expect(component.clicked).toBe(true);
   });
   ```

### Backend Specific

1. **Test Service Methods**
   ```typescript
   it('should create window', async () => {
     const result = await windowService.create(options);
     expect(result.ok).toBe(true);
   });
   ```

2. **Test IPC Handlers**
   ```typescript
   it('should handle IPC request', async () => {
     const result = await ipcMain.handle('channel', data);
     expect(result.success).toBe(true);
   });
   ```

## Coverage

### Generate Coverage

```bash
bun run test:coverage
```

### View Coverage Report

```bash
# Open HTML report
open coverage/index.html
```

### Coverage Thresholds

Set coverage thresholds in configuration:

```json
{
  "coverage": {
    "thresholds": {
      "lines": 80,
      "functions": 80,
      "branches": 70
    }
  }
}
```

## Continuous Integration

### CI Test Configuration

```yaml
# GitHub Actions example
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: cd frontend && bun install
      - run: bun run test:coverage
      - uses: codecov/codecov-action@v2
```

### Pre-commit Tests

```bash
# Run tests before commit
bun run test:unit
```

## Debugging Tests

### Run Single Test

```bash
bun test test/path/to/file.test.ts
```

### Run Test with Pattern

```bash
bun test --test-name-pattern "should create"
```

### Verbose Output

```bash
bun test --verbose
```

### Debug Test

```typescript
import { describe, it, expect } from 'bun:test';

describe('Debug Test', () => {
  it('should debug', () => {
    console.log('Debug info');
    debugger; // Break point
    expect(true).toBe(true);
  });
});
```

## Troubleshooting

### Tests Not Running

**Problem:** Tests don't execute.

**Solution:**
1. Check test file naming (*.test.ts)
2. Verify test syntax
3. Check imports

### Tests Failing

**Problem:** Tests fail unexpectedly.

**Solution:**
1. Check test setup
2. Verify mock data
3. Review recent changes

### Coverage Not Generated

**Problem:** No coverage report.

**Solution:**
1. Check coverage configuration
2. Verify test runner supports coverage
3. Run with --coverage flag

### Slow Tests

**Problem:** Tests take too long.

**Solution:**
1. Use parallel test execution
2. Mock slow operations
3. Optimize test setup

## Related Documentation

- [Development Guide](development.md) - Development workflow
- [Security](security.md) - Security features
- [Scripts Reference](scripts-reference.md) - Test commands
