import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

type DeliveryStatsCardProps = {
  title: string;
  value: number;
  subtitle: string;
};

export function DeliveryStatsCard({ title, value, subtitle }: DeliveryStatsCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{value}</Text>
        <Text style={styles.portions}>{subtitle}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  title: {
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 4,
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
  },
  portions: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
