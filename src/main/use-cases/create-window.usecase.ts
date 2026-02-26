import { BrowserWindow } from 'electron';
import type { MainUseCase } from './base-main-usecase';

export interface CreateWindowUseCaseData {
  id: string;
  title: string;
  width: number;
  height: number;
  url: string;
}

export class CreateWindowUseCase implements MainUseCase<CreateWindowUseCaseData> {
  async execute(data: CreateWindowUseCaseData): Promise<BrowserWindow> {
    return new Promise((resolve, reject) => {
      try {
        const { width, height, title, url, id } = data;

        const window = new BrowserWindow({
          width,
          height,
          title,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload',
          },
        });

        // Store reference to window if needed
        (global as any).windows = (global as any).windows || new Map();
        (global as any).windows.set(id, window);

        window.loadURL(url);

        window.on('closed', () => {
          (global as any).windows.delete(id);
        });

        resolve(window);
      } catch (error) {
        reject(error);
      }
    });
  }
}
