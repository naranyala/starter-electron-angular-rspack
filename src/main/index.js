// Main process entry point
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const url = require('node:url');
const _fs = require('node:fs');

const args = process.argv.slice(1);
const serve = args.some((val) => val === '--start-dev');

// Check if electron is installed, if not try to install it
function checkAndInstallElectron() {
  try {
    require.resolve('electron');
    console.log('✓ Electron found');
    return true;
  } catch (_error) {
    console.error('❌ Electron not found, attempting to install...');
    try {
      const { execSync } = require('node:child_process');
      console.log('Running: npm install electron');
      execSync('npm install electron', { stdio: 'inherit' });
      console.log('✓ Electron installed successfully');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install Electron:', installError.message);
      process.exit(1);
    }
  }
}

// Check dependencies on startup (only if not in dev mode)
if (!serve) {
  checkAndInstallElectron();
}

// Load config with error handling
let appConfig;
try {
  appConfig = require('./config').appConfig;
} catch (error) {
  console.error('❌ Failed to load config:', error.message);
  appConfig = {
    mainWindow: {
      width: 1024,
      height: 768,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
      },
    },
  };
  console.log('⚠️ Using default configuration');
}

// Enable electron reload during development
// Disabled for now due to path resolution issues
if (serve && false) {
  try {
    require('electron-reload')(__dirname, {
      electron: 'electron',
      hardResetMethod: 'exit',
    });
    console.log('✓ Electron reload enabled');
  } catch (error) {
    console.warn('⚠️ Electron reload not available:', error.message);
  }
}

let mainWindow;

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: appConfig.mainWindow.width,
    height: appConfig.mainWindow.height,
    minWidth: appConfig.mainWindow.minWidth,
    minHeight: appConfig.mainWindow.minHeight,
    webPreferences: {
      ...appConfig.mainWindow.webPreferences,
      // DevTools disabled by default in production
      // Enable in development by uncommenting the lines below
      devTools: serve,
    },
  });

  const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:1234';
  const startUrl = serve
    ? devUrl
    : url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(startUrl);

  // DevTools are disabled by default
  // To enable during development, uncomment the following lines:
  // if (serve) {
  //   mainWindow.webContents.openDevTools({ mode: 'detach' });
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('❌ Failed to load:', errorCode, errorDescription);
  });
}
