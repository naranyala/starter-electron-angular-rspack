import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronDevelopmentUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'development-teal',
      bg: '#14b8a6',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
