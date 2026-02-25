import type { MenuItem } from '../types/index.js';

export const menuData: MenuItem[] = [
  {
    id: 'electron-intro',
    title: 'What is Electron?',
    content:
      '<p>Electron is a framework for building cross-platform desktop applications using web technologies like HTML, CSS, and JavaScript.</p>',
    category: 'blue',
    tags: ['electron', 'desktop', 'cross-platform'],
  },
  {
    id: 'electron-architecture',
    title: 'Electron Architecture',
    content:
      '<p>Electron has two processes: Main Process (lifecycle, windows) and Renderer Process (UI).</p>',
    category: 'purple',
    tags: ['main-process', 'renderer-process', 'ipc'],
  },
  {
    id: 'electron-security',
    title: 'Security Best Practices',
    content: '<p>Enable context isolation, disable nodeIntegration, use CSP, validate input.</p>',
    category: 'red',
    tags: ['security', 'context-isolation', 'csp'],
  },
  {
    id: 'electron-packaging',
    title: 'Packaging & Distribution',
    content: '<p>Use electron-builder to create installers for Windows, macOS, and Linux.</p>',
    category: 'green',
    tags: ['packaging', 'distribution', 'installer'],
  },
  {
    id: 'electron-native-apis',
    title: 'Native OS APIs',
    content:
      '<p>Access file system, dialogs, notifications, clipboard, and more through Electron APIs.</p>',
    category: 'orange',
    tags: ['native-api', 'file-system', 'dialogs'],
  },
  {
    id: 'electron-performance',
    title: 'Performance Optimization',
    content: '<p>Reduce memory, improve startup, use lazy loading, clean up event listeners.</p>',
    category: 'dark',
    tags: ['performance', 'optimization', 'memory'],
  },
  {
    id: 'electron-development',
    title: 'Development Workflow',
    content: '<p>Use HMR, development servers, and proper debugging setups.</p>',
    category: 'blue',
    tags: ['development', 'workflow', 'debugging'],
  },
  {
    id: 'electron-versions',
    title: 'Version Management',
    content: '<p>Update regularly for security patches. Test after upgrades.</p>',
    category: 'purple',
    tags: ['version', 'updates', 'compatibility'],
  },
];

export function findMenuItemById(id: string): MenuItem | undefined {
  return menuData.find((item) => item.id === id);
}

export function findMenuItemsByCategory(category: string): MenuItem[] {
  return menuData.filter((item) => item.category === category);
}

export function findMenuItemsByTag(tag: string): MenuItem[] {
  return menuData.filter((item) => item.tags.includes(tag.toLowerCase()));
}

export function searchMenuItems(query: string): MenuItem[] {
  const lowerQuery = query.toLowerCase();
  return menuData.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
  );
}
