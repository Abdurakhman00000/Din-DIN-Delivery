import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

type OnlineToastProps = {
  visible: boolean;
  message?: string;
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function OnlineToast({
  visible,
  message = 'Вы на линии. Ожидайте заказов',
}: OnlineToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -80, { duration: 280 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 280 });
  }, [opacity, translateY, visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedBlurView
      intensity={60}
      tint="dark"
      pointerEvents="none"
      style={[styles.toast, DARK_SHADOW.button, { top: insets.top + 64 }, style]}
    >
      <Text style={styles.text}>{message}</Text>
    </AnimatedBlurView>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: DARK.glass,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    overflow: 'hidden',
    zIndex: 20,
  },
  text: {
    textAlign: 'center',
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
  },
});
