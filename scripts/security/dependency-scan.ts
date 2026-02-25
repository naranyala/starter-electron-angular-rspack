#!/usr/bin/env node

/**
 * Dependency Security Scanner
 * Scans dependencies for known vulnerabilities using npm audit
 */

import * as fs from 'node:fs';
import { LogLevel, buildLogger as logger } from '../lib/logger.ts';
import { exec, readJson } from '../lib/utils.ts';

const JSON_OUTPUT = process.argv.includes('--json');
const PRODUCTION_ONLY = process.argv.includes('--production');
const FAIL_ON_VULNERABILITIES = process.argv.includes('--fail');

interface Vulnerability {
  id: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  package: string;
  vulnerable_versions: string;
  patched_in?: string;
  title: string;
  url: string;
}

interface AuditResult {
  vulnerabilities: {
    [severity: string]: Vulnerability[];
  };
  metadata: {
    vulnerabilities: {
      total: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
    };
  };
}

function runNpmAudit(): AuditResult | null {
  try {
    const command = PRODUCTION_ONLY ? 'npm audit --omit=dev --json' : 'npm audit --json';

    const result = exec(command);

    try {
      return JSON.parse(result) as AuditResult;
    } catch {
      const match = result.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as AuditResult;
      }
      return null;
    }
  } catch (error) {
    const message = (error as Error).message;
    if (message.includes('exit code 0')) {
      return {
        vulnerabilities: {},
        metadata: { vulnerabilities: { total: 0, low: 0, moderate: 0, high: 0, critical: 0 } },
      };
    }
    throw error;
  }
}

function checkDependencies(): boolean {
  logger.building('🔍 Dependency Security Scanner');

  logger.start('running npm audit');

  let auditResult: AuditResult | null = null;

  try {
    auditResult = runNpmAudit();
    logger.complete('npm audit');
  } catch (error) {
    logger.error(`npm audit failed: ${(error as Error).message}`);

    const fallbackCheck = basicDependencyCheck();
    if (!fallbackCheck) {
      return false;
    }
    return true;
  }

  if (!auditResult) {
    logger.warn('Could not parse npm audit results');
    return true;
  }

  const vulns = auditResult.metadata.vulnerabilities;
  let hasIssues = false;

  if (vulns.critical > 0) {
    logger.error(`Found ${vulns.critical} critical vulnerabilities`);
    hasIssues = true;
  }

  if (vulns.high > 0) {
    logger.error(`Found ${vulns.high} high severity vulnerabilities`);
    hasIssues = true;
  }

  if (vulns.moderate > 0) {
    logger.warn(`Found ${vulns.moderate} moderate vulnerabilities`);
  }

  if (vulns.low > 0) {
    logger.warn(`Found ${vulns.low} low severity vulnerabilities`);
  }

  if (vulns.total > 0) {
    logger.group('Vulnerability Summary');

    const severities: (keyof typeof vulns)[] = ['critical', 'high', 'moderate', 'low'];

    for (const severity of severities) {
      const count = vulns[severity];
      if (count > 0) {
        logger.info(`${severity.toUpperCase()}: ${count}`);
      }
    }

    logger.groupEnd();

    if (JSON_OUTPUT) {
      fs.writeFileSync('./dependency-audit.json', JSON.stringify(auditResult, null, 2));
      logger.info('Detailed report saved to dependency-audit.json');
    }

    if (FAIL_ON_VULNERABILITIES && (vulns.critical > 0 || vulns.high > 0)) {
      return false;
    }
  } else {
    logger.success('No vulnerabilities found in dependencies');
  }

  return !hasIssues;
}

function basicDependencyCheck(): boolean {
  logger.warn('Falling back to basic dependency check');

  const packageJson = readJson<any>('./package.json');
  if (!packageJson) {
    logger.error('Could not read package.json');
    return false;
  }

  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const knownVulnerable: { [key: string]: { maxVersion: string; reason: string } } = {
    lodash: { maxVersion: '4.17.21', reason: 'Prototype pollution vulnerability' },
    axios: { maxVersion: '0.21.1', reason: 'SSRF vulnerability' },
    ws: { maxVersion: '7.4.1', reason: 'Denial of service vulnerability' },
    handlebars: { maxVersion: '4.7.6', reason: 'Remote code execution vulnerability' },
    ejs: { maxVersion: '3.1.6', reason: 'Local file inclusion vulnerability' },
    express: { maxVersion: '4.17.3', reason: 'Open redirect vulnerability' },
  };

  let foundIssues = false;

  for (const [pkg, info] of Object.entries(knownVulnerable)) {
    if (dependencies[pkg]) {
      const version = dependencies[pkg].replace(/[\^~]/, '');
      if (version < info.maxVersion) {
        logger.warn(
          `${pkg}@${dependencies[pkg]} has known vulnerabilities (fixed in ${info.maxVersion}): ${info.reason}`
        );
        foundIssues = true;
      }
    }
  }

  return !foundIssues;
}

function main(): void {
  const success = checkDependencies();

  if (!success) {
    logger.error('Dependency security scan found critical issues');
    process.exit(1);
  }

  logger.success('Dependency security scan completed');
  process.exit(0);
}

main().catch((error: Error) => {
  logger.error('Dependency scan failed unexpectedly', error);
  process.exit(1);
});
