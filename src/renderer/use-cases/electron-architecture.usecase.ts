import { BaseWindowUseCase, type MenuItem } from './base-window-usecase';

export class ElectronArchitectureUseCase extends BaseWindowUseCase {
  execute(card: MenuItem, index: number): void {
    // Generate a specific theme for this use case
    const theme = {
      name: 'architecture-purple',
      bg: '#a78bfa',
      color: 'white',
    };

    this.generateWindow(card, theme);
  }
}
