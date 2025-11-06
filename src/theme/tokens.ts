// src/theme/tokens.ts
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

export const typography = {
  family: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'System',
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.35,
    relaxed: 1.5,
  },
  weight: {
    regular: '400' as const,
    medium: '600' as const,
    bold: '700' as const,
  },
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 300 },
  easing: { standard: 'cubic-bezier(0.2,0,0,1)' }, // doc only (RN uses timing funcs)
} as const;

export const layout = {
  contentMaxWidth: 680, // helpful for tablet layouts
} as const;
