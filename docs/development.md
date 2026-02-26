# Development Guide

Development workflow, best practices, and coding standards for Electron Angular Rspack Starter.

## Development Workflow

### Starting Development

Start the development environment:

```bash
./run.sh dev
```

This command:
1. Checks and installs dependencies if missing
2. Starts Angular dev server with hot module replacement (HMR)
3. Builds the main process with watch mode
4. Launches the Electron application
5. Enables automatic reloading on changes

### Hot Module Replacement

Changes to frontend code reload automatically without full page refresh. Main process changes trigger rebuilds and application restart.

### Development Cycle

1. Make changes to code
2. Save file
3. Changes apply automatically (HMR)
4. View changes in Electron window
5. Use DevTools for debugging

## Code Style

### Formatting

This project uses Biome for ultra-fast formatting:

```bash
# Format all files
bun run format

# Check formatting without changes
bun run format-check
```

### Linting

Biome also handles linting:

```bash
# Run linting and fix issues
bun run lint

# Check linting without fixes
bun run lint-check
```

### Type Checking

TypeScript type checking:

```bash
# Run type check
bun run type-check

# Strict type check (all errors)
bun run type-check:strict
```

## File Organization

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Services | *.service.ts | logger.service.ts |
| Components | *.component.ts | home.component.ts |
| Models | *.model.ts | card.model.ts |
| ViewModels | *.viewmodel.ts | event-bus.viewmodel.ts |
| Use Cases | *.usecase.ts | create-window.usecase.ts |
| Types | *.types.ts | window.types.ts |
| Config | *.config.ts | app.config.ts |
| Facade | *.facade.ts | app.facade.ts |

### Import Paths

Use path aliases for clean imports:

**Main Process:**

```typescript
import { ... } from '@main/app';
import { ... } from '@main/di';
import { ... } from '@main/events';
import { ... } from '@main/errors';
import { ... } from '@main/services';
```

**Shared Code:**

```typescript
import { ... } from '@shared/errors';
import { ... } from '@shared/events';
import { ... } from '@shared/ipc';
```

**Frontend:**

```typescript
import { ... } from '@core/events';
import { ... } from '@core/errors';
import { ... } from '@features/search';
import { ... } from '@viewmodels';
```

## Development Best Practices

### Component Structure (Frontend)

```typescript
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Signals for reactive state
  data = signal<Data | null>(null);

  // Computed values
  computedData = computed(() => this.data());

  // Subscriptions cleanup
  private unsubscribe: (() => void)[] = [];

  constructor(private service: DataService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(fn => fn());
  }

  private loadData() {
    // Implementation
  }
}
```

### Service Structure

```typescript
import { Injectable } from '@angular/core';
import { getLogger } from '@viewmodels/logger.viewmodel';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly logger = getLogger('data.service');

  constructor(private http: HttpClient) {}

  async getData(): AsyncResult<Data> {
    return tryAsync(async () => {
      return await this.http.get<Data>('/api/data').toPromise();
    });
  }
}
```

### Error Handling

**Backend:**

```typescript
import { ErrorHandler, ErrorCode } from '@main/errors';

@Injectable({ scope: 'singleton' })
export class DataService {
  constructor(private errorHandler: ErrorHandler) {}

  async getData(id: string): AsyncResult<Data> {
    return this.errorHandler.handle(
      async () => {
        const data = await this.db.findById(id);
        if (!data) {
          throw new Error('Not found');
        }
        return data;
      },
      ErrorCode.ResourceNotFound,
      { id }
    );
  }
}
```

**Frontend:**

```typescript
import { FrontendErrorService } from '@core/errors';

@Component({...})
export class DataComponent {
  constructor(private errorService: FrontendErrorService) {}

  async loadData() {
    const data = await this.errorService.handleAsync(
      this.api.getData(),
      'Failed to load data'
    );
    // Error automatically shown in UI
  }
}
```

### State Management with Signals

```typescript
import { signal, computed } from '@angular/core';

export class DataViewModel {
  // Mutable signal
  private data = signal<Data[]>([]);

  // Read-only computed
  itemCount = computed(() => this.data().length);

  // Derived signal
  filteredData = computed(() => {
    return this.data().filter(item => item.active);
  });

  // Update signal
  setData(items: Data[]) {
    this.data.set(items);
  }

  // Update with previous value
  addItem(item: Data) {
    this.data.update(items => [...items, item]);
  }
}
```

