import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronIntroUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'electron-blue',
      bg: '#4a6cf7',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
