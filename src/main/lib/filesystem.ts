/**
 * File system utilities for main process
 * Provides safe file operations with error handling and logging
 */

import fs from 'node:fs';
import path from 'node:path';

export interface FileSystemStats {
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  modified: Date | null;
  created: Date | null;
}

export class FileSystemManager {
  private static instance: FileSystemManager;

  private constructor() {}

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  /**
   * Check if a file or directory exists
   */
  exists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`Error checking if path exists: ${filePath}`, error);
      return false;
    }
  }

  /**
   * Get comprehensive file/directory stats
   */
  getStats(filePath: string): FileSystemStats {
    try {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
      };
    } catch (_error) {
      return {
        exists: false,
        isFile: false,
        isDirectory: false,
        size: 0,
        modified: null,
        created: null,
      };
    }
  }

  /**
   * Read file content safely with encoding options
   */
  readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string | null {
    try {
      if (!this.exists(filePath)) {
        console.warn(`File does not exist: ${filePath}`);
        return null;
      }
      return fs.readFileSync(filePath, encoding);
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Read JSON file safely
   */
  readJsonFile<T = any>(filePath: string): T | null {
    try {
      const content = this.readFile(filePath);
      if (!content) return null;
      return JSON.parse(content) as T;
    } catch (error) {
      console.error(`Failed to read JSON file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Write file content safely with backup option
   */
  writeFile(
    filePath: string,
    content: string,
    encoding: BufferEncoding = 'utf8',
    createBackup: boolean = false
  ): boolean {
    try {
      // Create backup if requested and file exists
      if (createBackup && this.exists(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        console.log(`Backup created: ${backupPath}`);
      }

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!this.exists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, encoding);
      return true;
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Write JSON file safely with formatting
   */
  writeJsonFile(filePath: string, data: any, createBackup: boolean = false): boolean {
    try {
      const content = JSON.stringify(data, null, 2);
      return this.writeFile(filePath, content, 'utf8', createBackup);
    } catch (error) {
      console.error(`Failed to write JSON file ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Create directory recursively
   */
  createDirectory(dirPath: string, recursive: boolean = true): boolean {
    try {
      fs.mkdirSync(dirPath, { recursive });
      return true;
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
      return false;
    }
  }

  /**
   * Delete file or directory (recursively)
   */
  deletePath(targetPath: string, recursive: boolean = false): boolean {
    try {
      if (!this.exists(targetPath)) {
        console.warn(`Path does not exist: ${targetPath}`);
        return true;
      }

      const stats = this.getStats(targetPath);

      if (stats.isDirectory && recursive) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else if (stats.isFile) {
        fs.unlinkSync(targetPath);
      } else {
        console.warn(`Cannot delete path (not a file or recursive directory): ${targetPath}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete path ${targetPath}:`, error);
      return false;
    }
  }

  /**
   * List directory contents with filtering
   */
  listDirectory(dirPath: string, extensions?: string[]): string[] {
    try {
      if (!this.exists(dirPath) || !this.getStats(dirPath).isDirectory) {
        return [];
      }

      const items = fs.readdirSync(dirPath);

      if (!extensions) {
        return items;
      }

      return items.filter((item) => {
        const ext = path.extname(item).toLowerCase();
        return extensions.includes(ext);
      });
    } catch (error) {
      console.error(`Failed to list directory ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Watch file or directory for changes
   */
  watchPath(
    targetPath: string,
    callback: (eventType: string, filename: string | null) => void
  ): fs.FSWatcher | null {
    try {
      if (!this.exists(targetPath)) {
        console.warn(`Cannot watch non-existent path: ${targetPath}`);
        return null;
      }

      return fs.watch(targetPath, callback);
    } catch (error) {
      console.error(`Failed to watch path ${targetPath}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const fileSystem = FileSystemManager.getInstance();
