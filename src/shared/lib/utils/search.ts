import type { SearchResult } from '../types/index.js';

export function fuzzySearch(text: string, query: string): SearchResult {
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
