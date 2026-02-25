interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description?: string;
}

export const menuData: MenuItem[] = [
  {
    id: 'electron-file-system',
    title: 'File System Operations',
    content:
      '<p>Demonstrates reading, writing, and managing files directly from the desktop app. Features include file dialogs, directory browsing, and file metadata extraction.</p><p>Use Cases: File manager, text editor, IDE, backup utilities</p>',
    category: 'fs',
    tags: ['filesystem', 'file-dialog', 'file-manager', 'editor'],
    description: 'Read, write, and manage files',
  },
  {
    id: 'electron-native-clipboard',
    title: 'Clipboard Integration',
    content:
      '<p>Access system clipboard functionality including text, images, and rich HTML content. Features clipboard history, format conversion, and automatic paste detection.</p><p>Use Cases: Clipboard managers, note-taking apps, productivity tools</p>',
    category: 'system',
    tags: ['clipboard', 'copy-paste', 'system-api'],
    description: 'Access system clipboard',
  },
  {
    id: 'electron-notification',
    title: 'System Notifications',
    content:
      '<p>Send native OS notifications with custom icons, sounds, and actions. Includes notification center integration and interactive notification buttons.</p><p>Use Cases: Chat apps, task managers, monitoring tools, calendar apps</p>',
    category: 'system',
    tags: ['notification', 'toast', 'alert'],
    description: 'Native OS notifications',
  },
  {
    id: 'electron-tray',
    title: 'System Tray Integration',
    content:
      '<p>Create persistent tray icons with context menus, tooltips, and status indicators. Features balloon notifications and quick action menus.</p><p>Use Cases: System utilities, background services, music players</p>',
    category: 'system',
    tags: ['tray', 'system-tray', 'status-icon'],
    description: 'System tray icon',
  },
  {
    id: 'electron-dialog',
    title: 'Native Dialogs',
    content:
      '<p>Display native OS dialog boxes for alerts, confirmations, prompts, and file operations. Customizable buttons, icons, and message formatting.</p><p>Use Cases: Settings panels, confirmation dialogs, error handling</p>',
    category: 'ui',
    tags: ['dialog', 'modal', 'alert'],
    description: 'Native OS dialog boxes',
  },
  {
    id: 'electron-window-management',
    title: 'Multi-Window Management',
    content:
      '<p>Create and manage multiple browser windows with independent states. Features include window positioning, z-order control, and window-to-window communication.</p><p>Use Cases: Multi-tab interfaces, popups, multi-view applications</p>',
    category: 'window',
    tags: ['window', 'multi-window', 'browser-window'],
    description: 'Multiple windows management',
  },
  {
    id: 'electron-menu',
    title: 'Native Menus',
    content:
      '<p>Create native application menus (menu bar, context menus, dock menus) with keyboard shortcuts, submenus, and dynamic menu items.</p><p>Use Cases: Desktop applications, productivity tools, editors</p>',
    category: 'ui',
    tags: ['menu', 'context-menu', 'menu-bar'],
    description: 'Native application menus',
  },
  {
    id: 'electron-shortcuts',
    title: 'Global Keyboard Shortcuts',
    content:
      '<p>Register global keyboard shortcuts that work even when the app is in background. Supports custom combinations and conflict detection.</p><p>Use Cases: Productivity apps, hotkey utilities, launchers</p>',
    category: 'input',
    tags: ['shortcut', 'hotkey', 'keyboard'],
    description: 'Global keyboard shortcuts',
  },
  {
    id: 'electron-screen-capture',
    title: 'Screen Capture API',
    content:
      '<p>Capture screenshots, record screen content, and access display information. Features selective area capture and window-specific capture.</p><p>Use Cases: Screen recorders, screenshot tools, collaboration apps</p>',
    category: 'media',
    tags: ['screen', 'capture', 'screenshot'],
    description: 'Screen capture and recording',
  },
  {
    id: 'electron-power-monitor',
    title: 'Power Management',
    content:
      '<p>Monitor system power state and prevent sleep mode. Features battery status monitoring and power event handling.</p><p>Use Cases: Download managers, backup tools, long-running tasks</p>',
    category: 'system',
    tags: ['power', 'battery', 'sleep'],
    description: 'Power state monitoring',
  },
  {
    id: 'electron-shell',
    title: 'Shell Integration',
    content:
      '<p>Execute shell commands and open external applications. Features command execution with output capture and URI handling.</p><p>Use Cases: Developer tools, build tools, system utilities</p>',
    category: 'system',
    tags: ['shell', 'command', 'external-app'],
    description: 'Execute shell commands',
  },
  {
    id: 'electron-app-update',
    title: 'Auto-Updater',
    content:
      '<p>Implement automatic application updates with progress indicators and rollback support. Features differential updates and version checking.</p><p>Use Cases: Production apps, SaaS tools, distribution systems</p>',
    category: 'distribution',
    tags: ['update', 'auto-update', 'version'],
    description: 'Automatic app updates',
  },
  {
    id: 'electron-crash-reporter',
    title: 'Crash Reporter',
    content:
      '<p>Automatically collect and report crash information. Features crash dump upload and error analytics integration.</p><p>Use Cases: Production apps, error tracking, quality assurance</p>',
    category: 'maintenance',
    tags: ['crash', 'error-reporting', 'analytics'],
    description: 'Crash reporting system',
  },
  {
    id: 'electron-printing',
    title: 'Printing Support',
    content:
      '<p>Print content to physical printers or PDF files. Features print preview, page layout control, and printer selection.</p><p>Use Cases: Document apps, report generators, invoice systems</p>',
    category: 'media',
    tags: ['print', 'pdf', 'printer'],
    description: 'Print to printer or PDF',
  },
  {
    id: 'electron-network',
    title: 'Network Detection',
    content:
      '<p>Monitor network connectivity and detect online/offline status. Features network interface information and bandwidth monitoring.</p><p>Use Cases: Offline-capable apps, sync tools, monitoring dashboards</p>',
    category: 'network',
    tags: ['network', 'offline', 'connectivity'],
    description: 'Network status monitoring',
  },
  {
    id: 'electron-spellcheck',
    title: 'Spell Checking',
    content:
      '<p>Integrate native spell checking with custom dictionaries and language support. Features contextual suggestions and autocorrection.</p><p>Use Cases: Text editors, email clients, writing apps</p>',
    category: 'text',
    tags: ['spellcheck', 'dictionary', 'language'],
    description: 'Native spell checking',
  },
  {
    id: 'electron-speech',
    title: 'Speech Recognition & Synthesis',
    content:
      '<p>Convert speech to text and text to speech using native OS capabilities. Features voice commands and audio feedback.</p><p>Use Cases: Accessibility tools, dictation apps, voice assistants</p>',
    category: 'media',
    tags: ['speech', 'voice', 'tts'],
    description: 'Speech recognition and synthesis',
  },
  {
    id: 'electron-protocol',
    title: 'Custom Protocol',
    content:
      '<p>Register custom URL schemes (like myapp://) to launch your app from browsers and other applications. Features deep linking and parameter passing.</p><p>Use Cases: Deep linking, browser integration, URI handlers</p>',
    category: 'integration',
    tags: ['protocol', 'uri', 'deep-link'],
    description: 'Custom URL schemes',
  },
  {
    id: 'electron-webview',
    title: 'Webview Integration',
    content:
      '<p>Embed third-party web content securely with webview elements. Features preload scripts and guest-to-host communication.</p><p>Use Cases: Browser extensions, embedded apps, iframe alternatives</p>',
    category: 'integration',
    tags: ['webview', 'embed', 'iframe'],
    description: 'Secure web content embedding',
  },
  {
    id: 'electron-storage',
    title: 'Encrypted Storage',
    content:
      '<p>Store sensitive data securely with encryption at rest. Features key management and secure data persistence.</p><p>Use Cases: Password managers, secure notes, authentication tokens</p>',
    category: 'security',
    tags: ['encryption', 'secure-storage', 'security'],
    description: 'Encrypted data storage',
  },
];
