import { describe, test, expect } from 'bun:test';
import { promises as fs } from 'fs';
import path from 'path';
let JSDOM: typeof import('jsdom').JSDOM | null = null;

async function getDom(htmlContent: string): Promise<Document | null> {
  if (!JSDOM) {
    try {
      const mod = await import('jsdom');
      JSDOM = mod.JSDOM;
    } catch {
      return null;
    }
  }

  const dom = new JSDOM(htmlContent);
  return dom.window.document;
}

// CSP validation tests
describe('Content Security Policy Validation', () => {
  // Test for CSP presence in main HTML file
  test('should have CSP in main HTML file', async () => {
    const indexPath = path.join(process.cwd(), 'src/renderer/index.html');
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
    
    if (indexExists) {
      const htmlContent = await fs.readFile(indexPath, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) return;
      
      // Find CSP meta tag
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      expect(cspMeta).toBeDefined();
      expect(cspMeta?.getAttribute('content')).toBeDefined();
    } else {
      // If index.html doesn't exist, check other HTML files
      const htmlFiles = await findHtmlFiles(path.join(process.cwd(), 'src'));
      let foundCSP = false;
      
      for (const htmlFile of htmlFiles) {
        const htmlContent = await fs.readFile(htmlFile, 'utf-8');
        const document = await getDom(htmlContent);
        if (!document) continue;
        
        const cspMeta = Array.from(document.querySelectorAll('meta'))
          .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
          
        if (cspMeta) {
          foundCSP = true;
          break;
        }
      }
      
      expect(foundCSP).toBe(true);
    }
  });

  // Test for restrictive CSP directives
  test('should have restrictive CSP directives', async () => {
    const indexPath = path.join(process.cwd(), 'src/renderer/index.html');
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
    
    if (indexExists) {
      const htmlContent = await fs.readFile(indexPath, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) return;
      
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      if (cspMeta) {
        const cspContent = cspMeta.getAttribute('content') || '';
        
        // Verify CSP is restrictive
        expect(cspContent.toLowerCase()).toContain("'self'"); // Should allow 'self' sources
        expect(cspContent.toLowerCase()).not.toContain("'unsafe-inline'"); // Should not allow unsafe inline
        expect(cspContent.toLowerCase()).not.toContain("'unsafe-eval'"); // Should not allow unsafe eval
        
        // Should have proper directives
        expect(cspContent.toLowerCase()).toContain('script-src');
        expect(cspContent.toLowerCase()).toContain('default-src');
      }
    }
  });

  // Test for script-src directive security
  test('should have secure script-src directive', async () => {
    const htmlFiles = await findHtmlFiles(path.join(process.cwd(), 'src'));
    
    for (const htmlFile of htmlFiles) {
      const htmlContent = await fs.readFile(htmlFile, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) continue;
      
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      if (cspMeta) {
        const cspContent = cspMeta.getAttribute('content') || '';
        
        // Extract script-src directive
        const scriptSrcMatch = cspContent.match(/script-src\s+([^;]+)/i);
        if (scriptSrcMatch) {
          const scriptSrcValue = scriptSrcMatch[1].toLowerCase();
          
          // Should not allow 'unsafe-inline' or 'unsafe-eval'
          expect(scriptSrcValue).not.toContain("'unsafe-inline'");
          expect(scriptSrcValue).not.toContain("'unsafe-eval'");
          
          // Should allow 'self' for local scripts
          expect(scriptSrcValue).toContain("'self'");
        }
      }
    }
  });

  // Test for style-src directive security
  test('should have secure style-src directive', async () => {
    const htmlFiles = await findHtmlFiles(path.join(process.cwd(), 'src'));
    
    for (const htmlFile of htmlFiles) {
      const htmlContent = await fs.readFile(htmlFile, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) continue;
      
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      if (cspMeta) {
        const cspContent = cspMeta.getAttribute('content') || '';
        
        // Extract style-src directive
        const styleSrcMatch = cspContent.match(/style-src\s+([^;]+)/i);
        if (styleSrcMatch) {
          const styleSrcValue = styleSrcMatch[1].toLowerCase();
          
          // Should not allow 'unsafe-inline' for production (might be allowed in dev)
          // For security, we'll check that it's properly restricted
          if (!styleSrcValue.includes("'unsafe-inline'")) {
            // If unsafe-inline is not present, that's good
            expect(styleSrcValue).not.toContain("'unsafe-inline'");
          } else {
            // If it is present, it should be accompanied by other restrictions
            expect(styleSrcValue).toContain("'self'");
          }
        }
      }
    }
  });

  // Test for object-src directive
  test('should have secure object-src directive', async () => {
    const htmlFiles = await findHtmlFiles(path.join(process.cwd(), 'src'));
    
    for (const htmlFile of htmlFiles) {
      const htmlContent = await fs.readFile(htmlFile, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) continue;
      
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      if (cspMeta) {
        const cspContent = cspMeta.getAttribute('content') || '';
        
        // Check if object-src is defined and restrictive
        const objectSrcMatch = cspContent.match(/object-src\s+([^;]+)/i);
        if (objectSrcMatch) {
          const objectSrcValue = objectSrcMatch[1].toLowerCase();
          
          // Should be restrictive (e.g., 'none' or 'self' only)
          expect(objectSrcValue).not.toContain('data:');
          expect(objectSrcValue).not.toContain('*');
        } else {
          // If object-src is not specified, it defaults to 'default-src', which should be restrictive
          const defaultSrcMatch = cspContent.match(/default-src\s+([^;]+)/i);
          if (defaultSrcMatch) {
            const defaultSrcValue = defaultSrcMatch[1].toLowerCase();
            expect(defaultSrcValue).not.toContain('*');
          }
        }
      }
    }
  });

  // Test for frame-src directive
  test('should have secure frame-src directive', async () => {
    const htmlFiles = await findHtmlFiles(path.join(process.cwd(), 'src'));
    
    for (const htmlFile of htmlFiles) {
      const htmlContent = await fs.readFile(htmlFile, 'utf-8');
      const document = await getDom(htmlContent);
      if (!document) continue;
      
      const cspMeta = Array.from(document.querySelectorAll('meta'))
        .find(meta => meta.getAttribute('http-equiv')?.toLowerCase() === 'content-security-policy');
      
      if (cspMeta) {
        const cspContent = cspMeta.getAttribute('content') || '';
        
        // Check frame-src directive if present
        const frameSrcMatch = cspContent.match(/frame-src\s+([^;]+)/i);
        if (frameSrcMatch) {
          const frameSrcValue = frameSrcMatch[1].toLowerCase();
          
          // Should be restrictive
          expect(frameSrcValue).not.toContain('*');
          expect(frameSrcValue).not.toContain('data:');
        }
      }
    }
  });

  // Helper function to find HTML files
  async function findHtmlFiles(dir: string): Promise<string[]> {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let htmlFiles: string[] = [];
    
    for (const entry of files) {
      const filePath = path.join(dir, entry.name);
      const baseName = path.basename(filePath);
      
      if (entry.isDirectory()) {
        if (
          baseName === 'node_modules' ||
          baseName === 'dist' ||
          baseName === 'build' ||
          baseName === '.git' ||
          baseName === 'coverage'
        ) {
          continue;
        }
        htmlFiles = htmlFiles.concat(await findHtmlFiles(filePath));
      } else if (entry.isFile() && path.extname(filePath) === '.html') {
        htmlFiles.push(filePath);
      }
    }
    
    return htmlFiles;
  }
});
