# Contributing

Contribution guidelines for the Electron Angular Rspack Starter project.

## Code Style

### Formatting

This project uses Biome for formatting:

```bash
bun run format        # Format all files
bun run format-check  # Check formatting
```

### Linting

This project uses Biome for linting:

```bash
bun run lint          # Run linting
bun run lint-check    # Check linting
```

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## Pull Requests

### Process

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests and linting
5. Submit pull request

### Requirements

- All tests must pass
- Code must be formatted
- No linting errors
- Commits follow conventional format
- PR description explains changes

## Development Guidelines

### General

1. Write TypeScript, not JavaScript
2. Use dependency injection
3. Follow the facade pattern for complex operations
4. Write tests for new features
5. Document public APIs
6. Keep components small and focused

### File Organization

1. Place services in appropriate directories
2. Use consistent naming conventions
3. Group related files together
4. Follow existing project structure

### Testing

1. Write unit tests for services
2. Test error handling
3. Mock external dependencies
4. Use descriptive test names

## Reporting Issues

### Bug Reports

When reporting bugs, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Node version, etc.)
5. Error messages or logs

### Feature Requests

When requesting features, include:

1. Problem description
2. Proposed solution
3. Use cases
4. Alternatives considered

## Documentation

### Writing Documentation

1. Use clear, concise language
2. Include code examples
3. Add related documentation links
4. Keep documentation up to date

### Documentation Structure

- `docs/overview.md` - Project introduction
- `docs/architecture.md` - System design
- `docs/getting-started.md` - Setup guide
- `docs/development.md` - Development workflow
- `docs/api/` - API reference

## Questions and Support

For questions:

1. Check existing documentation
2. Search existing issues
3. Ask in discussions
4. Open a new issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
