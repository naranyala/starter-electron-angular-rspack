import { dialog, type MessageBoxOptions } from 'electron';
import type { MainUseCase } from './base-main-usecase.js';

export interface ShowMessageUseCaseData {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title: string;
  message: string;
  detail?: string;
  buttons?: string[];
}

export class ShowMessageUseCase implements MainUseCase<ShowMessageUseCaseData> {
  async execute(data: ShowMessageUseCaseData): Promise<number> {
    return new Promise((resolve) => {
      const options: MessageBoxOptions = {
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        detail: data.detail,
        buttons: data.buttons || ['OK'],
      };

      dialog.showMessageBox(options).then((result) => {
        resolve(result.response);
      });
    });
  }
}
