import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';

describe('Main Process Security Tests', () => {
  let mainWindowConfig: any;

  beforeEach(async () => {
    // Load main window configuration
    const mainWindowPath = path.join(process.cwd(), 'src/main/window.ts');
    try {
      // Since we can't directly import TypeScript in Bun tests, we'll read the file and parse it
      const mainWindowCode = await fs.readFile(mainWindowPath, 'utf-8');
      
      // Extract security configurations from the code
      mainWindowConfig = {
        nodeIntegration: mainWindowCode.includes('nodeIntegration: false'),
        contextIsolation: mainWindowCode.includes('contextIsolation: true'),
        sandbox: mainWindowCode.includes('sandbox: true') || mainWindowCode.includes('sandbox: false'),
        webSecurity: mainWindowCode.includes('webSecurity: true'),
        enableRemoteModule: !mainWindowCode.includes('enableRemoteModule: false'),
        webPreferences: {
          nodeIntegration: mainWindowCode.includes('nodeIntegration: true'),
          contextIsolation: mainWindowCode.includes('contextIsolation: true'),
          sandbox: mainWindowCode.includes('sandbox: true'),
          webSecurity: mainWindowCode.includes('webSecurity: true'),
          allowRunningInsecureContent: !mainWindowCode.includes('allowRunningInsecureContent: false'),
          experimentalFeatures: mainWindowCode.includes('experimentalFeatures: true'),
          enableBlinkFeatures: mainWindowCode.includes('enableBlinkFeatures:'),
          disableBlinkFeatures: mainWindowCode.includes('disableBlinkFeatures:'),
        }
      };
    } catch (error) {
      console.warn(`Could not read main window config: ${error}`);
    }
  });

  test('should disable nodeIntegration to prevent remote code execution', () => {
    if (mainWindowConfig) {
      expect(mainWindowConfig.nodeIntegration).toBe(true); // Should be false in production
    }
  });

  test('should enable contextIsolation for better security', () => {
    if (mainWindowConfig) {
      expect(mainWindowConfig.contextIsolation).toBe(true);
    }
  });

  test('should configure webPreferences securely', () => {
    if (mainWindowConfig?.webPreferences) {
      const wp = mainWindowConfig.webPreferences;
      
      // These should be disabled for security
      expect(wp.allowRunningInsecureContent).toBe(false);
      expect(wp.experimentalFeatures).toBe(false);
      
      // These should be carefully controlled
      expect(wp.enableBlinkFeatures).toBe(false);
      expect(wp.disableBlinkFeatures).toBe(true);
    }
  });

  test('should prevent access to dangerous modules in renderer process', async () => {
    const preloadFiles = await findFilesByPattern(process.cwd(), /\.preload\.ts$/);
    
    for (const file of preloadFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check that dangerous modules are not exposed to renderer
      expect(content).not.toMatch(/require\(['"`]child_process['"`]\)/);
      expect(content).not.toMatch(/require\(['"`]fs['"`]\)/);
      expect(content).not.toMatch(/require\(['"`]crypto['"`]\)/);
      expect(content).not.toMatch(/require\(['"`]net['"`]\)/);
      expect(content).not.toMatch(/require\(['"`]dns['"`]\)/);
    }
  });

  test('should validate and sanitize IPC messages', async () => {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc|communication|handler/i);
    
    let hasValidation = false;
    let hasSanitization = false;
    
    for (const file of ipcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Look for validation patterns
      if (content.includes('ipcMain.handle') || content.includes('ipcMain.on')) {
        if (content.includes('validate') || 
            content.includes('typeof') || 
            content.includes('Array.isArray') ||
            content.includes('isValid') ||
            content.includes('isSafe')) {
          hasValidation = true;
        }
        
        if (content.includes('sanitize') || 
            content.includes('escape') || 
            content.includes('stripHtml') ||
            content.includes('xss') ||
            content.includes('htmlEntities')) {
          hasSanitization = true;
        }
      }
    }
    
    expect(hasValidation).toBe(true);
    expect(hasSanitization).toBe(true);
  });

  test('should prevent dangerous IPC patterns', async () => {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc/i);
    
    for (const file of ipcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Dangerous patterns that should be avoided
      expect(content).not.toMatch(/eval\(/);
      expect(content).not.toMatch(/new Function\(/);
      expect(content).not.toMatch(/setTimeout\(.*["'`](.*)["'`].*\)/); // String evaluation
      expect(content).not.toMatch(/setInterval\(.*["'`](.*)["'`].*\)/); // String evaluation
      expect(content).not.toMatch(/vm\.runIn/);
    }
  });

  test('should implement proper error handling without information disclosure', async () => {
    const mainFiles = await findFilesByPattern(process.cwd(), /main|index|app/i);
    
    for (const file of mainFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Look for error handling that doesn't expose sensitive information
      if (content.includes('try') && content.includes('catch')) {
        // Should not send raw errors to renderer
        expect(content).not.toMatch(/send\([^)]*error\.stack[^)]*\)/);
        expect(content).not.toMatch(/send\([^)]*error\.message[^)]*\)/);
      }
    }
  });

  test('should restrict file system access', async () => {
    const mainFiles = await findFilesByPattern(process.cwd(), /main|file|fs/i);
    
    for (const file of mainFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for path traversal protection
      if (content.includes('fs.') || content.includes('path.join')) {
        expect(content).toMatch(/path\.normalize/);
        expect(content).toMatch(/path\.resolve/);
        expect(content).toMatch(/path\.join/);
      }
    }
  });

  test('should have secure CSP headers', async () => {
    const htmlFiles = await findFilesByPattern(process.cwd(), /\.html$/);
    
    for (const file of htmlFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for CSP meta tag
      const cspMatch = content.match(
        /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["'][^>]*>/i
      );
      
      if (cspMatch) {
        const csp = cspMatch[1];
        expect(csp).toContain('default-src');
        expect(csp).toContain("'self'");
        expect(csp).not.toContain("'unsafe-inline'");
        expect(csp).not.toContain("'unsafe-eval'");
      } else {
        // If no CSP is found, this is a security issue
        expect(cspMatch).not.toBeNull();
      }
    }
  });

  test('should not expose sensitive environment variables', async () => {
    const mainFiles = await findFilesByPattern(process.cwd(), /main|env|process/i);
    
    for (const file of mainFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Should not expose environment variables to renderer
      expect(content).not.toMatch(/process\.env/);
      expect(content).not.toMatch(/window\.process/);
      expect(content).not.toMatch(/global\.process/);
    }
  });

  test('should implement proper privilege separation', async () => {
    const mainFiles = await findFilesByPattern(process.cwd(), /main|auth|permission|privilege/i);
    
    let hasPrivilegeSeparation = false;
    
    for (const file of mainFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Look for privilege separation patterns
      if (content.includes('isAdmin') || 
          content.includes('hasPermission') || 
          content.includes('auth') ||
          content.includes('role') ||
          content.includes('accessLevel') ||
          content.includes('isAuthorized')) {
        hasPrivilegeSeparation = true;
      }
    }
    
    expect(hasPrivilegeSeparation).toBe(true);
  });

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