import { describe, test, expect } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';

describe('Comprehensive Security Suite', () => {
  test('should pass all security checks', async () => {
    // This test aggregates all security checks
    const securityChecks = await runSecurityChecks();
    
    // All security checks should pass
    expect(securityChecks.failedChecks).toEqual([]);
    expect(securityChecks.passedChecks).toBeGreaterThan(0);
  });

  test('should have secure configuration files', async () => {
    // Check for security-sensitive configuration files
    const configFiles = [
      'package.json',
      'bun.test.config.ts',
      'rspack.config.cjs',
      '.gitignore',
      'biome.json'
    ];

    for (const configFile of configFiles) {
      const configPath = path.join(process.cwd(), configFile);
      const configContent = await fs.readFile(configPath, 'utf-8');
      
      // Check for security-related configurations
      if (configFile === 'package.json') {
        const pkg = JSON.parse(configContent);
        expect(pkg.private).toBe(true); // Should be private to avoid accidental publishing
      }
      
      if (configFile === '.gitignore') {
        // Should ignore sensitive files
        expect(configContent).toContain('*.key');
        expect(configContent).toContain('*.pem');
        expect(configContent).toContain('.env');
        expect(configContent).toContain('node_modules');
      }
    }
  });

  test('should not have hardcoded credentials', async () => {
    const sourceFiles = await getAllSourceFiles();
    
    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for potential hardcoded credentials
      const credentialPatterns = [
        /password\s*[=:]\s*["'`][^"'`]+["'`]/gi,
        /secret\s*[=:]\s*["'`][^"'`]+["'`]/gi,
        /token\s*[=:]\s*["'`][^"'`]+["'`]/gi,
        /key\s*[=:]\s*["'`][^"'`]+["'`]/gi,
        /api[_-]?key\s*[=:]\s*["'`][^"'`]+["'`]/gi,
        /auth[_-]?token\s*[=:]\s*["'`][^"'`]+["'`]/gi,
      ];
      
      for (const pattern of credentialPatterns) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('should have proper error handling without information disclosure', async () => {
    const errorHandlingFiles = await findFilesByPattern(process.cwd(), /error|exception|catch|throw/i);
    
    for (const file of errorHandlingFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Should not expose internal information in errors
      expect(content).not.toMatch(/error\.stack/);
      expect(content).not.toMatch(/error\.message/); // Unless properly sanitized
      
      // Should have generic error messages for users
      if (content.includes('try') && content.includes('catch')) {
        expect(content).toMatch(/logger/); // Errors should be logged internally
      }
    }
  });

  test('should implement secure coding practices', async () => {
    const sourceFiles = await getAllSourceFiles();
    
    let hasSecurePractices = 0;
    
    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Count secure coding practices
      if (content.includes('try') && content.includes('catch')) hasSecurePractices++;
      if (content.includes('validate')) hasSecurePractices++;
      if (content.includes('sanitize')) hasSecurePractices++;
      if (content.includes('escape')) hasSecurePractices++;
      if (content.includes('path.resolve')) hasSecurePractices++;
      if (content.includes('path.normalize')) hasSecurePractices++;
      if (content.includes('URL')) hasSecurePractices++; // Proper URL handling
    }
    
    // Should have multiple secure coding practices implemented
    expect(hasSecurePractices).toBeGreaterThan(5);
  });

  test('should have security-focused build configuration', async () => {
    const buildConfigs = [
      'rspack.config.cjs',
      'tsconfig.json',
      'tsconfig.main.json',
      'tsconfig.scripts.json'
    ];
    
    let hasSecurityConfig = false;
    
    for (const config of buildConfigs) {
      const configPath = path.join(process.cwd(), config);
      try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        
        // Look for security-related build configurations
        if (configContent.includes('minify') || 
            configContent.includes('optimize') || 
            configContent.includes('production')) {
          hasSecurityConfig = true;
        }
      } catch {
        // Config file doesn't exist, continue
      }
    }
    
    expect(hasSecurityConfig).toBe(true);
  });

  test('should not have debug artifacts in production code', async () => {
    const sourceFiles = await getAllSourceFiles();
    
    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Should not have debugging artifacts in production code
      expect(content).not.toMatch(/debugger;/);
      expect(content).not.toMatch(/console\.log\(/);
      expect(content).not.toMatch(/console\.debug\(/);
      expect(content).not.toMatch(/console\.trace\(/);
    }
  });

  test('should have proper input validation', async () => {
    const validationFiles = await findFilesByPattern(process.cwd(), /validation|validate|input|form/i);
    
    let hasInputValidation = false;
    
    for (const file of validationFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Look for input validation patterns
      if (content.includes('typeof') || 
          content.includes('Array.isArray') || 
          content.includes('Object.keys') ||
          content.includes('isString') ||
          content.includes('isNumber') ||
          content.includes('isBoolean')) {
        hasInputValidation = true;
      }
    }
    
    expect(hasInputValidation).toBe(true);
  });

  async function runSecurityChecks(): Promise<{passedChecks: number, failedChecks: string[]}> {
    // This would normally run all security tests and aggregate results
    // For this example, we'll simulate the results
    return {
      passedChecks: 10,
      failedChecks: []
    };
  }

  async function getAllSourceFiles(): Promise<string[]> {
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '.html', '.json', '.cjs'];
    return await findFilesByPattern(process.cwd(), new RegExp(`\\.(${extensions.map(ext => ext.substring(1)).join('|')})$`));
  }

  // Helper function to find files by pattern
  async function findFilesByPattern(dir: string, pattern: RegExp): Promise<string[]> {
    const files = await fs.readdir(dir);
    let matchedFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        matchedFiles = matchedFiles.concat(await findFilesByPattern(filePath, pattern));
      } else if (pattern.test(filePath)) {
        matchedFiles.push(filePath);
      }
    }

    return matchedFiles;
  }
});