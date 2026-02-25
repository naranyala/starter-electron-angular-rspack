import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronPerformanceUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'performance-indigo',
      bg: '#6366f1',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
