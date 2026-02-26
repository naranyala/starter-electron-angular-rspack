import { app } from 'electron';

export function registerMainErrorHooks(): void {
  process.on('uncaughtException', (err) => {
    console.error('[MAIN][uncaughtException]', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[MAIN][unhandledRejection]', reason);
  });

  app.on('render-process-gone', (_event, webContents, details) => {
    console.error('[MAIN][render-process-gone]', details, webContents.getURL());
  });

  app.on('child-process-gone', (_event, details) => {
    console.error('[MAIN][child-process-gone]', details);
  });
}
