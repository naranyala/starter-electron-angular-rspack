import './styles.css';
import { menuData } from './menu-data';
import { registerWinBox } from './winbox-sidebar';

interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

let searchTerm = '';

function fuzzySearch(text: string, query: string): { matches: boolean; highlighted: string } {
  if (!query) return { matches: true, highlighted: text };

  let queryIndex = 0;
  let highlighted = '';

  for (const char of text) {
    if (queryIndex < query.length && char.toLowerCase() === query[queryIndex].toLowerCase()) {
      highlighted += `<mark>${char}</mark>`;
      queryIndex++;
    } else {
      highlighted += char;
    }
  }

  return { matches: queryIndex === query.length, highlighted };
}

function render(): void {
  const container = document.querySelector('.cards-list') as HTMLElement;
  if (!container) return;

  container.innerHTML = '';

  const filtered = menuData.filter((card: MenuItem) => fuzzySearch(card.title, searchTerm).matches);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">No matching topics found</div>';
    return;
  }

  filtered.forEach((card: MenuItem) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'simple-card';
    const result = fuzzySearch(card.title, searchTerm);

    cardEl.innerHTML = `<h3 class="simple-card-title">${result.highlighted}</h3>`;
    cardEl.addEventListener('click', () => openWindow(card));
    container.appendChild(cardEl);
  });
}

async function openWindow(card: MenuItem): Promise<void> {
  const { default: WinBox } = await import('winbox');

  const colors: Record<string, { color: string; bg: string }> = {
    blue: { color: '#3498db', bg: '#ecf0f1' },
    green: { color: '#27ae60', bg: '#eafaf1' },
    purple: { color: '#9b59b6', bg: '#f5eef8' },
    orange: { color: '#e67e22', bg: '#fdf2e9' },
    red: { color: '#e74c3c', bg: '#fdedec' },
    dark: { color: '#2c3e50', bg: '#d5d8dc' },
  };

  const theme = colors[card.category] || colors.blue;

  const winbox = new WinBox({
    title: card.title,
    width: 500,
    height: 400,
    x: 'center',
    y: 'center',
    class: 'dark-theme',
    background: theme.bg,
    border: 4,
    html: `<div style="padding: 20px; color: ${theme.color};">
      <h3>${card.title}</h3>
      <div>${card.content}</div>
    </div>`,
  });

  registerWinBox(winbox as any);
  setTimeout(() => {
    winbox.maximize?.();
  }, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-input') as HTMLInputElement;

  searchInput?.addEventListener('input', (e) => {
    searchTerm = (e.target as HTMLInputElement).value;
    render();
  });

  render();
});
