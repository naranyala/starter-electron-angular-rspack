/**
 * Search Service
 * 
 * Provides search functionality with reactive signals.
 * Handles filtering, sorting, and search state management.
 * 
 * Usage:
 *   constructor(private searchService: SearchService) {}
 *   
 *   onSearch(query: string) {
 *     this.searchService.search(query);
 *   }
 */

import { Injectable, signal, computed, Signal } from '@angular/core';
import { type Card } from '../../models/card.model.js';
import { getLogger } from '../../viewmodels/logger.viewmodel.js';

export interface SearchOptions {
  /** Search in title only or also in description */
  searchInDescription?: boolean;
  /** Minimum characters before search triggers */
  minChars?: number;
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Enable fuzzy search */
  fuzzy?: boolean;
}

export interface SearchState {
  query: string;
  results: Card[];
  totalAvailable: number;
  hasActiveSearch: boolean;
  searchTime: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly logger = getLogger('search.service');
  private readonly searchQuery = signal('');
  private readonly allCards = signal<Card[]>([]);
  private readonly options: SearchOptions;
  private readonly searchTime = signal(0);

  readonly filteredCards = computed(() => {
    const query = this.searchQuery().trim();
    const cards = this.allCards();
    
    if (!query || query.length < (this.options.minChars || 1)) {
      return cards;
    }

    const startTime = performance.now();
    const results = this.performSearch(cards, query);
    const endTime = performance.now();
    
    this.searchTime.set(endTime - startTime);
    
    this.logger.debug('Search completed', {
      query,
      results: results.length,
      total: cards.length,
      time: this.searchTime(),
    });

    return results;
  });

  readonly state = computed<SearchState>(() => ({
    query: this.searchQuery(),
    results: this.filteredCards(),
    totalAvailable: this.allCards().length,
    hasActiveSearch: this.hasActiveSearch(),
    searchTime: this.searchTime(),
  }));

  constructor() {
    this.options = {
      searchInDescription: true,
      minChars: 1,
      caseSensitive: false,
      fuzzy: false,
    };
    
    this.logger.info('Search service initialized');
  }

  /**
   * Set the cards to search through
   */
  setCards(cards: Card[]): void {
    this.allCards.set(cards);
    this.logger.debug('Cards updated', { count: cards.length });
  }

  /**
   * Add a card to the search index
   */
  addCard(card: Card): void {
    const current = this.allCards();
    const exists = current.some(c => c.id === card.id);
    
    if (!exists) {
      this.allCards.set([...current, card]);
      this.logger.debug('Card added to index', { cardId: card.id });
    }
  }

  /**
   * Remove a card from the search index
   */
  removeCard(cardId: number): void {
    const current = this.allCards();
    const filtered = current.filter(c => c.id !== cardId);
    
    if (filtered.length !== current.length) {
      this.allCards.set(filtered);
      this.logger.debug('Card removed from index', { cardId });
    }
  }

  /**
   * Update a card in the search index
   */
  updateCard(card: Card): void {
    const current = this.allCards();
    const index = current.findIndex(c => c.id === card.id);
    
    if (index >= 0) {
      const updated = [...current];
      updated[index] = card;
      this.allCards.set(updated);
      this.logger.debug('Card updated in index', { cardId: card.id });
    }
  }

  /**
   * Perform a search
   */
  search(query: string): Card[] {
    this.searchQuery.set(query);
    return this.filteredCards();
  }

  /**
   * Clear the search
   */
  clear(): void {
    this.searchQuery.set('');
    this.searchTime.set(0);
    this.logger.debug('Search cleared');
  }

  /**
   * Get the current search query
   */
  getQuery(): string {
    return this.searchQuery();
  }

  /**
   * Check if there's an active search
   */
  hasActiveSearch(): boolean {
    const query = this.searchQuery().trim();
    return query.length >= (this.options.minChars || 1);
  }

  /**
   * Get search statistics
   */
  getStats(): { query: string; results: number; total: number; time: number } {
    return {
      query: this.searchQuery(),
      results: this.filteredCards().length,
      total: this.allCards().length,
      time: this.searchTime(),
    };
  }

  /**
   * Update search options
   */
  updateOptions(options: Partial<SearchOptions>): void {
    Object.assign(this.options, options);
    this.logger.debug('Search options updated', options);
    
    // Re-trigger search if there's an active query
    if (this.hasActiveSearch()) {
      this.search(this.searchQuery());
    }
  }

  /**
   * Highlight search terms in text
   */
  highlight(text: string, className = 'highlight'): string {
    const query = this.searchQuery().trim();
    if (!query) return text;

    const flags = this.options.caseSensitive ? 'g' : 'gi';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, flags);
    
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
  }

  private performSearch(cards: Card[], query: string): Card[] {
    const normalizedQuery = this.options.caseSensitive 
      ? query 
      : query.toLowerCase();

    return cards.filter(card => {
      const title = this.options.caseSensitive 
        ? card.title 
        : card.title.toLowerCase();
      
      // Search in title
      if (title.includes(normalizedQuery)) {
        return true;
      }

      // Search in description if enabled
      if (this.options.searchInDescription && card.description) {
        const description = this.options.caseSensitive
          ? card.description
          : card.description.toLowerCase();
        
        if (description.includes(normalizedQuery)) {
          return true;
        }
      }

      // Fuzzy search if enabled
      if (this.options.fuzzy) {
        return this.fuzzyMatch(card.title, normalizedQuery);
      }

      return false;
    });
  }

  private fuzzyMatch(text: string, query: string): boolean {
    let queryIndex = 0;
    
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === query.length;
  }
}
