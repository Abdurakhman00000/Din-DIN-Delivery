/* Reanimated shared values are mutated on the UI thread. */
/* eslint-disable react-hooks/immutability */
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, DARK_SHADOW, FONTS, RADIUS, TYPE_SCALE } from '@/constants/theme';

type GoOnlineButtonProps = {
  label?: string;
  onPress?: () => void;
  blinking?: boolean;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GoOnlineButton({
  label = 'На линию',
  onPress,
  blinking = false,
  disabled = false,
}: GoOnlineButtonProps) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (blinking) {
      opacity.value = withRepeat(
        withSequence(withTiming(0.35, { duration: 180 }), withTiming(1, { duration: 180 })),
        3,
        false,
      );
      return;
    }

    opacity.value = withTiming(1, { duration: 160 });
  }, [blinking, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: disabled ? 0.4 : opacity.value,
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    if (disabled) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      disabled={disabled}
      style={[styles.button, DARK_SHADOW.glow(COLORS.primary), style]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.bodyLarge,
    letterSpacing: 0.1,
  },
});
