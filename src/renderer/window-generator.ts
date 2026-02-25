// Window content generator for WinBox windows
// Creates dynamic content based on the window title

// Define TypeScript interfaces
interface ContentTemplate {
  [key: string]: string[];
}

interface KeywordMap {
  [key: string]: string;
}

interface Theme {
  name: string;
  bg: string;
  color: string;
}

// Content templates organized by topic areas
const contentTemplates: ContentTemplate = {
  electron: [
    '<p>Electron is a framework that enables you to create desktop applications using web technologies like HTML, CSS, and JavaScript. It combines Chromium and Node.js to build cross-platform desktop apps.</p>',
    '<p>Electron applications have two main processes: the Main Process and the Renderer Process. The Main Process controls the life cycle of the app and creates browser windows. The Renderer Process renders the UI.</p>',
    '<p>Security is crucial in Electron applications. Best practices include enabling context isolation, disabling nodeIntegration when possible, and using Content Security Policy (CSP) to prevent XSS attacks.</p>',
    '<p>Electron provides access to native OS features through its APIs: file system operations, dialog boxes, notifications, tray icons, clipboard, and more. These APIs bridge the gap between web technologies and desktop functionality.</p>',
    '<p>Electron applications can be packaged for distribution using tools like electron-builder, electron-forge, or electron-packager. These tools create installable executables for Windows, macOS, and Linux.</p>',
    '<p>Performance optimization in Electron involves reducing memory usage, improving startup time, and efficient resource management. Techniques include code splitting, lazy loading, and proper cleanup of event listeners.</p>',
  ],
  architecture: [
    '<p>Electron applications follow a multi-process architecture with the Main Process managing application lifecycle and creating browser windows, while Renderer Processes handle UI rendering.</p>',
    '<p>Communication between processes happens via IPC (Inter-Process Communication). This architecture allows for secure separation of concerns while maintaining flexibility.</p>',
    '<p>Security architecture in Electron involves context isolation, proper handling of user input, and restricting access to Node.js APIs in the renderer process.</p>',
    '<p>Application architecture patterns in Electron include using preload scripts to expose limited APIs to the renderer, and maintaining a clear separation between main and renderer responsibilities.</p>',
    '<p>Modern Electron applications often use a modular architecture with separate modules for main process, renderer process, and shared utilities.</p>',
  ],
  security: [
    '<p>Security is crucial in Electron applications. Important practices include: enabling context isolation, disabling nodeIntegration when possible, using CSP (Content Security Policy), validating all input, and sanitizing user-provided content.</p>',
    "<p>Context Isolation is a security feature that ensures that your preload scripts and Electron's internal logic run in a separate context to the website loaded in a WebContents.</p>",
    '<p>Content Security Policy (CSP) helps prevent cross-site scripting (XSS) attacks by allowing you to restrict which resources can be loaded by the page.</p>',
    '<p>Node.js integration in the renderer process should be disabled unless absolutely necessary. When needed, expose only the required APIs through preload scripts.</p>',
    '<p>Always validate and sanitize user input, especially when interacting with the file system or executing external processes.</p>',
  ],
  packaging: [
    '<p>Electron applications can be packaged for distribution using tools like electron-builder, electron-forge, or electron-packager. These tools create installable executables for Windows, macOS, and Linux.</p>',
    '<p>electron-builder is a complete solution for packaging and building a ready-for-distribution Electron app. It supports multiple formats for each platform and provides advanced configuration options.</p>',
    '<p>Configuration for packaging includes app metadata, icons, installer options, and platform-specific settings. Proper packaging ensures a professional user experience across all platforms.</p>',
    '<p>Code signing is important for distributing Electron applications, especially on macOS and Windows. It verifies the authenticity of the application and prevents tampering.</p>',
    '<p>Auto-updater functionality can be implemented using libraries like electron-updater to provide seamless updates to users.</p>',
  ],
  api: [
    '<p>Electron provides access to native OS features through its APIs: file system operations, dialog boxes, notifications, tray icons, clipboard, and more. These APIs bridge the gap between web technologies and desktop functionality.</p>',
    '<p>Common native integrations include file dialogs, system notifications, context menus, and deep OS integration for a native-like experience.</p>',
    '<p>IPC (Inter-Process Communication) is used to communicate between the main and renderer processes. Use ipcMain in the main process and ipcRenderer in the renderer process.</p>',
    '<p>Powerful APIs like app, BrowserWindow, Menu, Tray, and nativeImage provide access to operating system-level functionality.</p>',
    '<p>Preload scripts can be used to expose specific APIs to the renderer process while maintaining security.</p>',
  ],
  performance: [
    '<p>Optimizing Electron apps involves reducing memory usage, improving startup time, and efficient resource management. Techniques include code splitting, lazy loading, proper cleanup of event listeners, and optimizing asset loading.</p>',
    '<p>Memory management is crucial in Electron applications. Avoid memory leaks by properly cleaning up event listeners, timers, and references when windows are closed.</p>',
    '<p>Startup performance can be improved by optimizing the main process initialization and deferring non-critical operations until after the application has loaded.</p>',
    '<p>Renderer process performance benefits from standard web optimization techniques: efficient JavaScript, optimized images, and proper use of web workers for heavy computations.</p>',
    '<p>Monitor performance with Chrome DevTools and consider using native modules for CPU-intensive tasks. Efficient IPC communication also improves responsiveness.</p>',
  ],
  development: [
    '<p>Effective Electron development involves using tools like Hot Module Replacement (HMR), development servers, and proper debugging setups. Use electron-reload for automatic restarts during development.</p>',
    '<p>Debugging Electron applications can be done using Chrome DevTools for the renderer process and standard Node.js debugging tools for the main process.</p>',
    '<p>Development workflow includes separate configurations for development and production, proper error handling, and using build tools to automate repetitive tasks.</p>',
    '<p>Testing Electron applications involves unit tests for business logic, integration tests for IPC communication, and end-to-end tests for user interactions.</p>',
    '<p>Common development patterns include using preload scripts, implementing proper error boundaries, and structuring code for maintainability.</p>',
  ],
  maintenance: [
    '<p>Managing Electron versions is important for stability and security. Regularly update to newer versions to get security patches and performance improvements.</p>',
    '<p>Testing your application thoroughly after version upgrades and maintain a consistent version across your team to avoid compatibility issues.</p>',
    '<p>Keeping dependencies updated helps maintain security and performance. Use tools like npm audit to identify vulnerable packages.</p>',
    '<p>Documentation and code organization are important for long-term maintenance of Electron applications.</p>',
    '<p>Monitoring application usage and crash reports helps identify issues in production environments.</p>',
  ],
  default: [
    '<p>Modern development practices emphasize automation, testing, and continuous integration. These methodologies help teams deliver high-quality software more efficiently.</p>',
    '<p>Performance optimization is crucial for user experience. Techniques include code splitting, lazy loading, caching strategies, and efficient algorithms.</p>',
    '<p>Security should be considered at every stage of development. Implement proper authentication, authorization, input validation, and secure coding practices.</p>',
    '<p>Architectural patterns provide proven solutions to common problems. Choose patterns that fit your specific requirements and constraints.</p>',
    '<p>API design affects how services communicate. Follow RESTful principles, use consistent naming, and provide comprehensive documentation.</p>',
    '<p>Testing strategies ensure code quality and prevent regressions. Implement unit, integration, and end-to-end tests for comprehensive coverage.</p>',
  ],
};

