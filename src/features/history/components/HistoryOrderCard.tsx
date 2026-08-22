import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { HistoryOrder } from '../types';

const STATUS_LABEL: Record<HistoryOrder['status'], string> = {
  delivered: 'Доставлен',
};

type HistoryOrderCardProps = {
  order: HistoryOrder;
};

export function HistoryOrderCard({ order }: HistoryOrderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.address}>{order.address}</Text>
          <Text style={styles.date}>{order.deliveredAtLabel}</Text>
        </View>
        <Text style={styles.price}>{order.earningsLabel}</Text>
      </View>
      <View style={styles.status}>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
        <Text style={styles.statusText}>{STATUS_LABEL[order.status]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  date: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
