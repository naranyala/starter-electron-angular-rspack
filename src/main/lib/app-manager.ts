/**
 * Application utilities
 * Provides app lifecycle, configuration, and system utilities
 */

const { app, dialog, shell, ipcMain, crashReporter, BrowserWindow, Menu } = require('electron');
const path = require('node:path');
const os = require('node:os');

export interface AppInfo {
  name: string;
  version: string;
  electronVersion: string;
  nodeVersion: string;
  chromeVersion: string;
  platform: string;
  arch: string;
  path: string;
  userDataPath: string;
}

export interface DialogOptions {
  type?: 'none' | 'info' | 'warning' | 'error' | 'question';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  hostname: string;
  userInfo: {
    username: string;
    homedir: string;
  };
  cpus: any[];
  totalMemory: number;
  freeMemory: number;
  uptime: number;
  loadAvg: number[];
}

export class AppManager {
  private static instance: AppManager;
  private isReady: boolean = false;
  private configuration: any = {};

  private constructor() {
    this.setupEventHandlers();
  }

  static getInstance(): AppManager {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager();
    }
    return AppManager.instance;
  }

  /**
   * Setup application event handlers
   */
  private setupEventHandlers(): void {
    app.whenReady().then(() => {
      this.isReady = true;
      console.log('Application is ready');
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // Re-create window on macOS when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        this.emit('create-main-window');
      }
    });

    app.on('before-quit', () => {
      console.log('Application is about to quit');
      this.cleanup();
    });
  }

  /**
   * Initialize the application
   */
  async initialize(config: any = {}): Promise<boolean> {
    try {
      this.configuration = { ...this.getDefaultConfig(), ...config };

      // Setup crash reporting if configured
      if (this.configuration.crashReporting) {
        this.setupCrashReporting();
      }

      // Setup security
      this.setupSecurity();

      console.log('Application initialized successfully');
      return true;
    } catch (error: any) {
      console.error('Failed to initialize application:', error);
      return false;
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): any {
    return {
      crashReporting: false,
      security: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: true,
      },
    };
  }

  /**
   * Setup crash reporting
   */
  private setupCrashReporting(): void {
    crashReporter.start({
      projectName: app.getName(),
      companyName: 'Your Company',
      submitURL: 'https://your-crash-server.com',
      uploadToServer: true,
      compress: true,
    });
  }

  /**
   * Setup security defaults
   */
  private setupSecurity(): void {
    // Set user agent
    const userAgent = `${app.getName()}/${app.getVersion()} (${os.platform()} ${os.arch()})`;
    app.userAgentFallback = userAgent;

    // Disable hardware acceleration if configured
    if (this.configuration.disableHardwareAcceleration) {
      app.disableHardwareAcceleration();
    }

    // Set application menu to null for more control
    if (this.configuration.customMenu) {
      Menu.setApplicationMenu(null);
    }
  }

  /**
   * Get comprehensive application information
   */
  getAppInfo(): AppInfo {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      platform: process.platform,
      arch: process.arch,
      path: app.getAppPath(),
      userDataPath: app.getPath('userData'),
    };
  }

  /**
   * Get detailed system information
   */
  getSystemInfo(): SystemInfo {
    return {
      platform: os.platform(),
      arch: os.arch(),
      version: os.release(),
      hostname: os.hostname(),
      userInfo: {
        username: os.userInfo().username,
        homedir: os.userInfo().homedir,
      },
      cpus: os.cpus(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      loadAvg: os.loadavg(),
    };
  }

  /**
   * Show dialog box
   */
  async showDialog(options: DialogOptions): Promise<number> {
    const result = await dialog.showMessageBox(options);
    return result.response;
  }

  /**
   * Show open dialog
   */
  async showOpenDialog(options: any = {}): Promise<any> {
    const defaultOptions = {
      properties: ['openFile'],
      filters: [{ name: 'All Files', extensions: ['*'] }],
    };

    return dialog.showOpenDialog({ ...defaultOptions, ...options });
  }

  /**
   * Show save dialog
   */
  async showSaveDialog(options: any = {}): Promise<any> {
    const defaultOptions = {
      filters: [{ name: 'All Files', extensions: ['*'] }],
    };

    return dialog.showSaveDialog({ ...defaultOptions, ...options });
  }

  /**
   * Open external URL
   */
  async openExternal(url: string): Promise<boolean> {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error: any) {
      console.error('Failed to open external URL:', error);
      return false;
    }
  }

  /**
   * Open item in file manager
   */
  async openItem(fullPath: string): Promise<boolean> {
    try {
      await shell.openPath(fullPath);
      return true;
    } catch (error: any) {
      console.error('Failed to open item:', error);
      return false;
    }
  }

  /**
   * Show item in folder
   */
  async showItemInFolder(fullPath: string): Promise<boolean> {
    try {
      shell.showItemInFolder(fullPath);
      return true;
    } catch (error: any) {
      console.error('Failed to show item in folder:', error);
      return false;
    }
  }

  /**
   * Get path for various system directories
   */
  getPath(name: string): string {
    return app.getPath(name as any);
  }

  /**
   * Set application menu
   */
  setMenu(menu: Electron.Menu | null): void {
    Menu.setApplicationMenu(menu);
  }

  /**
   * Hide application (macOS specific)
   */
  hide(): void {
    if (process.platform === 'darwin') {
      app.hide();
    }
  }

  /**
   * Show application (macOS specific)
   */
  show(): void {
    if (process.platform === 'darwin') {
      app.show();
    }
  }

  /**
   * Focus application
   */
  focus(): void {
    if (process.platform === 'darwin') {
      app.focus();
    }
  }

  /**
   * Get application name
   */
  getName(): string {
    return app.getName();
  }

  /**
   * Get application version
   */
  getVersion(): string {
    return app.getVersion();
  }

  /**
   * Set about panel options
   */
  setAboutPanelOptions(options: any): void {
    app.setAboutPanelOptions(options);
  }

  /**
   * Set badges (macOS)
   */
  setBadgeCount(count: number): void {
    if (process.platform === 'darwin') {
      app.setBadgeCount(count);
    }
  }

  /**
   * Jump to specific location (macOS)
   */
  setJumpList(categories: any[]): void {
    if (process.platform === 'win32') {
      app.setJumpList(categories);
    }
  }

  /**
   * Check if application is ready
   */
  ready(): boolean {
    return this.isReady && app.isReady();
  }

  /**
   * Get configuration
   */
  getConfig(): any {
    return { ...this.configuration };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: any): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Perform cleanup tasks here
    console.log('Performing application cleanup...');
  }

  /**
   * Emit custom events
   */
  emit(event: string, ...args: any[]): void {
    app.emit(event, ...args);
  }

  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    app.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    app.off(event, listener);
  }
}

// Export singleton instance
export const appManager = AppManager.getInstance();
