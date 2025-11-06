// src/theme/useTheme.ts
import { useThemeContext } from './ThemeProvider';
export const useTheme = () => useThemeContext().theme;
