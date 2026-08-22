import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOW } from '@/constants/theme';

import type { CourierShiftStatus, IncomingOrder, OrderPaymentStatus } from '../types';

type TripPhase = Extract<
  CourierShiftStatus,
  'toPickup' | 'atPickup' | 'toDropoff' | 'awaitingPayment'
>;

type ActiveTripCardProps = {
  order: IncomingOrder;
  phase: TripPhase;
  paymentStatus?: OrderPaymentStatus;
};

const PHASE_COPY: Record<
  TripPhase,
  { status: string; addressKey: 'pickupAddress' | 'dropoffAddress'; timeKey: 'durationLabel' | 'deliveryDurationLabel'; distanceKey: 'distanceLabel' | 'deliveryDistanceLabel' }
> = {
  toPickup: {
    status: 'Еду в пункт выдачи',
    addressKey: 'pickupAddress',
    timeKey: 'durationLabel',
    distanceKey: 'distanceLabel',
  },
  atPickup: {
    status: 'На месте у ПВЗ',
    addressKey: 'pickupAddress',
    timeKey: 'durationLabel',
    distanceKey: 'distanceLabel',
  },
  toDropoff: {
    status: 'Еду к клиенту',
    addressKey: 'dropoffAddress',
    timeKey: 'deliveryDurationLabel',
    distanceKey: 'deliveryDistanceLabel',
  },
  awaitingPayment: {
    status: 'Ожидание оплаты',
    addressKey: 'dropoffAddress',
    timeKey: 'deliveryDurationLabel',
    distanceKey: 'deliveryDistanceLabel',
  },
};

export function ActiveTripCard({
  order,
  phase,
  paymentStatus = 'pending',
}: ActiveTripCardProps) {
  const copy = PHASE_COPY[phase];

  return (
    <View style={[styles.card, SHADOW.soft]}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.status}>{copy.status}</Text>
          <Text style={styles.address}>{order[copy.addressKey]}</Text>
        </View>
        <View style={styles.eta}>
          <Text style={styles.etaTime}>{order[copy.timeKey]}</Text>
          <Text style={styles.etaDistance}>{order[copy.distanceKey]}</Text>
        </View>
      </View>

      {phase === 'awaitingPayment' ? (
        <View style={[styles.payment, paymentStatus === 'paid' && styles.paymentPaid]}>
          <Ionicons
            name={paymentStatus === 'paid' ? 'checkmark-circle' : 'time-outline'}
            size={16}
            color={paymentStatus === 'paid' ? COLORS.primary : COLORS.gray600}
          />
          <Text style={[styles.paymentText, paymentStatus === 'paid' && styles.paymentTextPaid]}>
            {paymentStatus === 'paid' ? 'Клиент оплатил' : 'Ожидаем оплату клиента'}
          </Text>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.action}>
            <Ionicons name="call-outline" size={16} color={COLORS.gray900} />
            <Text style={styles.actionText}>Позвонить</Text>
          </Pressable>
          <Pressable style={styles.action}>
            <Ionicons name="help-circle-outline" size={16} color={COLORS.gray900} />
            <Text style={styles.actionText}>Помощь</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  address: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  eta: {
    alignItems: 'flex-end',
  },
  etaTime: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  etaDistance: {
    fontSize: 13,
    color: COLORS.gray400,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  paymentPaid: {
    backgroundColor: '#ECFDF3',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  paymentTextPaid: {
    color: COLORS.primary,
  },
});
