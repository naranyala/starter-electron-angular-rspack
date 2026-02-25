# Security Testing and Build Pipeline

## Bun Test Runner Configuration

This project includes security-focused tests using bun test runner.

### Running Security Tests

```bash
# Run all security tests
npm run test:security

# Run security tests in watch mode
npm run test:security:watch

# Run with coverage
npm run test:security --coverage
```

### Security Build Pipeline

The security build pipeline includes multiple security checks:

```bash
# Run full security audit
npm run security:audit

# Scan dependencies for vulnerabilities
npm run security:scan

# Analyze code for security patterns
npm run security:analyze

# Verify build artifacts
npm run security:verify

# Run all security checks
npm run security:all
```

### Available Security Scripts

| Script | Description |
|--------|-------------|
| `npm run test:security` | Run bun test suite for security tests |
| `npm run security:scan` | Scan dependencies for known vulnerabilities using npm audit |
| `npm run security:analyze` | Static analysis for dangerous code patterns |
| `npm run security:audit` | Comprehensive security audit with all checks |
| `npm run security:verify` | Verify build artifacts for security issues |

### Security Checks Included

1. **Dependency Vulnerability Scan**: Checks for known CVEs in dependencies
2. **Dependency Version Analysis**: Ensures proper version pinning
3. **Security Headers Validation**: Validates CSP and other security headers
4. **Code Security Patterns**: Detects dangerous patterns (eval, exec, etc.)
5. **Secret Detection**: Scans for exposed secrets in source code
6. **File System Security**: Checks for path traversal vulnerabilities
7. **Network Security**: Validates network request handling
8. **Build Artifact Verification**: Ensures production builds are secure

### Bun Test Runner Benefits

- Fast execution with Bun's native JIT compiler
- Built-in TypeScript support
- Native coverage reporting
- Watch mode for development
- Simple test syntax with bun:test
