#!/usr/bin/env node
/**
 * Security Build Script
 * Security-focused build pipeline with automated security checks
 */

import { LogLevel, buildLogger as logger } from '../lib/logger.ts';
import {
  checkRequiredFiles,
  exec,
  fileExists,
  readJson,
  setupProcessHandlers,
} from '../lib/utils.ts';

const WITH_SECURITY_AUDIT = process.argv.includes('--audit');
const WITH_DEPENDENCY_SCAN = process.argv.includes('--dependency-scan');
const WITH_CODE_ANALYSIS = process.argv.includes('--code-analysis');
const WITH_VERIFICATION = process.argv.includes('--verify');
const FAIL_ON_WARNINGS = process.argv.includes('--fail-on-warnings');
const QUIET = process.argv.includes('--quiet');
const VERBOSE = process.argv.includes('--verbose');

if (QUIET) {
  logger['level'] = LogLevel.ERROR;
}

interface SecurityCheckResult {
  name: string;
  passed: boolean;
  warnings: string[];
  errors: string[];
  duration: number;
}

const securityChecks: SecurityCheckResult[] = [];

async function runSecurityChecks(): Promise<boolean> {
  logger.group('🔐 Security Checks');

  const checks = [
    { name: 'Dependency Vulnerability Scan', fn: checkDependencyVulnerabilities },
    { name: 'Dependency Version Analysis', fn: checkDependencyVersions },
    { name: 'Security Headers Validation', fn: checkSecurityHeaders },
    { name: 'Code Security Patterns', fn: checkCodeSecurityPatterns },
    { name: 'Secret Detection', fn: checkForSecrets },
    { name: 'File System Security', fn: checkFileSystemSecurity },
    { name: 'Network Security', fn: checkNetworkSecurity },
    { name: 'Build Artifact Verification', fn: verifyBuildArtifacts },
  ];

  let allPassed = true;

  for (const check of checks) {
    const startTime = Date.now();
    logger.start(check.name);

    try {
      const result = await check.fn();
      const duration = Date.now() - startTime;

      securityChecks.push({
        name: check.name,
        passed: result.passed,
        warnings: result.warnings,
        errors: result.errors,
        duration,
      });

      if (result.passed) {
        logger.success(`${check.name} passed`);
      } else {
        logger.error(`${check.name} failed`);
        allPassed = false;
      }

      if (result.warnings.length > 0 && VERBOSE) {
        for (const warning of result.warnings) {
          logger.warn(warning);
        }
      }

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          logger.error(error);
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      securityChecks.push({
        name: check.name,
        passed: false,
        warnings: [],
        errors: [`Security check failed with error: ${(error as Error).message}`],
        duration,
      });
      allPassed = false;
      logger.error(`${check.name} error: ${(error as Error).message}`);
    }
  }

  logger.groupEnd();

  if (!allPassed && FAIL_ON_WARNINGS) {
    logger.error('Security checks failed with warnings set to fail the build');
    return false;
  }

  return allPassed;
}

