import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { DARK, SPACING } from '@/constants/theme';

import { MapCircleButton, MapFloatingDivider, MapFloatingPanel } from './MapFloatingButton';

type MapRightControlsProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocatePress?: () => void;
};

/**
 * Зум + "моя позиция" — низ-право, в зоне большого пальца, как во всех
 * настоящих картографических приложениях (Google Maps/Uber/Yandex).
 * Раньше это плавало посередине левого/правого края экрана — ничем не
 * привязанное ни к низу, ни к верху место, куда рука не тянется
 * естественным движением. Кнопка поиска отсюда убрана совсем — она вела
 * на шторку с захардкоженным мок-списком мест (MOCK_PLACES), не имеющую
 * отношения к реальному потоку курьера (заказ не выбирают, его
 * назначают — искать тут физически нечего).
 */
export function MapRightControls({ onZoomIn, onZoomOut, onLocatePress }: MapRightControlsProps) {
  function handleZoom(fn?: () => void) {
    return () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fn?.();
    };
  }

  return (
    <View style={styles.container}>
      <MapFloatingPanel>
        <Pressable
          onPress={handleZoom(onZoomIn)}
          style={styles.zoomButton}
          accessibilityLabel="Увеличить"
        >
          <Ionicons name="add" size={20} color={DARK.textPrimary} />
        </Pressable>
        <MapFloatingDivider />
        <Pressable
          onPress={handleZoom(onZoomOut)}
          style={styles.zoomButton}
          accessibilityLabel="Уменьшить"
        >
          <Ionicons name="remove" size={20} color={DARK.textPrimary} />
        </Pressable>
      </MapFloatingPanel>

      <MapCircleButton icon="navigate" onPress={onLocatePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
    alignItems: 'center',
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
