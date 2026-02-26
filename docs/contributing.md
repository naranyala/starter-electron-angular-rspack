# Contributing

Contribution guidelines for Electron Angular Rspack Starter project.

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

### Commit Messages

Follow conventional commits format:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

**Examples:**

```
feat: add window management service
fix: resolve IPC channel validation issue
docs: update architecture documentation
style: fix indentation in main.ts
refactor: simplify error handling logic
test: add unit tests for logger service
chore: update dependencies to latest versions
```

## Pull Requests

### PR Process

1. **Fork the Repository**
   ```bash
   git fork <repository-url>
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

4. **Run Checks**
   ```bash
   bun run format
   bun run lint
   bun run type-check
   bun run test
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Push to Remote**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Submit Pull Request**
   - Go to GitHub
   - Create pull request
   - Fill out PR template

### PR Requirements

- [ ] All tests pass
- [ ] Code is formatted
- [ ] No linting errors
- [ ] Commits follow conventional format
- [ ] PR description explains changes
- [ ] Related documentation updated
- [ ] New features have tests

## Development Guidelines

### General Guidelines

1. **Write TypeScript**
   - Use TypeScript, not JavaScript
   - Define types for all functions
   - Avoid `any` type when possible

2. **Use Dependency Injection**
   - Use `@Injectable` decorator
   - Inject dependencies via constructor
   - Use facades for complex operations

3. **Follow Project Structure**
   - Place files in appropriate directories
   - Use consistent naming conventions
   - Group related files together

4. **Write Tests**
   - Write tests for new features
   - Test error handling
   - Mock external dependencies

5. **Document Public APIs**
   - Add JSDoc comments
   - Document parameters and return types
   - Include usage examples

### File Organization

**Backend:**

```
src/main/
├── services/        # New services
├── use-cases/       # New use cases
└── lib/            # New utilities
```

**Frontend:**

```
frontend/src/
├── core/           # Core services
├── features/       # New features
├── viewmodels/     # State management
└── views/          # Components
```

**Shared:**

```
src/shared/
├── errors/         # Error codes
├── events/         # Event types
├── ipc/            # IPC channels
└── lib/            # Shared utilities
```

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

### Import Paths

Use path aliases:

```typescript
// Main process
import { ... } from '@main/app';
import { ... } from '@main/di';
import { ... } from '@main/events';

// Shared code
import { ... } from '@shared/errors';
import { ... } from '@shared/ipc';

// Frontend
import { ... } from '@core/events';
import { ... } from '@features/search';
```

## Testing

### Write Tests

1. **Unit Tests**
   ```typescript
   import { describe, it, expect } from 'bun:test';
   
   describe('MyService', () => {
     it('should create instance', () => {
       const service = new MyService();
       expect(service).toBeDefined();
     });
   });
   ```

2. **Test Error Handling**
   ```typescript
   it('should return error on invalid input', async () => {
     const result = await service.process(null);
     expect(result.ok).toBe(false);
   });
   ```

3. **Mock Dependencies**
   ```typescript
   const mockLogger = {
     info: () => {},
     error: () => {}
   };
   const service = new MyService(mockLogger);
   ```

### Run Tests

```bash
# Run all tests
bun run test

# Run unit tests
bun run test:unit

# Run security tests
bun run test:security

# Run with coverage
bun run test:coverage
```

## Documentation

### Writing Documentation

1. **Use Clear Language**
   - Write in simple English
   - Avoid jargon when possible
   - Be concise

2. **Include Examples**
   - Show code examples
   - Include usage patterns
   - Demonstrate common scenarios

3. **Add Cross-References**
   - Link to related documents
   - Reference API documentation
   - Connect related concepts

4. **Keep Updated**
   - Update docs with code changes
   - Review documentation regularly
   - Fix outdated information

### Documentation Structure

```
docs/
├── index.md              # Documentation hub
├── overview.md           # Project overview
├── architecture.md       # System architecture
├── getting-started.md    # Setup guide
├── development.md        # Development guide
├── [topic].md           # Topic documentation
└── api-reference.md      # API reference
```

### API Documentation

Document public APIs:

```typescript
/**
 * Logger service for structured logging.
 * 
 * @example
 * ```typescript
 * const logger = getLogger('my-service');
 * logger.info('Operation started', { id: '123' });
 * ```
 */
@Injectable({ scope: 'singleton' })
export class LoggerService {
  /**
   * Log an info message.
   * @param namespace - Log namespace
   * @param message - Log message
   * @param data - Additional data
   */
  info(namespace: string, message: string, data?: unknown): void {
    // Implementation
  }
}
```

## Reporting Issues

### Bug Reports

When reporting bugs, include:

1. **Description**
   - Clear problem description
   - Expected behavior
   - Actual behavior

2. **Steps to Reproduce**
   ```
   1. Step 1
   2. Step 2
   3. Step 3
   ```

3. **Environment**
   - Operating system
   - Node.js version
   - Bun/npm version
   - Package versions

4. **Logs**
   - Error messages
   - Stack traces
   - Console output

### Feature Requests

When requesting features, include:

1. **Problem Description**
   - What problem does this solve?
   - Why is this needed?

2. **Proposed Solution**
   - How should it work?
   - What are the benefits?

3. **Use Cases**
   - Who will use this?
   - When will it be used?

4. **Alternatives**
   - What alternatives exist?
   - Why are they not sufficient?

## Code Review

### Review Guidelines

1. **Code Quality**
   - Code is clean and readable
   - Follows project conventions
   - No code smells

2. **Functionality**
   - Code works as expected
   - Handles edge cases
   - Error handling is adequate

3. **Testing**
   - Tests are included
   - Tests cover edge cases
   - Tests pass

4. **Documentation**
   - Code is documented
   - Documentation is updated
   - Examples are provided

### Review Process

1. **Author**
   - Creates PR
   - Fills out template
   - Requests review

2. **Reviewer**
   - Reviews code
   - Leaves comments
   - Approves or requests changes

3. **Merge**
   - All checks pass
   - PR is approved
   - Code is merged

## Release Process

### Version Numbering

Follow semantic versioning:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update Version**
   ```bash
   # Update package.json version
   ```

2. **Update Changelog**
   - Document changes
   - List new features
   - Note breaking changes

3. **Create Release**
   - Tag release
   - Create GitHub release
   - Publish packages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions and Support

For questions:

1. **Check Documentation**
   - Search existing documentation
   - Review API reference
   - Check troubleshooting guide

2. **Search Issues**
   - Search existing issues
   - Check closed issues
   - Review discussions

3. **Ask in Discussions**
   - Start a discussion
   - Ask questions
   - Share ideas

4. **Open Issue**
   - Create new issue
   - Follow issue template
   - Provide details

## Recognition

Contributors are recognized in:

- README.md contributors section
- GitHub contributors page
- Release notes (for significant contributions)

## Related Documentation

- [Overview](overview.md) - Project introduction
- [Architecture](architecture.md) - System design
- [Development Guide](development.md) - Development workflow
