import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { type ChildProcess, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

describe('Security Testing Suite', () => {
  const appProcess: ChildProcess | null = null;

  test('should have proper security settings in main process', async () => {
    const mainProcessPath = path.join(process.cwd(), 'src/main/window.ts');
    const mainProcessCode = await fs.readFile(mainProcessPath, 'utf-8');

    expect(mainProcessCode).toContain('nodeIntegration: false');
    expect(mainProcessCode).toContain('contextIsolation: true');
    expect(mainProcessCode).toContain('sandbox: true');
    expect(mainProcessCode).toContain('webSecurity: true');
  });

  test('should have Content Security Policy in HTML files', async () => {
    const htmlFile = path.join(process.cwd(), 'src/renderer/index.html');
    const htmlContent = await fs.readFile(htmlFile, 'utf-8');

    const cspRegex = /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i;
    expect(htmlContent).toMatch(cspRegex);

    const cspMatch = htmlContent.match(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    if (cspMatch) {
      const cspContent = cspMatch[1];
      expect(cspContent).toContain("'self'");
      expect(cspContent).not.toContain("'unsafe-inline'");
      expect(cspContent).not.toContain("'unsafe-eval'");
    }
  });

  test('should have secure dependency versions', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (dependencies.electron) {
      const electronVersion = dependencies.electron.replace(/[^\d.]/g, '');
      const versionParts = electronVersion.split('.').map(Number);
      expect(versionParts[0]).toBeGreaterThanOrEqual(25);
    }
  });

  test('should prevent directory traversal in file operations', async () => {
    const sourceFiles = await findSourceFiles(process.cwd());

    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');

      if (content.includes('fs.') || content.includes('path.join')) {
        if (content.includes('../') || content.includes('..\\')) {
          expect(content).toContain('path.normalize');
          expect(content).toContain('path.resolve');
        }
      }
    }
  });

  test('should have secure IPC communication', async () => {
    const ipcContent = await findIpcContent();

    if (ipcContent.includes('ipcMain.handle') || ipcContent.includes('ipcMain.on')) {
      expect(ipcContent).toMatch(/validate|sanitize/i);
    }
  });

  async function findSourceFiles(dir: string): Promise<string[]> {
    const files = await fs.readdir(dir);
    let sourceFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        sourceFiles = sourceFiles.concat(await findSourceFiles(filePath));
      } else if (/\.(ts|js|tsx|jsx)$/.test(filePath)) {
        sourceFiles.push(filePath);
      }
    }

    return sourceFiles;
  }

  async function findIpcContent(): Promise<string> {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc/i);
    let combinedContent = '';

    for (const file of ipcFiles) {
      combinedContent += (await fs.readFile(file, 'utf-8')) + '\n';
    }

    return combinedContent;
  }

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

describe('IPC Security Tests', () => {
  test('should validate input in IPC handlers', async () => {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc|communication|handler/i);

    let foundValidation = false;

    for (const file of ipcFiles) {
      const content = await fs.readFile(file, 'utf-8');

      if (content.includes('ipcMain.handle') || content.includes('ipcMain.on')) {
        if (
          content.includes('validate') ||
          content.includes('isValid') ||
          content.includes('typeof') ||
          content.includes('Array.isArray')
        ) {
          foundValidation = true;
        }
      }
    }

    expect(foundValidation).toBe(true);
  });

  test('should sanitize input in IPC handlers', async () => {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc/i);

    let foundSanitization = false;

    for (const file of ipcFiles) {
      const content = await fs.readFile(file, 'utf-8');

      if (content.includes('ipcMain.handle') || content.includes('ipcMain.on')) {
        if (
          content.includes('sanitize') ||
          content.includes('escape') ||
          content.includes('strip') ||
          content.includes('xss')
        ) {
          foundSanitization = true;
        }
      }
    }

    expect(foundSanitization).toBe(true);
  });

  test('should not have dangerous IPC patterns', async () => {
    const ipcFiles = await findFilesByPattern(process.cwd(), /ipc/i);

    let foundDangerousPatterns = false;

    for (const file of ipcFiles) {
      const content = await fs.readFile(file, 'utf-8');

      if (
        content.includes('eval(') ||
        content.includes('new Function(') ||
        content.includes('vm.runIn') ||
        content.includes('child_process.exec')
      ) {
        if (!content.includes('validate') && !content.includes('saniti')) {
          foundDangerousPatterns = true;
        }
      }
    }

    expect(foundDangerousPatterns).toBe(false);
  });

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

describe('CSP Validation Tests', () => {
  test('should have CSP with restrictive directives', async () => {
    const htmlFile = path.join(process.cwd(), 'src/renderer/index.html');
    const htmlContent = await fs.readFile(htmlFile, 'utf-8');

    const cspMatch = htmlContent.match(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["'][^>]*>/i
    );
    expect(cspMatch).not.toBeNull();

    if (cspMatch) {
      const csp = cspMatch[1];
      expect(csp).toContain('default-src');
      expect(csp).toContain("'self'");
    }
  });

  test('should not allow inline scripts in CSP', async () => {
    const htmlFile = path.join(process.cwd(), 'src/renderer/index.html');
    const htmlContent = await fs.readFile(htmlFile, 'utf-8');

    const cspMatch = htmlContent.match(/<meta[^>]*content=(["'])([^"'>]*)\1[^>]*>/i);

    if (cspMatch) {
      const csp = cspMatch[2];
      expect(csp).not.toContain("'unsafe-inline'");
    }
  });
});

describe('Dependency Security Tests', () => {
  test('should have lock file for reproducible builds', async () => {
    const lockFiles = ['package-lock.json', 'bun.lock'];
    let hasLockFile = false;

    for (const lockFile of lockFiles) {
      const lockPath = path.join(process.cwd(), lockFile);
      try {
        await fs.access(lockPath);
        hasLockFile = true;
        break;
      } catch {}
    }

    expect(hasLockFile).toBe(true);
  });

  test('should use exact versions for critical dependencies', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (dependencies.electron) {
      expect(dependencies.electron).not.toMatch(/[\^~]/);
    }
  });
});
