import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOW } from '@/constants/theme';
import type { ActiveDelivery } from '@/features/deliveries/types';
import { formatDistanceKm, straightLineDistanceKm } from '@/utils/geo';

import type { MapCoordinate } from '../types';

type TripPhase = 'to_pickup' | 'to_customer';

type ActiveTripCardProps = {
  delivery: ActiveDelivery;
  phase: TripPhase;
  courierPosition: MapCoordinate | null;
  onProblemPress: () => void;
};

export function ActiveTripCard({
  delivery,
  phase,
  courierPosition,
  onProblemPress,
}: ActiveTripCardProps) {
  const isToPickup = phase === 'to_pickup';

  const address = isToPickup
    ? // На проде с 31.08.2026 — но остаётся опциональным (см. типа
      // ActiveDelivery), фолбэк остаётся: пустота/"undefined" на
      // экране хуже понятного текста, даже если сейчас это редкий
      // случай, а не постоянный.
      (delivery.pickup_point_address ?? 'Адрес точки — уточняется')
    : delivery.customer_address;

  const destination: MapCoordinate | null = isToPickup
    ? delivery.pickup_point_latitude != null && delivery.pickup_point_longitude != null
      ? { latitude: delivery.pickup_point_latitude, longitude: delivery.pickup_point_longitude }
      : null
    : { latitude: delivery.customer_latitude, longitude: delivery.customer_longitude };

  const distanceLabel =
    courierPosition && destination
      ? formatDistanceKm(straightLineDistanceKm(courierPosition, destination))
      : null;

  const bundleLabel =
    delivery.bundle_id && delivery.bundle_position
      ? `Заказ ${delivery.bundle_position} из 2 · `
      : '';

  const canCall = !isToPickup && !!delivery.customer_phone;

  return (
    <View style={[styles.card, SHADOW.soft]}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.status}>
            {bundleLabel}
            {isToPickup ? 'Еду за заказом' : 'Еду к клиенту'} · №{delivery.display_number}
          </Text>
          <Text style={styles.address}>{address}</Text>
        </View>
        {distanceLabel ? (
          <View style={styles.eta}>
            <Text style={styles.etaDistance}>{distanceLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.action, !canCall && styles.actionDisabled]}
          disabled={!canCall}
          onPress={() => {
            if (delivery.customer_phone) {
              Linking.openURL(`tel:${delivery.customer_phone}`);
            }
          }}
        >
          <Ionicons
            name="call-outline"
            size={16}
            color={canCall ? COLORS.gray900 : COLORS.gray400}
          />
          <Text style={[styles.actionText, !canCall && styles.actionTextDisabled]}>
            Позвонить
          </Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onProblemPress}>
          <Ionicons name="alert-circle-outline" size={16} color={COLORS.gray900} />
          <Text style={styles.actionText}>Проблема</Text>
        </Pressable>
      </View>
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
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  eta: {
    alignItems: 'flex-end',
  },
  etaDistance: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray600,
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
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  actionTextDisabled: {
    color: COLORS.gray400,
  },
});
