#!/usr/bin/env node

/**
 * Code Security Analyzer
 * Static analysis for security patterns in source code
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { LogLevel, buildLogger as logger } from '../lib/logger.ts';
import { fileExists, readJson } from '../lib/utils.ts';

interface SecurityIssue {
  file: string;
  line: number;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  pattern?: string;
}

const dangerousPatterns = [
  {
    pattern: /eval\s*\(/,
    category: 'Code Injection',
    severity: 'error' as const,
    message: 'Usage of eval() allows arbitrary code execution',
  },
  {
    pattern: /new\s+Function\s*\(/,
    category: 'Code Injection',
    severity: 'error' as const,
    message: 'new Function() allows arbitrary code execution',
  },
  {
    pattern: /\.exec\s*\(/,
    category: 'Command Injection',
    severity: 'error' as const,
    message: 'child_process.exec() can execute arbitrary shell commands',
  },
  {
    pattern: /\.spawn\s*\(/,
    category: 'Command Injection',
    severity: 'warning' as const,
    message: 'child_process.spawn() requires proper argument validation',
  },
  {
    pattern: /__dirname(?!\s*\*)/,
    category: 'Path Manipulation',
    severity: 'warning' as const,
    message: '__dirname should be wrapped to support bundlers',
  },
  {
    pattern: /__filename(?!\s*\*)/,
    category: 'Path Manipulation',
    severity: 'warning' as const,
    message: '__filename should be wrapped to support bundlers',
  },
  {
    pattern: /process\.env(?!\s*\[)/,
    category: 'Environment Variables',
    severity: 'info' as const,
    message: 'Access process.env directly may cause issues in some environments',
  },
  {
    pattern: /Math\.random\(\)/,
    category: 'Cryptography',
    severity: 'warning' as const,
    message: 'Math.random() is not cryptographically secure',
  },
  {
    pattern: /Buffer\([^)]*\)/,
    category: 'Buffer',
    severity: 'warning' as const,
    message: 'Buffer constructor is deprecated and can cause security issues',
  },
  {
    pattern: /innerHTML\s*=/,
    category: 'XSS',
    severity: 'warning' as const,
    message: 'innerHTML assignment can lead to XSS if input is not sanitized',
  },
  {
    pattern: /document\.write\s*\(/,
    category: 'XSS',
    severity: 'error' as const,
    message: 'document.write() can lead to XSS and is deprecated',
  },
  {
    pattern: /href\s*=\s*\{/,
    category: 'XSS',
    severity: 'warning' as const,
    message: 'Dynamic href requires sanitization to prevent javascript: injection',
  },
];

const requiredElectronSecurity = [
  {
    pattern: /nodeIntegration:\s*false/,
    message: 'nodeIntegration should be set to false for security',
  },
  {
    pattern: /contextIsolation:\s*true/,
    message: 'contextIsolation should be set to true for security',
  },
  { pattern: /sandbox:\s*true/, message: 'sandbox should be enabled when possible' },
  { pattern: /webSecurity:\s*true/, message: 'webSecurity should be enabled for production' },
  {
    pattern: /allowRunningInsecureContent:\s*false/,
    message: 'allowRunningInsecureContent should be false for security',
  },
];

function getAllFiles(dir: string): string[] {
  if (!fileExists(dir)) {
    return [];
  }

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function analyzeSource(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  const sourceDirs = ['./src/main', './src/renderer', './src/shared'];

  for (const sourceDir of sourceDirs) {
    if (!fileExists(sourceDir)) {
      logger.warn(`Source directory not found: ${sourceDir}`);
      continue;
    }

    const files = getAllFiles(sourceDir).filter(
      (f) => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.tsx') || f.endsWith('.jsx')
    );

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        for (const danger of dangerousPatterns) {
          if (danger.pattern.test(line)) {
            issues.push({
              file: path.relative(process.cwd(), file),
              line: lineNumber,
              severity: danger.severity,
              category: danger.category,
              message: danger.message,
              pattern: danger.pattern.source.slice(0, 50),
            });
          }
        }
      }
    }
  }

  return issues;
}

async function analyzeElectronConfig(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  const electronFiles = ['./src/main/window.ts', './src/main/index.ts'];

  for (const file of electronFiles) {
    if (!fileExists(file)) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');

    for (const requirement of requiredElectronSecurity) {
      if (!requirement.pattern.test(content)) {
        issues.push({
          file: path.relative(process.cwd(), file),
          line: 1,
          severity: 'error',
          category: 'Electron Security',
          message: requirement.message,
        });
      }
    }
  }

  return issues;
}

async function analyzeCSP(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  const htmlFiles = ['./src/renderer/index.html'];

  for (const file of htmlFiles) {
    if (!fileExists(file)) {
      continue;
    }

    const content = fs.readFileSync(file, 'utf-8');

    const cspMatch = content.match(/<meta[^>]*content=(["'])([^"'>]*)\1[^>]*>/i);
    if (!cspMatch) {
      issues.push({
        file,
        line: 1,
        severity: 'error',
        category: 'Security Headers',
        message: 'Content-Security-Policy meta tag is missing',
      });
      continue;
    }

    const csp = cspMatch[2];

    if (csp.includes("'unsafe-inline'")) {
      issues.push({
        file,
        line: 1,
        severity: 'warning',
        category: 'CSP',
        message: "CSP contains 'unsafe-inline' which weakens XSS protection",
      });
    }

    if (csp.includes("'unsafe-eval'")) {
      issues.push({
        file,
        line: 1,
        severity: 'error',
        category: 'CSP',
        message: "CSP contains 'unsafe-eval' which allows eval() and similar",
      });
    }
  }

  return issues;
}

async function analyzeSecrets(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  const secretPatterns = [
    {
      pattern:
        /['"`]?(?:api[_-]?key|apikey|api[_-]?token)['"`]?\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/i,
      message: 'Potential API key detected',
    },
    {
      pattern: /['"`]?(?:secret|password)['"`]?\s*[:=]\s*['"`][^'"`]{8,}['"`]/i,
      message: 'Potential password/secret detected',
    },
    { pattern: /AWS[_-]?(?:ACCESS|_SECRET)_KEY/i, message: 'Potential AWS credentials detected' },
    { pattern: /gh[pousr]_[a-zA-Z0-9]{36}/i, message: 'Potential GitHub token detected' },
  ];

  const excludePatterns = [/\.git/, /node_modules/, /\.env/, /package\.json/, /\.lock$/];

  const sourceFiles = getAllFiles('./src').filter((f) => f.endsWith('.ts') || f.endsWith('.js'));

  for (const file of sourceFiles) {
    const shouldExclude = excludePatterns.some((p) => p.test(file));
    if (shouldExclude) continue;

    const content = fs.readFileSync(file, 'utf-8');

    for (const secret of secretPatterns) {
      if (secret.pattern.test(content)) {
        issues.push({
          file: path.relative(process.cwd(), file),
          line: 1,
          severity: 'error',
          category: 'Secrets Detection',
          message: secret.message,
        });
      }
    }
  }

  return issues;
}

async function analyze(): Promise<boolean> {
  logger.building('🔍 Code Security Analyzer');

  const allIssues: SecurityIssue[] = [];

  logger.start('analyzing source code');
  const sourceIssues = await analyzeSource();
  allIssues.push(...sourceIssues);
  logger.complete('source code analysis');

  logger.start('analyzing Electron configuration');
  const electronIssues = await analyzeElectronConfig();
  allIssues.push(...electronIssues);
  logger.complete('Electron configuration analysis');

  logger.start('analyzing CSP headers');
  const cspIssues = await analyzeCSP();
  allIssues.push(...cspIssues);
  logger.complete('CSP header analysis');

  logger.start('scanning for secrets');
  const secretIssues = await analyzeSecrets();
  allIssues.push(...secretIssues);
  logger.complete('secret scanning');

  const errors = allIssues.filter((i) => i.severity === 'error');
  const warnings = allIssues.filter((i) => i.severity === 'warning');
  const infos = allIssues.filter((i) => i.severity === 'info');

  logger.group('Security Analysis Results');
  logger.info(`Total issues found: ${allIssues.length}`);
  logger.error(`Errors: ${errors.length}`);
  logger.warn(`Warnings: ${warnings.length}`);
  logger.info(`Info: ${infos.length}`);
  logger.groupEnd();

  if (errors.length > 0) {
    logger.group('Critical Issues');
    for (const issue of errors.slice(0, 10)) {
      logger.error(`${issue.file}:${issue.line} [${issue.category}] ${issue.message}`);
    }
    if (errors.length > 10) {
      logger.info(`... and ${errors.length - 10} more critical issues`);
    }
    logger.groupEnd();
  }

  if (process.argv.includes('--verbose') && warnings.length > 0) {
    logger.group('Warnings');
    for (const issue of warnings.slice(0, 10)) {
      logger.warn(`${issue.file}:${issue.line} [${issue.category}] ${issue.message}`);
    }
    if (warnings.length > 10) {
      logger.info(`... and ${warnings.length - 10} more warnings`);
    }
    logger.groupEnd();
  }

  if (process.argv.includes('--json')) {
    fs.writeFileSync(
      './code-security-report.json',
      JSON.stringify({ timestamp: new Date().toISOString(), issues: allIssues }, null, 2)
    );
    logger.success('Detailed report saved to code-security-report.json');
  }

  return errors.length === 0;
}

async function main(): Promise<void> {
  const success = await analyze();

  if (!success) {
    logger.error('Code security analysis found critical issues');
    process.exit(1);
  }

  logger.success('Code security analysis completed');
  process.exit(0);
}

main().catch((error: Error) => {
  logger.error('Analysis failed unexpectedly', error);
  process.exit(1);
});