async function checkDependencyVulnerabilities() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const packageJson = readJson<any>('./package.json');
    if (!packageJson) {
      errors.push('Could not read package.json');
      return { passed: false, warnings, errors };
    }

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const vulnerablePackages = [
      { name: 'lodash', maxVersion: '4.17.21', cve: 'CVE-2021-23337' },
      { name: 'axios', maxVersion: '0.21.1', cve: 'CVE-2020-28168' },
      { name: 'ws', maxVersion: '7.4.1', cve: 'CVE-2024-37890' },
      { name: 'path-to-regexp', maxVersion: '3.2.0', cve: 'CVE-2022-0235' },
      { name: 'node-forge', maxVersion: '0.10.0', cve: 'CVE-2021-21239' },
    ];

    for (const vuln of vulnerablePackages) {
      if (dependencies[vuln.name]) {
        const version = dependencies[vuln.name].replace(/[\^~]/, '');
        if (version < vuln.maxVersion) {
          errors.push(
            `${vuln.name} version ${dependencies[vuln.name]} is vulnerable to ${vuln.cve}`
          );
          passed = false;
        }
      }
    }

    const outdatedPackages = [
      'electron',
      'typescript',
      '@types/node',
      '@rspack/cli',
      '@rspack/core',
    ];

    for (const pkg of outdatedPackages) {
      if (dependencies[pkg]) {
        const majorVersion = dependencies[pkg].replace(/[\^\d.]/g, '').split('.')[0];
        if (parseInt(majorVersion) < 25) {
          warnings.push(`${pkg} version ${dependencies[pkg]} may be outdated`);
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to check dependencies: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkDependencyVersions() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const packageJson = readJson<any>('./package.json');
    if (!packageJson) {
      errors.push('Could not read package.json');
      return { passed: false, warnings, errors };
    }

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const criticalPackages = ['electron'];

    for (const pkg of criticalPackages) {
      if (dependencies[pkg]) {
        const version = dependencies[pkg];
        if (version.includes('^')) {
          warnings.push(
            `${pkg} uses caret version range (^${version}), consider pinning exact version`
          );
        }
        if (version.includes('~')) {
          warnings.push(
            `${pkg} uses tilde version range (~${version}), consider pinning exact version`
          );
        }
      }
    }

    const lockFiles = ['package-lock.json', 'bun.lock'];
    const lockFileExists = lockFiles.some((f) => fileExists(f));
    if (!lockFileExists) {
      errors.push(
        'No lock file found (package-lock.json or bun.lock). Lock files are critical for reproducible builds.'
      );
      passed = false;
    }
  } catch (error) {
    errors.push(`Failed to check dependency versions: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkSecurityHeaders() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const htmlFiles = ['./src/renderer/index.html'];

    for (const htmlFile of htmlFiles) {
      if (fileExists(htmlFile)) {
        const content = fs.readFileSync(htmlFile, 'utf-8');

        const requiredHeaders = [
          {
            name: 'Content-Security-Policy',
            pattern: /<meta[^>]*http-equiv=(["'])Content-Security-Policy\1/i,
          },
          {
            name: 'X-Content-Type-Options',
            pattern:
              /<meta[^>]*http-equiv=(["'])X-Content-Type-Options\1[^>]*content=(["'])nosniff\2/i,
          },
          { name: 'X-Frame-Options', pattern: /<meta[^>]*http-equiv=(["'])X-Frame-Options\1/i },
          { name: 'Referrer-Policy', pattern: /<meta[^>]*http-equiv=(["'])Referrer-Policy\1/i },
        ];

        for (const header of requiredHeaders) {
          if (!header.pattern.test(content)) {
            warnings.push(`${htmlFile} missing ${header.name} header`);
          }
        }

        const cspMatch = content.match(/<meta[^>]*content=(["'])([^"'>]*)\1[^>]*>/i);
        if (cspMatch) {
          const csp = cspMatch[2];
          if (csp.includes("'unsafe-inline'")) {
            errors.push(`${htmlFile} CSP contains 'unsafe-inline' which reduces security`);
            passed = false;
          }
          if (csp.includes("'unsafe-eval'")) {
            errors.push(`${htmlFile} CSP contains 'unsafe-eval' which reduces security`);
            passed = false;
          }
          if (!csp.includes("'self'")) {
            warnings.push(`${htmlFile} CSP does not include 'self' directive`);
          }
        } else {
          errors.push(`${htmlFile} has no Content-Security-Policy meta tag`);
          passed = false;
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to check security headers: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkCodeSecurityPatterns() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const dangerousPatterns = [
      {
        pattern: /eval\s*\(/,
        message: 'Usage of eval() is dangerous and can lead to code injection',
      },
      {
        pattern: /new\s+Function\s*\(/,
        message: 'Usage of new Function() is dangerous and can lead to code injection',
      },
      {
        pattern: /child_process\.exec\s*\(/,
        message:
          'Usage of child_process.exec() can lead to command injection if input is not sanitized',
      },
      {
        pattern: /child_process\.spawn\s*\(/,
        message: 'child_process.spawn() should validate all arguments',
      },
      {
        pattern: /fs\.readFileSync?\s*\(/,
        message: 'fs.readFileSync() should use validated paths to prevent directory traversal',
      },
      {
        pattern: /fs\.writeFileSync?\s*\(/,
        message: 'fs.writeFileSync() should validate paths to prevent path traversal',
      },
    ];

    const sourceDirs = ['./src/main', './src/renderer', './src/shared'];

    for (const sourceDir of sourceDirs) {
      if (fileExists(sourceDir)) {
        const files = getAllFiles(sourceDir);

        for (const file of files) {
          if (file.endsWith('.ts') || file.endsWith('.js')) {
            const content = fs.readFileSync(file, 'utf-8');

            for (const danger of dangerousPatterns) {
              if (danger.pattern.test(content)) {
                if (danger.message.includes('eval') || danger.message.includes('Function')) {
                  errors.push(`${file}: ${danger.message}`);
                  passed = false;
                } else {
                  warnings.push(`${file}: ${danger.message}`);
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to check code security patterns: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkForSecrets() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');

    const secretPatterns = [
      {
        pattern:
          /['"`]?(?:api[_-]?key|apikey|api[_-]?token)['"`]?\s*[:=]\s*['"`][a-zA-Z0-9_-]{20,}['"`]/i,
        message: 'Potential API key found',
      },
      {
        pattern: /['"`]?(?:secret|password)['"`]?\s*[:=]\s*['"`][^'"`]{8,}['"`]/i,
        message: 'Potential secret/password found',
      },
      { pattern: /AWS[_-]?(?:ACCESS|_SECRET)_KEY/i, message: 'Potential AWS credentials found' },
      { pattern: /Bearer\s+[a-zA-Z0-9\-._~+/]{20,}/i, message: 'Potential Bearer token found' },
      { pattern: /gh[pousr]_[a-zA-Z0-9]{36}/i, message: 'Potential GitHub token found' },
    ];

    const excludeDirs = ['node_modules', '.git', 'dist', 'coverage', 'test-results'];
    const sourceFiles = getAllFiles('./src');

    for (const file of sourceFiles) {
      if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(file, 'utf-8');

        for (const secret of secretPatterns) {
          if (secret.pattern.test(content)) {
            errors.push(`${file}: ${secret.message}`);
            passed = false;
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to check for secrets: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkFileSystemSecurity() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');

    const sourceFiles = getAllFiles('./src');

    for (const file of sourceFiles) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf-8');

        if (
          (content.includes('fs.') || content.includes('path.')) &&
          !content.includes('path.normalize')
        ) {
          warnings.push(`${file}: Uses fs/path but may not use path normalization`);
        }

        if (content.includes('../') || content.includes('..\\')) {
          if (!content.includes('path.normalize') && !content.includes('path.resolve')) {
            errors.push(`${file}: Contains directory traversal pattern without path normalization`);
            passed = false;
          }
        }
      }
    }

    const criticalFiles = [
      './src/main/index.ts',
      './src/renderer/renderer.ts',
      './src/main/lib/ipc.ts',
    ];

    for (const file of criticalFiles) {
      if (!fileExists(file)) {
        errors.push(`Critical security file missing: ${file}`);
        passed = false;
      }
    }
  } catch (error) {
    errors.push(`Failed to check file system security: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function checkNetworkSecurity() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');

    const sourceFiles = getAllFiles('./src');

    for (const file of sourceFiles) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(file, 'utf-8');

        if (content.includes('fetch') || content.includes('XMLHttpRequest')) {
          if (!content.includes('try') && !content.includes('catch')) {
            warnings.push(`${file}: Network requests should include proper error handling`);
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Failed to check network security: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

async function verifyBuildArtifacts() {
  const warnings: string[] = [];
  const errors: string[] = [];
  let passed = true;

  try {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const distDir = './dist';
    if (fileExists(distDir)) {
      const distFiles = getAllFiles(distDir);

      for (const file of distFiles) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(file, 'utf-8');

          if (content.includes('sourceMappingURL')) {
            warnings.push(`${file}: Source maps may expose source code in production`);
          }

          if (content.includes('__dirname') || content.includes('__filename')) {
            warnings.push(
              `${file}: Contains __dirname/__filename which may not work correctly in bundled code`
            );
          }
        }

        if (file.endsWith('.map')) {
          errors.push(`${file}: Source map found in production build - remove for production`);
          passed = false;
        }
      }
    } else {
      warnings.push('dist directory not found - skipping build artifact verification');
    }
  } catch (error) {
    errors.push(`Failed to verify build artifacts: ${(error as Error).message}`);
    passed = false;
  }

  return { passed, warnings, errors };
}

function getAllFiles(dir: string): string[] {
  const fs = require('node:fs');
  const path = require('node:path');

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

async function generateSecurityReport() {
  logger.group('📊 Security Report');

  const totalChecks = securityChecks.length;
  const passedChecks = securityChecks.filter((c) => c.passed).length;
  const failedChecks = securityChecks.filter((c) => !c.passed).length;
  const totalWarnings = securityChecks.reduce((sum, c) => sum + c.warnings.length, 0);
  const totalErrors = securityChecks.reduce((sum, c) => sum + c.errors.length, 0);

  logger.info(`Total checks: ${totalChecks}`);
  logger.info(`Passed: ${passedChecks}`);
  logger.info(`Failed: ${failedChecks}`);
  logger.info(`Warnings: ${totalWarnings}`);
  logger.info(`Errors: ${totalErrors}`);

  const fs = await import('node:fs');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
      totalWarnings,
      totalErrors,
    },
    checks: securityChecks,
  };

  fs.writeFileSync('./security-report.json', JSON.stringify(report, null, 2));

  logger.success('Security report saved to security-report.json');
  logger.groupEnd();
}

async function securityBuild(): Promise<boolean> {
  logger.building('🔐 Security Build Pipeline');
  logger.group('Build Steps');

  let success = true;

  const securityAudit = WITH_SECURITY_AUDIT || process.argv.includes('--audit');
  const dependencyScan = WITH_DEPENDENCY_SCAN || process.argv.includes('--dependency-scan');
  const codeAnalysis = WITH_CODE_ANALYSIS || process.argv.includes('--code-analysis');
  const verification = WITH_VERIFICATION || process.argv.includes('--verify');

  if (securityAudit || dependencyScan || codeAnalysis || verification) {
    logger.start('security checks');
    const checksPassed = await runSecurityChecks();
    logger.complete('security checks');

    if (!checksPassed) {
      success = false;
      logger.error('Security checks failed');
    }

    await generateSecurityReport();
  } else {
    logger.info(
      'No security flags provided. Use --audit, --dependency-scan, --code-analysis, or --verify for security checks.'
    );
  }

  logger.groupEnd();
  return success;
}

setupProcessHandlers();

securityBuild()
  .then((success) => {
    if (success) {
      logger.success('Security build pipeline completed');
      process.exit(0);
    } else {
      logger.error('Security build pipeline failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    logger.error('Security build failed unexpectedly', error as Error);
    process.exit(1);
  });
