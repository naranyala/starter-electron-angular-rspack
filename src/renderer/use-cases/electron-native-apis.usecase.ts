import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronNativeApisUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'api-yellow',
      bg: '#fbbf24',
      color: 'black',
    };

    this.generateWindow(card, theme);
  }
}
