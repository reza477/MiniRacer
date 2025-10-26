import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '@app/theme/colors';
import { useGameStore } from '@game/useGameStore';
import { playClick } from '@game/audio/soundManager';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type PrimaryButtonProps = {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const PrimaryButton = ({
  label,
  onPress,
  variant = 'primary',
  style,
}: PrimaryButtonProps) => {
  const soundEnabled = useGameStore((state) => state.settings.soundEnabled);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      playClick(soundEnabled).catch((error) =>
        console.warn('[Audio] click failed', error),
      );
      onPress?.(event);
    },
    [onPress, soundEnabled],
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.accent,
  },
  secondary: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PrimaryButton;
