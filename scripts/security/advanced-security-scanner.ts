#!/usr/bin/env node

/**
 * Advanced Security Scanner
 * Scans the codebase for security vulnerabilities and compliance issues
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line: number;
  description: string;
  recommendation: string;
  codeSnippet: string;
}

interface ScanResult {
  findings: SecurityFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scannedFiles: number;
  scanDuration: number;
}

class SecurityScanner {
  private findings: SecurityFinding[] = [];
  private startTime: number;
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
    this.startTime = Date.now();
  }

  async scanProject(): Promise<ScanResult> {
    console.log('🔍 Starting Advanced Security Scan...\n');

    const sourceFiles = await this.findAllSourceFiles();
    console.log(`📄 Found ${sourceFiles.length} files to scan\n`);

    // Scan each file for security issues
    for (const file of sourceFiles) {
      await this.scanFile(file);
    }

    // Generate results
    const scanResult: ScanResult = {
      findings: this.findings,
      summary: this.generateSummary(),
      scannedFiles: sourceFiles.length,
      scanDuration: Date.now() - this.startTime
    };

    // Print results
    this.printResults(scanResult);

    // Save detailed report
    await this.saveReport(scanResult);

    return scanResult;
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        const line = lines[i];

        // Check for various security issues
        this.checkForEvalUsage(filePath, lineNum, line);
        this.checkForPathTraversal(filePath, lineNum, line);
        this.checkForHardcodedCredentials(filePath, lineNum, line);
        this.checkForInsecureDeserialization(filePath, lineNum, line);
        this.checkForDOMXSS(filePath, lineNum, line);
        this.checkForCommandInjection(filePath, lineNum, line);
        this.checkForSQLInjection(filePath, lineNum, line);
        this.checkForWeakCrypto(filePath, lineNum, line);
        this.checkForInsecureRandom(filePath, lineNum, line);
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan file ${filePath}: ${(error as Error).message}`);
    }
  }

  private checkForEvalUsage(filePath: string, lineNum: number, line: string): void {
    if (line.includes('eval(') || line.includes('new Function(')) {
      this.addFinding({
        id: 'SEC-EVAL-001',
        severity: 'critical',
        category: 'Code Injection',
        file: filePath,
        line: lineNum,
        description: 'Use of eval() or Function constructor detected',
        recommendation: 'Avoid dynamic code evaluation. Use safer alternatives like JSON.parse() for data parsing.',
        codeSnippet: line.trim()
      });
    }
  }

  private checkForPathTraversal(filePath: string, lineNum: number, line: string): void {
    if (line.includes('path.join') && (line.includes('..') || line.includes('../'))) {
      if (!line.includes('path.normalize') && !line.includes('path.resolve')) {
        this.addFinding({
          id: 'SEC-PATH-001',
          severity: 'high',
          category: 'Path Traversal',
          file: filePath,
          line: lineNum,
          description: 'Potential path traversal without proper normalization',
          recommendation: 'Use path.normalize() or path.resolve() to prevent directory traversal attacks.',
          codeSnippet: line.trim()
        });
      }
    }
  }

  private checkForHardcodedCredentials(filePath: string, lineNum: number, line: string): void {
    // Regex patterns for potential credentials
    const credentialPatterns = [
      /password\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
      /secret\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
      /token\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
      /key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
      /api[_-]?key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
      /[A-Z]{2,}_KEY\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
      /[A-Z]{2,}_TOKEN\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
      /(?<=[\s(,])["'`][A-Za-z0-9]{32,}["'`]/g, // Long hex strings that might be tokens
    ];

    for (const pattern of credentialPatterns) {
      const matches = line.match(pattern);
      if (matches) {
        this.addFinding({
          id: 'SEC-CRED-001',
          severity: 'critical',
          category: 'Hardcoded Credentials',
          file: filePath,
          line: lineNum,
          description: `Potential hardcoded credential detected: ${matches[0]}`,
          recommendation: 'Move credentials to environment variables or secure configuration management systems.',
          codeSnippet: line.trim()
        });
      }
    }
  }

  private checkForInsecureDeserialization(filePath: string, lineNum: number, line: string): void {
    if (line.includes('JSON.parse') && (line.toLowerCase().includes('req.') || line.toLowerCase().includes('userinput') || line.toLowerCase().includes('data'))) {
      this.addFinding({
        id: 'SEC-DESERIALIZE-001',
        severity: 'high',
        category: 'Insecure Deserialization',
        file: filePath,
        line: lineNum,
        description: 'Unvalidated input to JSON.parse() detected',
        recommendation: 'Validate and sanitize input before parsing. Consider using a schema validation library.',
        codeSnippet: line.trim()
      });
    }
  }

  private checkForDOMXSS(filePath: string, lineNum: number, line: string): void {
    if (line.includes('innerHTML') || line.includes('outerHTML') || line.includes('document.write')) {
      if (!line.includes('sanitize') && !line.includes('escape') && !line.includes('encode')) {
        this.addFinding({
          id: 'SEC-DOMXSS-001',
          severity: 'high',
          category: 'DOM XSS',
          file: filePath,
          line: lineNum,
          description: 'Potential DOM-based XSS via direct HTML assignment',
          recommendation: 'Sanitize user input before inserting into DOM or use safer methods like textContent.',
          codeSnippet: line.trim()
        });
      }
    }
  }

  private checkForCommandInjection(filePath: string, lineNum: number, line: string): void {
    if (line.includes('exec(') || line.includes('spawn(') || line.includes('execFile(')) {
      if (line.toLowerCase().includes('user') || line.toLowerCase().includes('input') || line.toLowerCase().includes('req.')) {
        this.addFinding({
          id: 'SEC-CMD-001',
          severity: 'critical',
          category: 'Command Injection',
          file: filePath,
          line: lineNum,
          description: 'Potential command injection with user input',
          recommendation: 'Avoid passing user input directly to system commands. Use parameterized queries or validation.',
          codeSnippet: line.trim()
        });
      }
    }
  }

  private checkForSQLInjection(filePath: string, lineNum: number, line: string): void {
    // This is a simplified check - in a real scanner, you'd need more sophisticated SQL parsing
    if (line.toLowerCase().includes('select ') || line.toLowerCase().includes('insert ') || 
        line.toLowerCase().includes('update ') || line.toLowerCase().includes('delete ')) {
      if (line.toLowerCase().includes('user') || line.toLowerCase().includes('input') || 
          line.toLowerCase().includes('req.') || line.includes('+') || line.includes('concat')) {
        this.addFinding({
          id: 'SEC-SQL-001',
          severity: 'high',
          category: 'SQL Injection',
          file: filePath,
          line: lineNum,
          description: 'Potential SQL injection with user input',
          recommendation: 'Use parameterized queries or prepared statements instead of string concatenation.',
          codeSnippet: line.trim()
        });
      }
    }
  }

  private checkForWeakCrypto(filePath: string, lineNum: number, line: string): void {
    if (line.includes('crypto.createHash') && (line.includes('md5') || line.includes('sha1'))) {
      this.addFinding({
        id: 'SEC-CRYPTO-001',
        severity: 'medium',
        category: 'Weak Cryptography',
        file: filePath,
        line: lineNum,
        description: 'Use of weak cryptographic hash functions (MD5/SHA1)',
        recommendation: 'Use stronger hash functions like SHA-256 or SHA-3.',
        codeSnippet: line.trim()
      });
    }
  }

  private checkForInsecureRandom(filePath: string, lineNum: number, line: string): void {
    if (line.includes('Math.random')) {
      this.addFinding({
        id: 'SEC-RANDOM-001',
        severity: 'medium',
        category: 'Insecure Random Generation',
        file: filePath,
        line: lineNum,
        description: 'Use of Math.random() for security purposes',
        recommendation: 'Use crypto.randomBytes() or crypto.getRandomValues() for cryptographically secure random values.',
        codeSnippet: line.trim()
      });
    }
  }

  private addFinding(finding: SecurityFinding): void {
    // Avoid duplicate findings
    const isDuplicate = this.findings.some(
      f => f.file === finding.file && f.line === finding.line && f.id === finding.id
    );

    if (!isDuplicate) {
      this.findings.push(finding);
    }
  }

  private generateSummary(): ScanResult['summary'] {
    return {
      total: this.findings.length,
      critical: this.findings.filter(f => f.severity === 'critical').length,
      high: this.findings.filter(f => f.severity === 'high').length,
      medium: this.findings.filter(f => f.severity === 'medium').length,
      low: this.findings.filter(f => f.severity === 'low').length,
    };
  }

  private printResults(result: ScanResult): void {
    console.log('\n📊 Security Scan Results:');
    console.log(`  Total Findings: ${result.summary.total}`);
    console.log(`  Critical: ${result.summary.critical}`);
    console.log(`  High: ${result.summary.high}`);
    console.log(`  Medium: ${result.summary.medium}`);
    console.log(`  Low: ${result.summary.low}`);
    console.log(`  Files Scanned: ${result.scannedFiles}`);
    console.log(`  Duration: ${(result.scanDuration / 1000).toFixed(2)}s\n`);

    if (result.summary.total > 0) {
      console.log('🚨 Security Issues Found:\n');
      
      // Group findings by severity
      const severityOrder = ['critical', 'high', 'medium', 'low'];
      
      for (const severity of severityOrder) {
        const severityFindings = result.findings.filter(f => f.severity === severity);
        
        if (severityFindings.length > 0) {
          console.log(`\n${severity.toUpperCase()} SEVERITY ISSUES (${severityFindings.length}):`);
          console.log('=' .repeat(50));
          
          for (const finding of severityFindings) {
            console.log(`\n📁 File: ${finding.file}:${finding.line}`);
            console.log(`🆔 ID: ${finding.id}`);
            console.log(`🏷️  Category: ${finding.category}`);
            console.log(`📝 Description: ${finding.description}`);
            console.log(`💡 Recommendation: ${finding.recommendation}`);
            console.log(`💻 Code: ${finding.codeSnippet}`);
          }
        }
      }
    } else {
      console.log('✅ No security issues found!');
    }
  }

  private async saveReport(result: ScanResult): Promise<void> {
    const report = {
      scanDate: new Date().toISOString(),
      ...result
    };

    const reportPath = path.join(process.cwd(), 'security-scan-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  }

  private async findAllSourceFiles(): Promise<string[]> {
    const extensions = ['.ts', '.js', '.tsx', '.jsx', '.html', '.json', '.cjs', '.mjs', '.css', '.scss'];
    const files: string[] = [];
    
    const walkDir = async (dir: string): Promise<void> => {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      
      for (const dirent of dirents) {
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
          if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && 
              !fullPath.includes('dist') && !fullPath.includes('coverage') && 
              !fullPath.includes('build')) {
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
}

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');

// Run the security scanner
const scanner = new SecurityScanner(verbose);
scanner.scanProject()
  .then(result => {
    // Exit with error code if critical or high severity issues found
    if (result.summary.critical > 0 || result.summary.high > 0) {
      console.log('\n⚠️  Security scan found critical or high severity issues. Exiting with error.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Security scan failed:', error);
    process.exit(1);
  });