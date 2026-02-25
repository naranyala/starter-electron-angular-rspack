import type { ThemeColors } from '../types/index.js';

export interface AppConfig {
  name: string;
  version: string;
  window: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
  };
  devServer: {
    port: number;
    hotPort: number;
  };
}

export const appConfig: AppConfig = {
  name: 'Electron Vanilla TS Rspack',
  version: '1.0.0',
  window: {
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
  },
  devServer: {
    port: 1234,
    hotPort: 1234,
  },
};

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

export function getDefaultWindowConfig(width: number = 500, height: number = 400) {
  return {
    width,
    height,
    x: 'center' as const,
    y: 'center' as const,
    border: 4,
  };
}