// Keywords that map to specific content categories
const keywordMap: KeywordMap = {
  electron: 'electron',
  architecture: 'architecture',
  security: 'security',
  packaging: 'packaging',
  api: 'api',
  performance: 'performance',
  development: 'development',
  maintenance: 'maintenance',
  version: 'maintenance',
  workflow: 'development',
  optimization: 'performance',
  native: 'api',
  distribution: 'packaging',
  best: 'security',
  practices: 'security',
};

/**
 * Generates content based on the window title
 * @param {string} title - The window title
 * @returns {string} HTML content for the window
 */
export function generateWindowContent(title: string): string {
  // Convert title to lowercase for matching
  const lowerTitle = title.toLowerCase();

  // Find matching category based on keywords in the title
  let category = 'default'; // default category

  for (const [keyword, cat] of Object.entries(keywordMap)) {
    if (lowerTitle.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // Get templates for the matched category
  const templates = contentTemplates[category] || contentTemplates.default;

  // Select 2-4 random templates from the category for varied content
  const selectedTemplates: string[] = [];
  const numParagraphs = Math.min(templates.length, Math.max(2, Math.floor(Math.random() * 3) + 2)); // 2-4 paragraphs

  // Make sure we don't pick the same template twice
  const usedIndices = new Set<number>();
  for (let i = 0; i < numParagraphs; i++) {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * templates.length);
    } while (usedIndices.has(randomIndex) && usedIndices.size < templates.length);

    usedIndices.add(randomIndex);
    selectedTemplates.push(templates[randomIndex]);
  }

  // Create a title-specific introduction
  const titleSpecificContent = `
    <p><strong>About "${title}":</strong> This topic is essential in Electron application development. 
    Understanding its concepts and implementation details will help you build better, more robust desktop applications.</p>
  `;

  // Generate additional content sections
  const additionalSections = [
    '<h4>Key Considerations</h4><ul><li>Best practices and patterns</li><li>Common pitfalls to avoid</li><li>Performance implications</li><li>Security aspects</li><li>Future trends and developments</li></ul>',
    '<h4>Implementation Tips</h4><ul><li>Start with small, manageable components</li><li>Test early and often</li><li>Seek feedback regularly</li><li>Iterate based on results</li><li>Follow official documentation</li></ul>',
    '<h4>Common Patterns</h4><ul><li>Established approaches</li><li>Community recommendations</li><li>Official guidelines</li><li>Proven solutions</li><li>Effective techniques</li></ul>',
    '<h4>Advanced Topics</h4><ul><li>Complex implementations</li><li>Specialized use cases</li><li>Performance tuning</li><li>Security hardening</li><li>Production considerations</li></ul>',
  ];

  // Select a random section
  const randomSection = additionalSections[Math.floor(Math.random() * additionalSections.length)];

  // Combine all content
  const combinedContent = [
    titleSpecificContent,
    ...selectedTemplates,
    randomSection,
    `<p>For more information about "${title}", consult the official Electron documentation, community resources, and expert guides. 
    Practical implementation and hands-on experience are crucial for mastering these concepts.</p>`,
  ].join('');

  // Ensure we always return content, even if somehow the arrays are empty
  if (!combinedContent || combinedContent.trim() === '') {
    return `<p><strong>About "${title}":</strong> This topic is important in Electron development.</p>
            <p>Understanding this concept will help you build better desktop applications.</p>
            <p>For more information, consult the official Electron documentation and resources.</p>`;
  }

  return combinedContent;
}

/**
 * Generates a random color theme based on the title
 * @param {string} title - The window title
 * @returns {Theme} Theme with background and text colors
 */
export function generateTheme(title: string): Theme {
  const lowerTitle = title.toLowerCase();
  const themes: Theme[] = [
    { name: 'blue', bg: '#4a6cf7', color: 'white' },
    { name: 'green', bg: '#4ade80', color: 'black' },
    { name: 'purple', bg: '#a78bfa', color: 'white' },
    { name: 'red', bg: '#f87171', color: 'white' },
    { name: 'yellow', bg: '#fbbf24', color: 'black' },
    { name: 'indigo', bg: '#6366f1', color: 'white' },
    { name: 'pink', bg: '#ec4899', color: 'white' },
    { name: 'teal', bg: '#14b8a6', color: 'white' },
    { name: 'orange', bg: '#f97316', color: 'white' },
    { name: 'gray', bg: '#6b7280', color: 'white' },
  ];

  // Create a simple hash of the title to consistently select the same theme for the same title
  let hash = 0;
  for (let i = 0; i < lowerTitle.length; i++) {
    hash = lowerTitle.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % themes.length;
  return themes[index];
}
