import { app } from 'electron';
import type { MainUseCase } from './base-main-usecase.js';

export interface QuitAppUseCaseData {
  force?: boolean;
}

export class QuitAppUseCase implements MainUseCase<QuitAppUseCaseData> {
  async execute(data?: QuitAppUseCaseData): Promise<void> {
    return new Promise((resolve) => {
      const { force = false } = data || {};

      if (force) {
        app.exit(0);
      } else {
        app.quit();
      }

      resolve();
    });
  }
}
