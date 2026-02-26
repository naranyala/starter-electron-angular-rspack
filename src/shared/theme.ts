import type { ThemeColors } from './types';

export const themeColors: Record<string, ThemeColors> = {
  blue: { color: '#3498db', bg: '#ecf0f1' },
  green: { color: '#27ae60', bg: '#eafaf1' },
  purple: { color: '#9b59b6', bg: '#f5eef8' },
  orange: { color: '#e67e22', bg: '#fdf2e9' },
  red: { color: '#e74c3c', bg: '#fdedec' },
  dark: { color: '#2c3e50', bg: '#d5d8dc' },
};

export function getThemeByCategory(category: string): ThemeColors {
  return themeColors[category] || themeColors.blue;
}

export function getThemeByName(name: string): ThemeColors | undefined {
  return themeColors[name];
}
