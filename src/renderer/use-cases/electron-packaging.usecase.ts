import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronPackagingUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'packaging-green',
      bg: '#4ade80',
      color: 'black',
    };

    this.generateWindow(card, theme);
  }
}
