import {
  ElectronArchitectureUseCase,
  ElectronDevelopmentUseCase,
  ElectronIntroUseCase,
  ElectronNativeApisUseCase,
  ElectronPackagingUseCase,
  ElectronPerformanceUseCase,
  ElectronSecurityUseCase,
  ElectronVersionsUseCase,
  type MenuItem,
  type WindowUseCase,
} from './use-cases';
import { registerWinBox } from './winbox-sidebar';

export class WindowUseCaseFactory {
  static createUseCase(cardId: string): WindowUseCase | null {
    switch (cardId) {
      case 'electron-intro':
        return new ElectronIntroUseCase();
      case 'electron-architecture':
        return new ElectronArchitectureUseCase();
      case 'electron-security':
        return new ElectronSecurityUseCase();
      case 'electron-packaging':
        return new ElectronPackagingUseCase();
      case 'electron-native-apis':
        return new ElectronNativeApisUseCase();
      case 'electron-performance':
        return new ElectronPerformanceUseCase();
      case 'electron-development':
        return new ElectronDevelopmentUseCase();
      case 'electron-versions':
        return new ElectronVersionsUseCase();
      default:
        return new GenericWindowUseCase();
    }
  }
}

// Compact window use case for all cards
class GenericWindowUseCase {
  execute(card: MenuItem, _index: number): void {
    import('winbox/src/js/winbox').then((WinBoxModule) => {
      const WinBox = WinBoxModule.default;

      const winbox = new WinBox({
        title: card.title,
        html: this.generateCompactContent(card),
        width: 500,
        height: 400,
        x: 'center',
        y: 'center',
        class: 'dark-theme',
        background: '#252526',
        border: 1,
      } as any);

      registerWinBox(winbox as any);
      setTimeout(() => {
        winbox.maximize?.();
      }, 0);

      setTimeout(() => {
        if (winbox?.body) {
          winbox.body.innerHTML = this.generateCompactContent(card);
        }
      }, 10);
    });
  }

  private generateCompactContent(card: MenuItem): string {
    const description = card.description || '';
    const content = card.content || '';

    return `
      <div class="winbox-container">
        <div class="winbox-content">
          ${description ? `<p class="lead">${description}</p>` : ''}
          ${content}
        </div>
      </div>
    `;
  }
}
