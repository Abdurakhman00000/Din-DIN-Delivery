import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { IncomingOrder } from '../types';

type CompletedOrderSheetProps = {
  order: IncomingOrder;
  onComplete: () => void;
};

export function CompletedOrderSheet({ order, onComplete }: CompletedOrderSheetProps) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>Заказ выполнен</Text>
      <Text style={styles.subtitle}>Доставка завершена</Text>

      <View style={styles.portionsCard}>
        <Ionicons name="restaurant-outline" size={20} color={COLORS.white} />
        <Text style={styles.portionsText}>{order.portionsLabel}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Забор</Text>
        <Text style={styles.rowValue}>{order.pickupAddress}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Доставка</Text>
        <Text style={styles.rowValue}>{order.dropoffAddress}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Маршрут</Text>
        <Text style={styles.rowValue}>
          {order.durationLabel} · {order.distanceLabel}
        </Text>
      </View>

      <View style={styles.comment}>
        <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
        <Text style={styles.commentText}>Заказ можно закрыть</Text>
      </View>

      <Pressable style={styles.button} onPress={onComplete}>
        <Text style={styles.buttonText}>Завершить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  portionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  portionsText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
