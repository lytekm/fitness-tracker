// src/theme/themes.ts
import { neutral, brand, accent, semantic } from './palette';
import { radius, spacing, typography } from './tokens';

export type Theme = {
  name: 'light' | 'dark';
  colors: {
    bg: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    textMuted: string;
    border: string;

    primary: string;
    primaryText: string;
    accent: string;

    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  radius: typeof radius;
  spacing: typeof spacing;
  typography: typeof typography;
  isDark: boolean;
};

export const lightTheme: Theme = {
  name: 'light',
  isDark: false,
  colors: {
    bg: neutral[98],
    surface: neutral[100],
    surfaceElevated: neutral[95],
    text: neutral[20],
    textMuted: neutral[60],
    border: neutral[90],

    primary: brand[80],
    primaryText: neutral[100],
    accent: accent.teal70,

    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
    info: semantic.info,
  },
  radius,
  spacing,
  typography,
};

export const darkTheme: Theme = {
  name: 'dark',
  isDark: true,
  colors: {
    bg: neutral[10],
    surface: neutral[20],
    surfaceElevated: neutral[30],
    text: neutral[95],
    textMuted: neutral[70],
    border: neutral[40],

    primary: brand[70],
    primaryText: neutral[0],
    accent: accent.teal60,

    success: semantic.success,
    warning: semantic.warning,
    danger: semantic.danger,
    info: semantic.info,
  },
  radius,
  spacing,
  typography,
};
