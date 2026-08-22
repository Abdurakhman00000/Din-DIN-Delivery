import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { HistorySummary } from '../types';

type EarningsCardProps = {
  summary: HistorySummary;
};

export function EarningsCard({ summary }: EarningsCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{summary.title}</Text>
        <Text style={styles.amount}>{summary.amountLabel}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
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
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
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
