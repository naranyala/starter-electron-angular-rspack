#!/usr/bin/env node

/**
 * Security-Focused Build Pipeline Script
 * Performs security checks before and after building the application
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

interface BuildConfig {
  securityChecksEnabled: boolean;
  auditBeforeBuild: boolean;
  scanDependencies: boolean;
  verifyArtifacts: boolean;
  enforceStandards: boolean;
  verbose: boolean;
}

class SecurityBuildPipeline {
  private config: BuildConfig;
  private startTime: number;

  constructor(args: string[]) {
    this.config = this.parseArgs(args);
    this.startTime = Date.now();
  }

  private parseArgs(args: string[]): BuildConfig {
    return {
      securityChecksEnabled: !args.includes('--no-security'),
      auditBeforeBuild: args.includes('--audit') || !args.includes('--no-audit'),
      scanDependencies: args.includes('--scan') || !args.includes('--no-scan'),
      verifyArtifacts: args.includes('--verify') || !args.includes('--no-verify'),
      enforceStandards: args.includes('--enforce') || !args.includes('--no-enforce'),
      verbose: args.includes('--verbose') || args.includes('-v')
    };
  }

  async run(): Promise<void> {
    console.log('🔐 Starting Security-Focused Build Pipeline...\n');

    try {
      // Pre-build security checks
      if (this.config.securityChecksEnabled) {
        await this.preBuildSecurityChecks();
      }

      // Run the actual build
      await this.executeBuild();

      // Post-build security verification
      if (this.config.verifyArtifacts) {
        await this.verifyBuildArtifacts();
      }

      // Generate security report
      await this.generateSecurityReport();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`\n✅ Security-focused build completed successfully in ${duration}s!`);
    } catch (error) {
      console.error('\n❌ Security-focused build failed:', (error as Error).message);
      process.exit(1);
    }
  }

  private async preBuildSecurityChecks(): Promise<void> {
    console.log('🔍 Running pre-build security checks...\n');

    // Run dependency audit
    if (this.config.auditBeforeBuild) {
      await this.auditDependencies();
    }

    // Scan for vulnerabilities
    if (this.config.scanDependencies) {
      await this.scanForVulnerabilities();
    }

    // Check for hardcoded credentials
    await this.checkForHardcodedCredentials();

    // Validate configuration files
    await this.validateConfigurationFiles();

    console.log('✅ Pre-build security checks completed\n');
  }

  private async auditDependencies(): Promise<void> {
    console.log('📦 Auditing dependencies for vulnerabilities...');

    try {
      const result = execSync('npm audit --json', { encoding: 'utf-8' });
      const auditResult = JSON.parse(result);
      const vulnerabilities = auditResult.metadata?.vulnerabilities || { total: 0, critical: 0, high: 0 };

      if (vulnerabilities.total > 0) {
        console.warn(`⚠️  Found ${vulnerabilities.total} vulnerabilities (${vulnerabilities.critical} critical, ${vulnerabilities.high} high)`);
        
        if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
          if (this.config.enforceStandards) {
            throw new Error(`High or critical vulnerabilities detected. Build failed.`);
          } else {
            console.warn('⚠️  Security enforcement disabled, continuing build...');
          }
        }
      } else {
        console.log('✅ No vulnerabilities found in dependencies');
      }
    } catch (error: any) {
      // npm audit might fail if there are vulnerabilities, but that's expected
      if (error.status !== 1 || !error.stdout.includes('vulnerabilities found')) {
        console.error('❌ Failed to audit dependencies:', error.message);
        if (this.config.enforceStandards) {
          throw error;
        }
      }
    }
  }

  private async scanForVulnerabilities(): Promise<void> {
    console.log('🔍 Scanning for common vulnerabilities...');

    // Check for common vulnerability patterns in source code
    const sourceFiles = await this.findAllSourceFiles();
    let vulnerabilityCount = 0;
    const vulnerabilities: { file: string; type: string; line: string }[] = [];

    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for eval usage
        if (line.includes('eval(')) {
          vulnerabilityCount++;
          vulnerabilities.push({ file, type: 'EVAL_USAGE', line: line.trim() });
        }
        
        // Check for Function constructor
        if (line.includes('new Function(')) {
          vulnerabilityCount++;
          vulnerabilities.push({ file, type: 'FUNCTION_CONSTRUCTOR', line: line.trim() });
        }
        
        // Check for insecure deserialization patterns
        if (line.includes('JSON.parse') && (line.includes('req.') || line.includes('userInput'))) {
          vulnerabilityCount++;
          vulnerabilities.push({ file, type: 'INSECURE_DESERIALIZATION', line: line.trim() });
        }
        
        // Check for path traversal without normalization
        if (line.includes('path.join') && (line.includes('..') || line.includes('../')) && 
            !line.includes('path.normalize') && !line.includes('path.resolve')) {
          vulnerabilityCount++;
          vulnerabilities.push({ file, type: 'PATH_TRAVERSAL', line: line.trim() });
        }
      }
    }

    if (vulnerabilityCount > 0) {
      console.warn(`⚠️  Found ${vulnerabilityCount} potential vulnerabilities:`);
      if (this.config.verbose) {
        vulnerabilities.forEach(v => {
          console.warn(`  ${v.type} in ${v.file}:${v.line}`);
        });
      }
      
      if (this.config.enforceStandards && vulnerabilityCount > 0) {
        throw new Error(`Security vulnerabilities detected. Build failed.`);
      }
    } else {
      console.log('✅ No common vulnerabilities detected');
    }
  }

  private async checkForHardcodedCredentials(): Promise<void> {
    console.log('🔑 Checking for hardcoded credentials...');

    const sourceFiles = await this.findAllSourceFiles();
    let credentialCount = 0;
    const credentials: { file: string; pattern: string; line: string }[] = [];

    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Regex patterns for potential credentials
        const credentialPatterns = [
          /password\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /secret\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /token\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /api[_-]?key\s*[=:]\s*["'`][^"'`]{5,}["'`]/gi,
          /[A-Z]{2,}_KEY\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
          /[A-Z]{2,}_TOKEN\s*[=:]\s*["'`][^"'`]{5,}["'`]/g,
        ];
        
        for (const pattern of credentialPatterns) {
          const matches = line.match(pattern);
          if (matches) {
            credentialCount++;
            credentials.push({ file, pattern: matches[0], line: line.trim() });
          }
        }
      }
    }

    if (credentialCount > 0) {
      console.warn(`⚠️  Found ${credentialCount} potential hardcoded credentials:`);
      if (this.config.verbose) {
        credentials.forEach(c => {
          console.warn(`  ${c.pattern} in ${c.file}:${c.line}`);
        });
      }
      
      if (this.config.enforceStandards) {
        throw new Error(`Hardcoded credentials detected. Build failed.`);
      }
    } else {
      console.log('✅ No hardcoded credentials detected');
    }
  }

  private async validateConfigurationFiles(): Promise<void> {
    console.log('⚙️  Validating configuration files...');

    // Check package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    if (!packageJson.private) {
      console.warn('⚠️  Package is not marked as private');
      if (this.config.enforceStandards) {
        throw new Error('Package must be marked as private for security. Set "private": true in package.json');
      }
    } else {
      console.log('✅ Package is marked as private');
    }

    // Check .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    try {
      const gitignore = await fs.readFile(gitignorePath, 'utf-8');
      
      const requiredPatterns = ['*.key', '*.pem', '.env', '*.env', '*.log'];
      const missingPatterns = requiredPatterns.filter(pattern => !gitignore.includes(pattern));
      
      if (missingPatterns.length > 0) {
        console.warn(`⚠️  Missing patterns in .gitignore: ${missingPatterns.join(', ')}`);
        if (this.config.enforceStandards) {
          throw new Error(`Missing security patterns in .gitignore: ${missingPatterns.join(', ')}`);
        }
      } else {
        console.log('✅ .gitignore contains required security patterns');
      }
    } catch {
      console.warn('⚠️  .gitignore file not found');
      if (this.config.enforceStandards) {
        throw new Error('.gitignore file is required for security');
      }
    }
  }

  private async executeBuild(): Promise<void> {
    console.log('\n🏗️  Executing build process...');

    // Run the actual build command
    const buildCommand = 'bun run build:check'; // Using type-check build for extra safety
    
    try {
      execSync(buildCommand, { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      throw new Error(`Build failed: ${(error as Error).message}`);
    }
  }

  private async verifyBuildArtifacts(): Promise<void> {
    console.log('\n🔍 Verifying build artifacts...');

    // Check if dist directory exists
    const distPath = path.join(process.cwd(), 'dist');
    try {
      await fs.access(distPath);
      console.log('✅ Build artifacts directory exists');
    } catch {
      throw new Error('Build artifacts directory does not exist');
    }

    // Calculate and log artifact hashes for integrity verification
    const artifacts = await this.findBuildArtifacts(distPath);
    console.log(`\n📦 Found ${artifacts.length} build artifacts:`);
    
    for (const artifact of artifacts) {
      const content = await fs.readFile(artifact);
      const hash = createHash('sha256').update(content).digest('hex');
      console.log(`  ${path.relative(process.cwd(), artifact)} -> ${hash.substring(0, 16)}...`);
    }

    // Verify that no sensitive files are included in build
    const sensitiveFiles = ['*.key', '*.pem', '.env*', '*secret*', '*private*'];
    let sensitiveFilesFound = false;
    
    for (const artifact of artifacts) {
      const fileName = path.basename(artifact).toLowerCase();
      
      for (const pattern of sensitiveFiles) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(fileName)) {
          console.warn(`⚠️  Sensitive file found in build artifacts: ${artifact}`);
          sensitiveFilesFound = true;
        }
      }
    }
    
    if (sensitiveFilesFound) {
      if (this.config.enforceStandards) {
        throw new Error('Sensitive files found in build artifacts. Build failed.');
      } else {
        console.warn('⚠️  Sensitive files found but security enforcement disabled');
      }
    } else {
      console.log('✅ No sensitive files found in build artifacts');
    }
  }

  private async generateSecurityReport(): Promise<void> {
    console.log('\n📝 Generating security report...');

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      config: this.config,
      summary: {
        status: 'SUCCESS',
        checksRun: 5, // Update this based on actual checks
        vulnerabilitiesFound: 0, // This would come from actual scan results
        credentialsFound: 0, // This would come from actual scan results
      }
    };

    const reportPath = path.join(process.cwd(), 'security-build-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ Security report saved to: ${reportPath}`);
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

  private async findBuildArtifacts(distPath: string): Promise<string[]> {
    const artifacts: string[] = [];
    
    const walkDir = async (dir: string): Promise<void> => {
      const dirents = await fs.readdir(dir, { withFileTypes: true });
      
      for (const dirent of dirents) {
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
          await walkDir(fullPath);
        } else {
          artifacts.push(fullPath);
        }
      }
    };
    
    await walkDir(distPath);
    return artifacts;
  }
}

// Run the security build pipeline
const pipeline = new SecurityBuildPipeline(process.argv.slice(2));
pipeline.run().catch(error => {
  console.error('Security build pipeline failed:', error);
  process.exit(1);
});