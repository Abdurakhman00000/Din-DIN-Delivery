import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { COLORS, SHADOW } from '@/constants/theme';

/**
 * "Я здесь" — фиксированный в центре экрана маркер собственной позиции
 * курьера в состояниях offline/waiting (карта двигается под ним, не
 * наоборот). Тот же язык, что у "синей точки" в Google/Яндекс/Apple
 * Maps — мягкое пульсирующее пятно + белое кольцо + сплошная точка
 * бренд-цвета, а не diamond-иконка с компасом. Во время активной
 * доставки (to_pickup/to_customer) этот компонент не показывается
 * вообще — там курьера отмечает собственный маркер внутри карты
 * (CourierMapView.tsx, COURIER_ICON), с реальными GPS-координатами
 * относительно маршрута, а не фиксированной точкой на экране.
 */
export function CourierMarker() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 1.6 }],
    opacity: (1 - pulse.value) * 0.35,
  }));

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <View style={[styles.ring, SHADOW.medium]}>
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const MARKER_SIZE = 26;

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: COLORS.primary,
  },
  ring: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: MARKER_SIZE - 10,
    height: MARKER_SIZE - 10,
    borderRadius: (MARKER_SIZE - 10) / 2,
    backgroundColor: COLORS.primary,
  },
});
