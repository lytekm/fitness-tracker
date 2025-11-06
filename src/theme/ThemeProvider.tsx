// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, Theme } from './themes';

type Mode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void; // light <-> dark (sticks, not system)
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ui:themeMode';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('system');
  const [system, setSystem] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setMode(saved);
    });
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode]);

  const effective = useMemo<Theme>(() => {
    const useDark = mode === 'dark' || (mode === 'system' && system === 'dark');
    return useDark ? darkTheme : lightTheme;
  }, [mode, system]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: effective,
      mode,
      setMode,
      toggle: () => setMode(prev => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [effective, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
};
