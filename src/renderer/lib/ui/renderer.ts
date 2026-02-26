import { themeColors } from '../../../shared/theme';
import type { MenuItem, ThemeColors } from '../../../shared/types';
import { debounce, fuzzySearch } from '../../../shared/lib/utils';
import {
  addClass,
  createElement,
  findElement,
  hideElement,
  removeClass,
  showElement,
  toggleClass,
} from './dom';

export interface RenderOptions {
  containerSelector: string;
  inputSelector: string;
  onItemClick?: (item: MenuItem) => void;
  highlightQuery?: boolean;
}

export function createRenderer(options: RenderOptions) {
  const { containerSelector, inputSelector, onItemClick, highlightQuery = true } = options;

  let searchTerm = '';
  let menuData: MenuItem[] = [];

  const container = findElement<HTMLElement>(containerSelector);
  const input = findElement<HTMLInputElement>(inputSelector);

  if (!container) {
    console.error(`Container element not found: ${containerSelector}`);
    return null;
  }

  function setMenuData(data: MenuItem[]): void {
    menuData = data;
    render();
  }

  function getTheme(category: string): ThemeColors {
    return themeColors[category] || themeColors.blue;
  }

  function render(): void {
    if (!container) return;
    container.innerHTML = '';

    const filtered = menuData.filter(
      (card: MenuItem) => fuzzySearch(card.title, searchTerm).matches
    );

    if (filtered.length === 0) {
      container.innerHTML = '<div class="no-results">No matching topics found</div>';
      return;
    }

    filtered.forEach((card: MenuItem) => {
      const cardEl = createElement('div', { className: 'simple-card' });
      const result = fuzzySearch(card.title, searchTerm);

      cardEl.innerHTML = `<h3 class="simple-card-title">${highlightQuery ? result.highlighted : card.title}</h3>`;
      cardEl.addEventListener('click', () => onItemClick?.(card));
      container.appendChild(cardEl);
    });
  }

  function handleInput(e: Event): void {
    if (!(e.target instanceof HTMLInputElement)) return;
    searchTerm = e.target.value;
    render();
  }

  const debouncedInput = debounce(handleInput, 150);

  if (input) {
    input.addEventListener('input', debouncedInput);
  }

  return {
    setMenuData,
    render,
    getTheme,
    destroy: () => {
      if (input) {
        input.removeEventListener('input', debouncedInput);
      }
    },
  };
}
