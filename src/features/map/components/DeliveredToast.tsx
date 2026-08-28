// Заменяет старый CompletedOrderSheet — там был шаг "ожидание оплаты",
// которого на бэке нет и не будет (см. обсуждение: бэкенд принципиально
// не хранит и не отдаёт денежные суммы, значит и не может знать оплату).
// POST /delivered — финал сразу, без промежуточного статуса. Это просто
// короткое подтверждение, само исчезает.
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SHADOW } from '@/constants/theme';

type DeliveredToastProps = {
  visible: boolean;
  displayNumber: string;
};

export function DeliveredToast({ visible, displayNumber }: DeliveredToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 80, { duration: 280 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 280 });
  }, [opacity, translateY, visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, SHADOW.soft, { bottom: insets.bottom + 24 }, style]}
    >
      <Text style={styles.text}>Заказ №{displayNumber} доставлен ✓</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  text: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
