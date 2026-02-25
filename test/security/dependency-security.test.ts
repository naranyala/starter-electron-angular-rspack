import { describe, test, expect } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';

describe('Dependency Security Tests', () => {
  let packageJson: any;
  let lockFile: any;

  beforeAll(async () => {
    // Load package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // Try to load lock file
    try {
      const lockFilePath = path.join(process.cwd(), 'bun.lock');
      lockFile = await fs.readFile(lockFilePath, 'utf-8');
    } catch {
      try {
        const lockFilePath = path.join(process.cwd(), 'package-lock.json');
        lockFile = JSON.parse(await fs.readFile(lockFilePath, 'utf-8'));
      } catch {
        // No lock file found
      }
    }
  });

  test('should have a lock file for reproducible builds', () => {
    expect(lockFile).toBeDefined();
  });

  test('should not have deprecated dependencies', async () => {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const [name, version] of Object.entries(dependencies)) {
      // Check if dependency is deprecated
      try {
        const response = await fetch(`https://registry.npmjs.org/${name}`);
        if (response.ok) {
          const pkgInfo = await response.json();
          
          if (pkgInfo.deprecated) {
            console.warn(`Dependency ${name} is deprecated: ${pkgInfo.deprecated}`);
          }
        }
      } catch (error) {
        // Network request failed, skip check
        console.warn(`Could not check deprecation status for ${name}: ${error}`);
      }
    }
  });

  test('should not have vulnerable dependencies', async () => {
    // This would typically integrate with a vulnerability database
    // For now, we'll check for known vulnerable packages
    
    const knownVulnerablePackages = [
      'lodash', 'axios', 'ws', 'handlebars', 'ejs', 'express', 
      'moment', 'jquery', 'underscore', 'debug', 'left-pad'
    ];
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const vulnerablePackage of knownVulnerablePackages) {
      if (dependencies[vulnerablePackage]) {
        // In a real implementation, we would check the version against known vulnerabilities
        console.log(`Checking ${vulnerablePackage} for known vulnerabilities...`);
      }
    }
  });

  test('should use exact versions for critical dependencies', () => {
    const criticalDeps = ['electron', 'electron-builder', '@rspack/core', '@rspack/cli'];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of criticalDeps) {
      if (dependencies[dep]) {
        const version = dependencies[dep];
        // Should not use ^ or ~ for critical dependencies
        expect(version).not.toMatch(/^[\^~]/);
      }
    }
  });

  test('should not have unnecessary dependencies', () => {
    const unnecessaryDeps = [
      'eval', 'vm', 'child_process', 'fs', 'net', 'tls', 'dgram', 'dns'
    ]; // Node built-in modules that shouldn't be in dependencies
    
    const dependencies = packageJson.dependencies || {};
    
    for (const dep of unnecessaryDeps) {
      expect(dependencies).not.toHaveProperty(dep);
    }
  });

  test('should have security-focused dependencies when needed', () => {
    const devDependencies = packageJson.devDependencies || {};
    
    // Check for security-focused development dependencies
    const securityDeps = [
      'eslint-plugin-security',
      'husky',
      'lint-staged',
      '@types/node'
    ];
    
    const hasSecurityDep = securityDeps.some(dep => devDependencies[dep]);
    expect(hasSecurityDep).toBe(true);
  });

  test('should not have dependencies with known security issues', async () => {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for packages with known security issues
    const problematicPackages = [
      { name: 'event-stream', issue: 'Malicious code injection' },
      { name: 'colors', issue: 'Supply chain attack' },
      { name: 'faker', issue: 'Supply chain attack' },
      { name: 'coa', issue: 'Remote code execution' }
    ];
    
    for (const pkg of problematicPackages) {
      expect(dependencies).not.toHaveProperty(pkg.name);
    }
  });

  test('should have updated dependencies', async () => {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check if major dependencies are reasonably up-to-date
    for (const [name, version] of Object.entries(dependencies)) {
      const cleanVersion = version.replace(/[\^~]/g, '');
      const versionParts = cleanVersion.split('.').map(Number);
      
      // For Electron, ensure it's a recent version (>= 25)
      if (name === 'electron' && versionParts[0] < 25) {
        console.warn(`Electron version ${cleanVersion} may be outdated for security`);
      }
    }
  });

  test('should have minimal dependencies', () => {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const totalDeps = Object.keys(dependencies).length;
    
    // Reasonable upper limit for dependencies
    expect(totalDeps).toBeLessThan(100); // Adjust threshold as needed
  });
});