import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import type { ActiveDelivery } from '@/features/deliveries/types';
import { formatDistanceKm, formatDurationMin, straightLineDistanceKm } from '@/utils/geo';

import type { RouteInfo } from './CourierMapView';
import type { MapCoordinate } from '../types';

type TripPhase = 'to_pickup' | 'to_customer';

type ActiveTripCardProps = {
  delivery: ActiveDelivery;
  phase: TripPhase;
  courierPosition: MapCoordinate | null;
  /** Реальные distance/duration от 2ГИС Routing API для текущего
   * маршрута — null, пока не пришли (тогда ниже используется честное
   * приближение "по прямой") или запрос не удался. См. CourierMapView. */
  routeInfo: RouteInfo | null;
  onProblemPress: () => void;
};

export function ActiveTripCard({
  delivery,
  phase,
  courierPosition,
  routeInfo,
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

  // Реальный маршрут от 2ГИС — приоритет; пока не пришёл (или не удался),
  // честное приближение "по прямой", а не пусто (см. utils/geo.ts).
  const distanceLabel = routeInfo
    ? formatDistanceKm(routeInfo.distanceM / 1000)
    : courierPosition && destination
      ? formatDistanceKm(straightLineDistanceKm(courierPosition, destination))
      : null;
  const durationLabel = routeInfo ? formatDurationMin(routeInfo.durationS) : null;

  const bundleLabel =
    delivery.bundle_id && delivery.bundle_position ? `${delivery.bundle_position}/2 · ` : '';

  const canCall = !isToPickup && !!delivery.customer_phone;

  function handleCall() {
    if (!delivery.customer_phone) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${delivery.customer_phone}`);
  }

  function handleProblem() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onProblemPress();
  }

  return (
    <BlurView intensity={54} tint="dark" style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.info}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isToPickup ? styles.statusDotPickup : null]} />
            <Text style={styles.status}>
              {bundleLabel}
              {isToPickup ? 'Еду за заказом' : 'Еду к клиенту'}
            </Text>
            <Text style={styles.orderNumber}>№{delivery.display_number}</Text>
          </View>
          <Text style={styles.address} numberOfLines={2}>
            {address}
          </Text>
        </View>
        {distanceLabel ? (
          <View style={styles.eta}>
            <Text style={styles.etaDistance}>{distanceLabel}</Text>
            {durationLabel ? <Text style={styles.etaDuration}>{durationLabel}</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.action,
            !canCall && styles.actionDisabled,
            pressed && canCall && styles.actionPressed,
          ]}
          disabled={!canCall}
          onPress={handleCall}
        >
          <Ionicons name="call" size={16} color={canCall ? DARK.textPrimary : DARK.textMuted} />
          <Text style={[styles.actionText, !canCall && styles.actionTextDisabled]}>Позвонить</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.action,
            styles.actionDanger,
            pressed && styles.actionPressed,
          ]}
          onPress={handleProblem}
        >
          <Ionicons name="alert-circle" size={16} color={DARK.danger} />
          <Text style={[styles.actionText, styles.actionTextDanger]}>Проблема</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DARK.glass,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: DARK.hairline,
    overflow: 'hidden',
    ...DARK_SHADOW.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  info: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK.primaryGlow,
    // На "еду к клиенту" — сплошная точка (уже забрал, дело почти
    // сделано); на "еду за заказом" — приглушённая (в процессе).
  },
  statusDotPickup: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#22C55E',
  },
  status: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.label,
    color: '#4ADE80',
    letterSpacing: 0.1,
  },
  orderNumber: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    color: DARK.textMuted,
    marginLeft: 'auto',
  },
  address: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.title,
    color: DARK.textPrimary,
    letterSpacing: -0.2,
  },
  eta: {
    alignItems: 'flex-end',
  },
  etaDistance: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textPrimary,
  },
  etaDuration: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.caption,
    color: DARK.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DARK.hairline,
    paddingVertical: 12,
    minHeight: 44,
  },
  actionDanger: {
    backgroundColor: DARK.dangerGlow,
    borderColor: 'rgba(248,113,113,0.35)',
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionText: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.label,
    color: DARK.textPrimary,
  },
  actionTextDanger: {
    color: '#FCA5A5',
  },
  actionTextDisabled: {
    color: DARK.textMuted,
  },
});
