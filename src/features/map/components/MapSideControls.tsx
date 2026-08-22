import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import { MapCircleButton, MapFloatingPanel } from './MapFloatingButton';

type MapLeftControlsProps = {
  onSearchPress?: () => void;
};

export function MapLeftControls({ onSearchPress }: MapLeftControlsProps) {
  return <MapCircleButton icon="search-outline" onPress={onSearchPress} />;
}

type MapRightControlsProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocatePress?: () => void;
};

export function MapRightControls({ onZoomIn, onZoomOut, onLocatePress }: MapRightControlsProps) {
  return (
    <View style={styles.container}>
      <MapFloatingPanel>
        <Pressable onPress={onZoomIn} style={styles.zoomButton} accessibilityLabel="Увеличить">
          <Ionicons name="add" size={22} color={COLORS.gray900} />
        </Pressable>
        <View style={styles.zoomDivider} />
        <Pressable onPress={onZoomOut} style={styles.zoomButton} accessibilityLabel="Уменьшить">
          <Ionicons name="remove" size={22} color={COLORS.gray900} />
        </Pressable>
      </MapFloatingPanel>

      <MapCircleButton icon="navigate-outline" onPress={onLocatePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: 'center',
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 8,
  },
});
