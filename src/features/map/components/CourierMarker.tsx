import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { COLORS, SHADOW } from '@/constants/theme';

export function CourierMarker() {
  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View style={[styles.marker, SHADOW.medium]}>
        <Ionicons name="navigate" size={28} color={COLORS.primary} style={styles.icon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  icon: {
    transform: [{ rotate: '-45deg' }],
  },
});
