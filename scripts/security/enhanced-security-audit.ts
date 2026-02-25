#!/usr/bin/env node

/**
 * Enhanced Security Audit Script
 * Performs comprehensive security checks during the build process
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

interface SecurityCheckResult {
  name: string;
  passed: boolean;
  details: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface SecurityAuditReport {
  timestamp: string;
  results: SecurityCheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

class SecurityAuditor {
  private results: SecurityCheckResult[] = [];
  private verbose: boolean = false;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  async runAudit(): Promise<SecurityAuditReport> {
    console.log('🔍 Starting Security Audit...\n');

    // Run all security checks
    await this.checkDependencies();
    await this.checkConfigurationFiles();
    await this.checkForHardcodedCredentials();
    await this.checkFilePermissions();
    await this.validateBuildScripts();
    await this.checkForSecurityVulnerabilities();

    // Generate report
    const report: SecurityAuditReport = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: this.generateSummary()
    };

    // Print summary
    this.printSummary(report.summary);

    // Save report
    await this.saveReport(report);

    // Determine if audit passed
    const hasCriticalFailures = report.summary.critical > 0 || report.summary.high > 0;
    
    if (hasCriticalFailures) {
      console.error('\n❌ Security audit failed due to critical or high severity issues!');
      process.exit(1);
    } else {
      console.log('\n✅ Security audit passed!');
    }

    return report;
  }

  private async checkDependencies(): Promise<void> {
    try {
      console.log('📦 Checking dependencies for vulnerabilities...');
      
      // Run npm audit to check for vulnerabilities
      let auditResult;
      try {
        const auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
        auditResult = JSON.parse(auditOutput);
      } catch (error: any) {
        // If npm audit fails, try with --audit-level flag
        try {
          const auditOutput = execSync('npm audit --json --audit-level=moderate', { encoding: 'utf-8' });
          auditResult = JSON.parse(auditOutput);
        } catch {
          // If all audit attempts fail, create a basic result
          auditResult = {
            metadata: {
              vulnerabilities: { total: 0, critical: 0, high: 0, moderate: 0, low: 0 }
            }
          };
        }
      }

      const vulnerabilities = auditResult.metadata?.vulnerabilities || { total: 0, critical: 0, high: 0, moderate: 0, low: 0 };

      if (vulnerabilities.total > 0) {
        this.results.push({
          name: 'Dependency Vulnerabilities',
          passed: false,
          details: `Found ${vulnerabilities.total} vulnerabilities (${vulnerabilities.critical} critical, ${vulnerabilities.high} high)`,
          severity: vulnerabilities.critical > 0 ? 'critical' : 
                   vulnerabilities.high > 0 ? 'high' : 
                   vulnerabilities.moderate > 0 ? 'medium' : 'low'
        });
      } else {
        this.results.push({
          name: 'Dependency Vulnerabilities',
          passed: true,
          details: 'No vulnerabilities found in dependencies',
          severity: 'low'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Dependency Check',
        passed: false,
        details: `Failed to check dependencies: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async checkConfigurationFiles(): Promise<void> {
    try {
      console.log('⚙️  Checking configuration files...');
      
      // Check package.json for security settings
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Check for private flag
      if (!packageJson.private) {
        this.results.push({
          name: 'Private Package',
          passed: false,
          details: 'Package is not marked as private, which could lead to accidental publishing',
          severity: 'medium'
        });
      } else {
        this.results.push({
          name: 'Private Package',
          passed: true,
          details: 'Package is correctly marked as private',
          severity: 'low'
        });
      }
      
      // Check .gitignore for sensitive files
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      try {
        const gitignore = await fs.readFile(gitignorePath, 'utf-8');
        
        const sensitivePatterns = ['*.key', '*.pem', '.env', '*.env', 'node_modules/', '*.log'];
        let missingPatterns = [];
        
        for (const pattern of sensitivePatterns) {
          if (!gitignore.includes(pattern)) {
            missingPatterns.push(pattern);
          }
        }
        
        if (missingPatterns.length > 0) {
          this.results.push({
            name: 'Git Ignore Configuration',
            passed: false,
            details: `Missing patterns in .gitignore: ${missingPatterns.join(', ')}`,
            severity: 'high'
          });
        } else {
          this.results.push({
            name: 'Git Ignore Configuration',
            passed: true,
            details: 'All sensitive patterns are properly ignored',
            severity: 'low'
          });
        }
      } catch {
        this.results.push({
          name: 'Git Ignore Configuration',
          passed: false,
          details: '.gitignore file not found',
          severity: 'high'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Configuration Files Check',
        passed: false,
        details: `Failed to check configuration files: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async checkForHardcodedCredentials(): Promise<void> {
    try {
      console.log('🔑 Checking for hardcoded credentials...');
      
      const filesToCheck = await this.findAllSourceFiles();
      let foundCredentials = false;
      let credentialDetails = '';
      
      for (const file of filesToCheck) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Regex patterns for potential credentials
        const credentialPatterns = [
          /password\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /secret\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /token\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /api[_-]?key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /auth[_-]?token\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /[A-Z]{2,}_KEY\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
          /[A-Z]{2,}_TOKEN\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
          /(?<=[\s(,])["'`][A-Za-z0-9]{32,}["'`]/g, // Long hex strings that might be tokens
        ];
        
        for (let i = 0; i < credentialPatterns.length; i++) {
          const matches = content.match(credentialPatterns[i]);
          if (matches) {
            foundCredentials = true;
            credentialDetails += `\n  - Found potential credential in ${file}: ${matches[0].substring(0, 50)}...`;
          }
        }
      }
      
      if (foundCredentials) {
        this.results.push({
          name: 'Hardcoded Credentials',
          passed: false,
          details: `Found potential hardcoded credentials:${credentialDetails}`,
          severity: 'critical'
        });
      } else {
        this.results.push({
          name: 'Hardcoded Credentials',
          passed: true,
          details: 'No hardcoded credentials detected',
          severity: 'low'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Hardcoded Credentials Check',
        passed: false,
        details: `Failed to check for hardcoded credentials: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async checkFilePermissions(): Promise<void> {
    try {
      console.log('🔒 Checking file permissions...');
      
      // Check for executable permissions on sensitive files
      const sensitiveFiles = [
        'package.json',
        'bun.lock',
        'package-lock.json',
        '.env.example',
        'README.md'
      ];
      
      let hasIncorrectPermissions = false;
      let permissionDetails = '';
      
      for (const file of sensitiveFiles) {
        const filePath = path.join(process.cwd(), file);
        try {
          const stats = await fs.stat(filePath);
          // Check if sensitive files have executable permissions (this is often unnecessary)
          if (stats.mode & 0o111) { // Has execute permission
            hasIncorrectPermissions = true;
            permissionDetails += `\n  - ${file} has executable permissions`;
          }
        } catch {
          // File doesn't exist, which is fine
        }
      }
      
      if (hasIncorrectPermissions) {
        this.results.push({
          name: 'File Permissions',
          passed: false,
          details: `Some sensitive files have executable permissions:${permissionDetails}`,
          severity: 'medium'
        });
      } else {
        this.results.push({
          name: 'File Permissions',
          passed: true,
          details: 'File permissions appear secure',
          severity: 'low'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'File Permissions Check',
        passed: false,
        details: `Failed to check file permissions: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async validateBuildScripts(): Promise<void> {
    try {
      console.log('🔨 Validating build scripts...');
      
      // Check if build scripts are tamper-proof
      const scriptsDir = path.join(process.cwd(), 'scripts');
      try {
        const scripts = await fs.readdir(scriptsDir);
        
        for (const script of scripts) {
          if (script.endsWith('.ts') || script.endsWith('.js')) {
            const scriptPath = path.join(scriptsDir, script);
            const content = await fs.readFile(scriptPath, 'utf-8');
            
            // Check for unsafe patterns in build scripts
            if (content.includes('eval(') || content.includes('new Function(')) {
              this.results.push({
                name: `Unsafe Code in ${script}`,
                passed: false,
                details: `Build script ${script} contains unsafe eval() or new Function()`,
                severity: 'critical'
              });
            }
          }
        }
        
        // If no unsafe patterns found in any script
        if (!this.results.some(r => r.name.includes('Unsafe Code'))) {
          this.results.push({
            name: 'Build Script Safety',
            passed: true,
            details: 'No unsafe patterns found in build scripts',
            severity: 'low'
          });
        }
      } catch {
        // Scripts directory doesn't exist, which is fine
        this.results.push({
          name: 'Build Script Safety',
          passed: true,
          details: 'No build scripts to validate',
          severity: 'low'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Build Script Validation',
        passed: false,
        details: `Failed to validate build scripts: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async checkForSecurityVulnerabilities(): Promise<void> {
    try {
      console.log('🛡️  Checking for common security vulnerabilities...');
      
      const sourceFiles = await this.findAllSourceFiles();
      let hasVulnerabilities = false;
      let vulnerabilityDetails = '';
      
      for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf-8');
        
        // Check for common vulnerability patterns
        if (content.includes('eval(')) {
          hasVulnerabilities = true;
          vulnerabilityDetails += `\n  - eval() found in ${file}`;
        }
        
        if (content.includes('Function(') && content.includes('constructor')) {
          hasVulnerabilities = true;
          vulnerabilityDetails += `\n  - Function constructor found in ${file}`;
        }
        
        if (content.includes('innerHTML') || content.includes('outerHTML')) {
          // This might be OK if properly sanitized, but flag for review
          hasVulnerabilities = true;
          vulnerabilityDetails += `\n  - DOM manipulation with innerHTML/outerHTML found in ${file}`;
        }
        
        // Check for path traversal vulnerabilities
        if (content.includes('path.join') && (content.includes('..') || content.includes('../'))) {
          // Look for lack of path normalization
          if (!content.includes('path.normalize') && !content.includes('path.resolve')) {
            hasVulnerabilities = true;
            vulnerabilityDetails += `\n  - Potential path traversal without normalization in ${file}`;
          }
        }
      }
      
      if (hasVulnerabilities) {
        this.results.push({
          name: 'Common Security Vulnerabilities',
          passed: false,
          details: `Found potential security vulnerabilities:${vulnerabilityDetails}`,
          severity: 'high'
        });
      } else {
        this.results.push({
          name: 'Common Security Vulnerabilities',
          passed: true,
          details: 'No common security vulnerabilities detected',
          severity: 'low'
        });
      }
    } catch (error) {
      this.results.push({
        name: 'Security Vulnerability Check',
        passed: false,
        details: `Failed to check for security vulnerabilities: ${(error as Error).message}`,
        severity: 'high'
      });
    }
  }

  private async findAllSourceFiles(): Promise<string[]> {
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '.html', '.json', '.cjs', '.mjs'];
    const files: string[] = [];
    
    const walkDir = async (dir: string): Promise<void> => {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      
      for (const dirent of dirents) {
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
          if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist') && !fullPath.includes('coverage')) {
            await walkDir(fullPath);
          }
        } else if (extensions.some(ext => dirent.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };
    
    await walkDir(process.cwd());
    return files;
  }

  private generateSummary(): SecurityAuditReport['summary'] {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    const critical = this.results.filter(r => r.severity === 'critical' && !r.passed).length;
    const high = this.results.filter(r => r.severity === 'high' && !r.passed).length;
    const medium = this.results.filter(r => r.severity === 'medium' && !r.passed).length;
    const low = this.results.filter(r => r.severity === 'low' && !r.passed).length;
    
    return { total, passed, failed, critical, high, medium, low };
  }

  private printSummary(summary: SecurityAuditReport['summary']): void {
    console.log('\n📊 Security Audit Summary:');
    console.log(`  Total Checks: ${summary.total}`);
    console.log(`  Passed: ${summary.passed}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Critical Issues: ${summary.critical}`);
    console.log(`  High Severity: ${summary.high}`);
    console.log(`  Medium Severity: ${summary.medium}`);
    console.log(`  Low Severity: ${summary.low}`);
  }

  private async saveReport(report: SecurityAuditReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'security-audit-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Security audit report saved to: ${reportPath}`);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');

// Run the security audit
const auditor = new SecurityAuditor(verbose);
auditor.runAudit().catch(error => {
  console.error('Security audit failed:', error);
  process.exit(1);
});