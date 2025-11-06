// src/components/ui/Themed.tsx
import React from 'react';
import {
  Text as RNText,
  View,
  Pressable,
  StyleSheet,
  ViewProps,
  TextProps,
  PressableProps,
} from 'react-native';
import { useTheme } from '@/src/theme/useTheme';
import { shadow } from '@/src/theme/shadows';

export const Box: React.FC<ViewProps & { elevated?: boolean; surface?: boolean }> = ({
  style,
  elevated,
  surface,
  ...rest
}) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: surface ? t.colors.surface : 'transparent',
          borderColor: t.colors.border,
          borderRadius: t.radius.lg,
        },
        elevated ? shadow(4) : null,
        style,
      ]}
      {...rest}
    />
  );
};

type TextVariant = 'label' | 'body' | 'title' | 'headline';

export const Text: React.FC<TextProps & { variant?: TextVariant; muted?: boolean }> = ({
  style,
  variant = 'body',
  muted,
  ...rest
}) => {
  const t = useTheme();
  const map: Record<TextVariant, { size: number; weight: string; lh: number }> = {
    label: { size: t.typography.size.sm, lh: t.typography.lineHeight.normal, weight: t.typography.weight.medium },
    body: { size: t.typography.size.md, lh: t.typography.lineHeight.relaxed, weight: t.typography.weight.regular },
    title:{ size: t.typography.size.lg, lh: t.typography.lineHeight.snug,    weight: t.typography.weight.bold },
    headline:{ size: t.typography.size['2xl'], lh: t.typography.lineHeight.snug, weight: t.typography.weight.bold },
  };
  const { size, weight, lh } = map[variant];
  return (
    <RNText
      style={[
        {
          color: muted ? t.colors.textMuted : t.colors.text,
          fontSize: size,
          lineHeight: Math.round(size * lh),
          fontWeight: weight as any,
          fontFamily: t.typography.family.regular,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export const Button: React.FC<
  PressableProps & { variant?: 'primary' | 'ghost'; block?: boolean }
> = ({ style, children, variant = 'primary', block, ...rest }) => {
  const t = useTheme();
  const base = {
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  };
  const primary = {
    backgroundColor: t.colors.primary,
  };
  const ghost = {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.border,
  };
  return (
    <Pressable
      style={[base, variant === 'primary' ? primary : ghost, block && { width: '100%' }, style as any]}
      android_ripple={{ color: t.colors.border }}
      {...rest}
    >
      <Text
        variant="label"
        style={{ color: variant === 'primary' ? t.colors.primaryText : t.colors.text }}
      >
        {children as any}
      </Text>
    </Pressable>
  );
};

export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => {
  const t = useTheme();
  return (
    <Box
      surface
      elevated
      style={[
        {
          padding: t.spacing.lg,
          borderRadius: t.radius.xl,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: t.colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
};
