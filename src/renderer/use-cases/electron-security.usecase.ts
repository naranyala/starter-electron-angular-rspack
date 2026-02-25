import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronSecurityUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'security-red',
      bg: '#f87171',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
