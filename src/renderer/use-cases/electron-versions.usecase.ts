import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronVersionsUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'versions-gray',
      bg: '#6b7280',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
