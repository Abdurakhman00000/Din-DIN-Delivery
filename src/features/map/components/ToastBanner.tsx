// Общий короткий тост снизу экрана — раньше был только под "доставлен"
// (DeliveredToast), теперь переиспользуется и для "проблема отправлена"
// (см. MapScreen.tsx). Сама логика показа/скрытия та же: заменяет
// старый CompletedOrderSheet — там был шаг "ожидание оплаты", которого
// на бэке нет и не будет (бэкенд принципиально не хранит и не отдаёт
// денежные суммы, значит и не может знать оплату).
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

type ToastBannerProps = {
  visible: boolean;
  message: string;
  /** 'success' (по умолчанию) — доставлено/проблема отправлена и т.п.
   * 'error' — не удалось выполнить действие (см. handleGoOnline в
   * MapScreen.tsx: раньше такие ошибки не показывались вообще). */
  tone?: 'success' | 'error';
};

export function ToastBanner({ visible, message, tone = 'success' }: ToastBannerProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const toneColor = tone === 'error' ? DARK.danger : COLORS.primary;

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
      style={[
        styles.toast,
        DARK_SHADOW.glow(toneColor),
        { backgroundColor: toneColor, bottom: insets.bottom + 24 },
        style,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    zIndex: 20,
  },
  text: {
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
    color: '#FFFFFF',
  },
});
