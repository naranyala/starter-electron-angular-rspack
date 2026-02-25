import { menuData } from './menu-data';
import { WindowUseCaseFactory } from './window-usecase-factory';

interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  description?: string;
}

type ViewMode = 'all' | string;

const fuzzySearch = (text: string, query: string): boolean => {
  if (!query) return true;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let queryIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const lowerChar = char.toLowerCase();

    if (queryIndex < lowerQuery.length && lowerChar === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length;
};

class App {
  private searchTerm: string = '';
  private searchInput: HTMLInputElement | null = null;
  private cardsContainer: HTMLElement | null = null;
  private viewMode: ViewMode = 'all';
  private viewSwitcher: HTMLElement | null = null;
  private categories: string[] = [];

  init(): void {
    this.categories = [...new Set(menuData.map((item) => item.category))];
    this.setupDOMElements();
    this.setupEventListeners();
    this.render();
  }

  private setupDOMElements(): void {
    this.searchInput = document.querySelector('.search-input') as HTMLInputElement;
    this.cardsContainer = document.querySelector('.cards-list') as HTMLElement;
    this.viewSwitcher = document.querySelector('.view-switcher') as HTMLElement;

    if (this.viewSwitcher) {
      this.viewSwitcher.innerHTML = '';

      const allButton = this.createTabButton('all', 'All');
      this.viewSwitcher.appendChild(allButton);

      this.categories.forEach((category) => {
        const button = this.createTabButton(category, this.formatCategory(category));
        this.viewSwitcher?.appendChild(button);
      });
    }
  }

  private createTabButton(mode: string, label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'switcher-button';
    button.dataset.mode = mode;
    button.textContent = label;

    if (mode === 'all') {
      button.classList.add('active');
    }

    return button;
  }

  private setupEventListeners(): void {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.searchTerm = target.value;
        this.render();
      });
    }

    if (this.viewSwitcher) {
      const switcherButtons = this.viewSwitcher.querySelectorAll('.switcher-button');
      switcherButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const mode = target.dataset.mode as ViewMode;
          if (mode) {
            this.viewMode = mode;
            this.render();
          }
        });
      });
    }
  }

  private render(): void {
    this.updateViewSwitcherState();

    if (this.viewMode === 'all') {
      this.renderAllCategoriesView();
    } else {
      this.renderSingleCategoryView(this.viewMode);
    }
  }

  private updateViewSwitcherState(): void {
    if (!this.viewSwitcher) return;

    const switcherButtons = this.viewSwitcher.querySelectorAll('.switcher-button');
    switcherButtons.forEach((button) => {
      const mode = (button as HTMLElement).dataset.mode;
      if (mode === this.viewMode) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  private renderAllCategoriesView(): void {
    if (!this.cardsContainer) return;

    this.cardsContainer.innerHTML = '';

    let cardsToRender = menuData;
    if (this.searchTerm) {
      cardsToRender = menuData.filter((card: MenuItem) => {
        const titleMatch = fuzzySearch(card.title, this.searchTerm);
        const descMatch = card.description ? fuzzySearch(card.description, this.searchTerm) : false;
        const categoryMatch = fuzzySearch(card.category, this.searchTerm);
        return titleMatch || descMatch || categoryMatch;
      });
    }

    if (cardsToRender.length === 0) {
      this.cardsContainer.innerHTML =
        '<div class="no-results">No matching integrations found</div>';
      return;
    }

    const categories = [...new Set(cardsToRender.map((item) => item.category))];

    categories.forEach((category) => {
      const categoryItems = cardsToRender.filter((item) => item.category === category);

      if (categoryItems.length === 0) return;

      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';

      const categoryTitle = document.createElement('h2');
      categoryTitle.className = 'category-title';
      categoryTitle.textContent = this.formatCategory(category);
      categorySection.appendChild(categoryTitle);

      cardsToRender
        .filter((item) => item.category === category)
        .forEach((card: MenuItem, index: number) => {
          const cardElement = this.createSimpleCardElement(card, index);
          this.cardsContainer?.appendChild(cardElement);
        });
    });
  }

  private renderSingleCategoryView(category: string): void {
    if (!this.cardsContainer) return;

    this.cardsContainer.innerHTML = '';

    let cardsToRender = menuData.filter((card) => card.category === category);

    if (this.searchTerm) {
      cardsToRender = cardsToRender.filter((card: MenuItem) => {
        const titleMatch = fuzzySearch(card.title, this.searchTerm);
        const descMatch = card.description ? fuzzySearch(card.description, this.searchTerm) : false;
        return titleMatch || descMatch;
      });
    }

    if (cardsToRender.length === 0) {
      this.cardsContainer.innerHTML =
        '<div class="no-results">No matching integrations found</div>';
      return;
    }

    cardsToRender.forEach((card: MenuItem, index: number) => {
      const cardElement = this.createSimpleCardElement(card, index);
      this.cardsContainer?.appendChild(cardElement);
    });
  }

  private formatCategory(category: string): string {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private createSimpleCardElement(card: MenuItem, index: number): HTMLElement {
    const cardElement = document.createElement('div');
    cardElement.className = 'simple-card';

    cardElement.innerHTML = `
      <h3 class="simple-card-title">
        ${card.title}
      </h3>
      <p class="simple-card-desc">
        ${card.description || card.title}
      </p>
    `;

    cardElement.addEventListener('click', () => {
      this.handleCardClick(card, index);
    });

    return cardElement;
  }

  private handleCardClick(card: MenuItem, index: number): void {
    const useCase = WindowUseCaseFactory.createUseCase(card.id);
    if (useCase) {
      useCase.execute(card, index);
    }
  }
}

export default App;
