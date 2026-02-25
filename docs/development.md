# Development Guide

Development workflow and best practices for the Electron Angular Rspack Starter.

## Development Workflow

### Starting Development

```bash
./run.sh dev
```

This starts:
1. Angular dev server with HMR
2. Main process build with watch mode
3. Electron application

### Hot Module Replacement

Changes to frontend code reload automatically. Main process changes trigger rebuilds.

## Code Style

### Formatting

```bash
bun run format        # Format all files
bun run format-check  # Check formatting
```

### Linting

```bash
bun run lint          # Run linting
bun run lint-check    # Check linting
```

### Type Checking

```bash
bun run type-check        # Run type check
bun run type-check:strict # Strict type check
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
| Types | *.types.ts | error.types.ts |
| Config | *.config.ts | app.config.ts |

### Import Paths

```typescript
// Shared code
import { ... } from '@shared/errors';
import { ... } from '@shared/events';
import { ... } from '@shared/ipc';

// Main process
import { ... } from '@main/events';
import { ... } from '@main/errors';
import { ... } from '@main/services';

// Frontend
import { ... } from '@core/events';
import { ... } from '@core/errors';
import { ... } from '@features/search';
```

## Development Best Practices

### Component Structure

```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Signals
  data = signal<Data | null>(null);
  
  // Computed
  computedData = computed(() => this.data());
  
  // Subscriptions
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

```typescript
// Backend
async getData(): AsyncResult<Data> {
  return this.errorHandler.handle(
    this.db.findById(id),
    ErrorCode.ResourceNotFound
  );
}

// Frontend
async loadData() {
  const data = await this.errorService.handleAsync(
    this.api.getData(),
    'Failed to load'
  );
  // Error automatically shown in UI
}
```

## Debugging

### Main Process

1. Start with `./run.sh dev`
2. Open DevTools from Electron menu
3. Use console or logger service

### Frontend

1. Use Angular DevTools extension
2. Access via Electron DevTools
3. Use error dashboard at `/devtools`

### IPC

Use DevTools component to monitor IPC messages.

## Testing

### Unit Tests

```bash
bun run test:unit
```

### Security Tests

```bash
bun run test:security
```

### Coverage

```bash
bun run test:coverage
```

## Build Commands

| Command | Description |
|---------|-------------|
| `./run.sh build` | Production build |
| `./run.sh build:check` | Build with type check |
| `./run.sh build:frontend` | Build frontend only |
| `./run.sh build:main` | Build main only |

## Utility Commands

| Command | Description |
|---------|-------------|
| `./run.sh clean` | Clean build artifacts |
| `./run.sh assets` | Copy assets |
| `./run.sh icons` | Build icons |
| `./run.sh check-deps` | Check dependencies |

## Related Documentation

- Scripts Reference - All commands
- Configuration - Configuration options
- Debugging - Debugging techniques
