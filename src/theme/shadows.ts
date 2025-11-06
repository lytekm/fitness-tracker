// src/theme/shadows.ts
import { Platform } from 'react-native';

export const shadow = (elevation = 2) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: Math.round(elevation / 2) },
      shadowOpacity: 0.12 + elevation * 0.01,
      shadowRadius: elevation,
    },
    android: { elevation },
    default: {},
  });
