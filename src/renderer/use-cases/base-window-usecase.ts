// Define TypeScript interfaces
export interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description?: string;
}

export interface WindowTheme {
  name: string;
  bg: string;
  color: string;
  headerBg: string;
  headerColor: string;
  borderColor: string;
}

export interface WindowUseCase {
  execute(card: MenuItem, index: number): void;
}

export abstract class BaseWindowUseCase implements WindowUseCase {
  protected generateWindow(card: MenuItem, _theme?: WindowTheme): any {
    // Dynamic import to avoid issues
    const WinBox = require('winbox/src/js/winbox').default;
    const { registerWinBox } = require('../winbox-sidebar');

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

    registerWinBox(winbox);
    setTimeout(() => {
      winbox.maximize?.();
    }, 0);

    // Set the content after the window is created
    setTimeout(() => {
      if (winbox?.body) {
        winbox.body.innerHTML = this.generateCompactContent(card);
      }
    }, 10);

    return winbox;
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

  abstract execute(card: MenuItem, index: number): void;
}
