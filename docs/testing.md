# Testing

Testing strategies, frameworks, and best practices.

## Test Types

### Unit Tests

Test individual components and services.

### Security Tests

Test security features and vulnerabilities.

### E2E Tests

Test complete application flows.

## Running Tests

### All Tests

```bash
bun run test
```

### Unit Tests

```bash
bun run test:unit
```

### Security Tests

```bash
bun run test:security
```

### With Coverage

```bash
bun run test:coverage
```

### Watch Mode

```bash
bun run test:watch
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'bun:test';
import { LoggerService } from '../src/main/services/logger.service';

describe('LoggerService', () => {
  it('should create instance', () => {
    const logger = new LoggerService();
    expect(logger).toBeDefined();
  });

  it('should log messages', () => {
    const logger = new LoggerService();
    expect(() => logger.info('test', 'message')).not.toThrow();
  });
});
```

### Security Test Example

```typescript
import { describe, it, expect } from 'bun:test';
import { checkContextIsolation } from './security-utils';

describe('Security', () => {
  it('should have context isolation enabled', () => {
    const config = getWindowConfig();
    expect(config.webPreferences.contextIsolation).toBe(true);
  });
});
```

## Test Organization

```
test/
├── security/           # Security tests
│   ├── security-suite.test.ts
│   ├── ipc-security.test.ts
│   └── ...
├── unit/               # Unit tests
│   └── basic-security.test.ts
├── setup.ts            # Test setup
└── README.md
```

## Frontend Testing

### Component Test

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent]
    });
    fixture = TestBed.createComponent(HomeComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });
});
```

### Service Test

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
});
```

## Security Testing

### Automated Security Scans

```bash
bun run security:audit
bun run security:scan
bun run security:analyze
```

### Manual Security Checks

1. Verify context isolation
2. Check sandbox mode
3. Validate IPC handlers
4. Review dependency vulnerabilities

## Best Practices

1. Write tests for all services
2. Test error handling
3. Mock external dependencies
4. Use descriptive test names
5. Keep tests independent
6. Run tests before committing

## Coverage

Coverage reports are generated in `coverage/` directory.

View HTML report:

```bash
open coverage/index.html
```

## Related Documentation

- Security Testing - Security audits
- Development - Development workflow
