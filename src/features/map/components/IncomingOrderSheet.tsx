import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { IncomingOrder } from '../types';

type IncomingOrderSheetProps = {
  order: IncomingOrder;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingOrderSheet({ order, onAccept, onDecline }: IncomingOrderSheetProps) {
  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Новый заказ</Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.metaText}>{order.durationLabel}</Text>
            <Ionicons name="navigate-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.metaText}>{order.distanceLabel}</Text>
          </View>
        </View>
        <View style={styles.portionsBadge}>
          <Ionicons name="restaurant-outline" size={14} color={COLORS.primary} />
          <Text style={styles.portionsText}>{order.portionsLabel}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.pointRow}>
          <View style={styles.dotWrap}>
            <View style={styles.dotPickup} />
          </View>
          <View style={styles.pointText}>
            <Text style={styles.pointLabel}>{order.pickupLabel}</Text>
            <Text style={styles.pointAddress}>{order.pickupAddress}</Text>
          </View>
        </View>
        <View style={styles.line} />
        <View style={styles.pointRow}>
          <View style={styles.dotWrap}>
            <View style={styles.dotDropoff} />
          </View>
          <View style={styles.pointText}>
            <Text style={styles.pointLabel}>{order.dropoffLabel}</Text>
            <Text style={styles.pointAddress}>{order.dropoffAddress}</Text>
          </View>
        </View>
      </View>

      <View style={styles.comment}>
        <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.gray600} />
        <Text style={styles.commentText}>{order.comment}</Text>
      </View>

      <Pressable style={styles.accept} onPress={onAccept}>
        <Text style={styles.acceptText}>Принять заказ</Text>
      </Pressable>
      <Pressable onPress={onDecline} style={styles.decline}>
        <Text style={styles.declineText}>Отклонить</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray400,
    marginRight: 8,
  },
  portionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  portionsText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  route: {
    marginBottom: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotWrap: {
    width: 22,
    alignItems: 'center',
  },
  dotPickup: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray900,
  },
  dotDropoff: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  line: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.border,
    marginLeft: 10,
    marginVertical: 4,
  },
  pointText: {
    flex: 1,
  },
  pointLabel: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  pointAddress: {
    fontSize: 15,
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
    marginBottom: 16,
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray600,
  },
  accept: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  decline: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  declineText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray400,
  },
});
