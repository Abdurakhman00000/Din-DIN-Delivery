import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SHADOW } from '@/constants/theme';

type OnlineToastProps = {
  visible: boolean;
  message?: string;
};

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
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, SHADOW.soft, { top: insets.top + 64 }, style]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    zIndex: 20,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
});