## Debugging

### Main Process Debugging

1. Start with `./run.sh dev`
2. Open DevTools from Electron menu (View > Toggle Developer Tools)
3. Use console for logging
4. Use logger service for structured logging

```typescript
import { getLogger } from '@main/lib/logger';

const logger = getLogger('my-service');
logger.info('Operation started', { id: '123' });
logger.error('Operation failed', error);
```

### Frontend Debugging

1. Use Angular DevTools extension for Chrome/Firefox
2. Access via Electron DevTools
3. Use error dashboard at `/devtools` route
4. Use logger viewmodel for structured logging

```typescript
import { getLogger } from '@viewmodels/logger.viewmodel';

const logger = getLogger('my-component');
logger.info('Component initialized');
logger.error('Error occurred', error);
```

### IPC Debugging

Use the DevTools component to monitor IPC messages:

1. Navigate to `/devtools`
2. Select IPC tab
3. View sent and received messages
4. Inspect message payloads

### Event Bus Debugging

Monitor event bus events:

1. Navigate to `/devtools`
2. Select Events tab
3. View published events
4. Inspect event payloads

## Testing

### Unit Tests

Write unit tests for services and utilities:

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

Run unit tests:

```bash
bun run test:unit
```

### Security Tests

Security tests validate security features:

```bash
bun run test:security
```

### Test Coverage

Generate coverage report:

```bash
bun run test:coverage
```

View HTML report:

```bash
open coverage/index.html
```

## Build Commands

### Development Build

```bash
./run.sh build
```

### Build with Type Check

```bash
bun run build:check
```

### Build Frontend Only

```bash
bun run build:frontend
```

### Build Main Process Only

```bash
bun run build:main
```

### Verbose Build

```bash
bun run build:verbose
```

## Utility Commands

### Clean Build Artifacts

```bash
./run.sh clean
```

### Dry Run Clean

Preview what would be cleaned:

```bash
./run.sh clean:dry
```

### Copy Assets

```bash
bun run assets
```

### Build Icons

```bash
bun run icons
```

### Check Dependencies

```bash
./run.sh check
```

### Update Dependencies

```bash
bun run deps:latest
```

## Pre-commit Checklist

Before committing code:

1. Format code: `bun run format`
2. Run linting: `bun run lint`
3. Type check: `bun run type-check`
4. Run tests: `bun run test`
5. Verify build: `./run.sh build`

## Git Workflow

### Branch Naming

Use descriptive branch names:

```
feature/add-search
fix/login-error
refactor/user-service
docs/update-readme
```

### Commit Messages

Follow conventional commits:

```
feat: add search functionality
fix: resolve login error
refactor: simplify user service
docs: update README with examples
style: format code
test: add unit tests for service
chore: update dependencies
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Run pre-commit checks
4. Commit with descriptive message
5. Push to remote
6. Create pull request
7. Address review feedback
8. Merge after approval

## Environment Configuration

### Development Environment

`frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  logging: {
    level: 'debug',
    enabled: true,
  },
  api: {
    baseUrl: 'http://localhost:3000',
  },
};
```

### Production Environment

`frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  logging: {
    level: 'error',
    enabled: true,
  },
  api: {
    baseUrl: 'https://api.example.com',
  },
};
```

## Performance Tips

### Optimize Bundle Size

1. Use lazy loading for feature modules
2. Remove unused dependencies
3. Use tree-shaking friendly imports
4. Analyze bundle with webpack-bundle-analyzer

### Optimize Change Detection

1. Use OnPush change detection strategy
2. Use signals for reactivity
3. Avoid unnecessary computations in templates
4. Use trackBy for ngFor loops

### Optimize IPC

1. Batch IPC calls when possible
2. Minimize payload size
3. Cache frequently accessed data
4. Use events for notifications

## Related Documentation

- [Scripts Reference](scripts-reference.md) - All available commands
- [Configuration](configuration.md) - Configuration options
- [Debugging](debugging.md) - Debugging techniques
- [Testing](testing.md) - Testing guide
