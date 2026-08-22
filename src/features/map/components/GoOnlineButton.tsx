import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { COLORS, SHADOW } from '@/constants/theme';

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

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, SHADOW.medium, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
