import { describe, expect, it } from 'bun:test';
import { getThemeByCategory, themeColors } from '../../src/shared/theme';

describe('theme helpers', () => {
  it('returns the configured theme for a known category', () => {
    const theme = getThemeByCategory('green');
    expect(theme).toEqual(themeColors.green);
  });

  it('falls back to blue for unknown categories', () => {
    const theme = getThemeByCategory('unknown');
    expect(theme).toEqual(themeColors.blue);
  });
});
