import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

type DeliveryStatsCardProps = {
  title: string;
  value: number;
  subtitle: string;
};

export function DeliveryStatsCard({ title, value, subtitle }: DeliveryStatsCardProps) {
  return (
    <View style={[styles.card, DARK_SHADOW.glow(COLORS.primary)]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{value}</Text>
        <Text style={styles.portions}>{subtitle}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons name="restaurant" size={20} color={COLORS.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl - 2,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  count: {
    fontFamily: FONTS.extrabold,
    fontSize: TYPE_SCALE.headline + 4,
    color: '#FFFFFF',
  },
  portions: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
