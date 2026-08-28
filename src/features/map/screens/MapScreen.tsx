import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useMarkDeliveredMutation,
  useMarkPickedUpMutation,
} from '@/features/deliveries/api/deliveriesApi';
import type { ChecklistItemIn } from '@/features/deliveries/types';
import { useCourierSession } from '@/features/shifts';

import { ActiveTripCard } from '../components/ActiveTripCard';
import { ChecklistSheet } from '../components/ChecklistSheet';
import { CourierMapView, type CourierMapViewRef } from '../components/CourierMapView';
import { CourierMarker } from '../components/CourierMarker';
import { DeliveredToast } from '../components/DeliveredToast';
import { GoOnlineButton } from '../components/GoOnlineButton';
import { MapHeader } from '../components/MapHeader';
import { MapSearchSheet } from '../components/MapSearchSheet';
import { MapLeftControls, MapRightControls } from '../components/MapSideControls';
import { OnlineToast } from '../components/OnlineToast';
import { useCourierPosition } from '../hooks/useCourierPosition';

export function MapScreen() {
  const mapRef = useRef<CourierMapViewRef>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [deliveredToast, setDeliveredToast] = useState<{ number: string } | null>(null);

  const session = useCourierSession();
  const { state, primaryDelivery } = session;

  const [markPickedUp, pickedUpState] = useMarkPickedUpMutation();
  const [markDelivered, deliveredState] = useMarkDeliveredMutation();

  const courierPosition = useCourierPosition(state === 'to_pickup' || state === 'to_customer');

  // Только что вышел на линию — короткий тост "ожидайте заказов".
  // Показываем ровно там, где произошло событие (успешный вызов
  // goOnline в handleGoOnline ниже) — не из эффекта, реагирующего на
  // производное состояние сессии.
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    if (!primaryDelivery || !courierPosition) {
      mapRef.current?.clearRoute();
      return;
    }

    if (state === 'to_pickup') {
      const destination =
        primaryDelivery.pickup_point_latitude != null &&
        primaryDelivery.pickup_point_longitude != null
          ? {
              latitude: primaryDelivery.pickup_point_latitude,
              longitude: primaryDelivery.pickup_point_longitude,
            }
          : null;
      if (destination) {
        mapRef.current?.showRoute(courierPosition, destination, 'A');
      } else {
        mapRef.current?.clearRoute();
      }
      return;
    }

    if (state === 'to_customer') {
      mapRef.current?.showRoute(
        courierPosition,
        { latitude: primaryDelivery.customer_latitude, longitude: primaryDelivery.customer_longitude },
        'B',
      );
      return;
    }

    mapRef.current?.clearRoute();
  }, [state, primaryDelivery, courierPosition]);

  async function handleConfirmChecklist(checked: Record<string, boolean>) {
    if (!primaryDelivery) {
      return;
    }
    const checklist: ChecklistItemIn[] = primaryDelivery.items.map((item) => ({
      item_id: item.id,
      is_checked: !!checked[item.id],
    }));
    try {
      await markPickedUp({ deliveryId: primaryDelivery.id, checklist }).unwrap();
      setChecklistOpen(false);
    } catch {
      // Ошибка (422 — неполный чек-лист/не совпал состав, 409 — заказ
      // уже не в том статусе) остаётся видна через pickedUpState.error —
      // сама шторка не закрывается, курьер видит форму и может
      // поправить/повторить.
    }
  }

  async function handleGoOnline() {
    try {
      await session.goOnline();
      setJustWentOnline(true);
      setTimeout(() => setJustWentOnline(false), 3000);
    } catch {
      // Сеть/бэкенд недоступны — просто остаёмся оффлайн, кнопка
      // снова активна и курьер может повторить попытку сам.
    }
  }

  async function handleDeliver() {
    if (!primaryDelivery) {
      return;
    }
    const number = primaryDelivery.display_number;
    try {
      await markDelivered({ deliveryId: primaryDelivery.id }).unwrap();
      setDeliveredToast({ number });
      setTimeout(() => setDeliveredToast(null), 3000);
    } catch {
      // См. комментарий в handleConfirmChecklist — ошибка видна через
      // deliveredState.error, кнопка просто останется активной.
    }
  }

  const showIdleControls = state === 'offline' || state === 'waiting';

  return (
    <View style={styles.container}>
      <CourierMapView ref={mapRef} />
      {state === 'to_pickup' || state === 'to_customer' ? null : <CourierMarker />}

      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        {primaryDelivery && (state === 'to_pickup' || state === 'to_customer') ? (
          <ActiveTripCard
            delivery={primaryDelivery}
            phase={state}
            courierPosition={courierPosition}
          />
        ) : (
          <MapHeader />
        )}
      </SafeAreaView>

      <OnlineToast visible={justWentOnline} />

      {showIdleControls ? (
        <>
          <View style={styles.leftControls}>
            <MapLeftControls onSearchPress={() => setSearchOpen(true)} />
          </View>
          <View style={styles.rightControls}>
            <MapRightControls
              onZoomIn={() => mapRef.current?.zoomIn()}
              onZoomOut={() => mapRef.current?.zoomOut()}
              onLocatePress={() => mapRef.current?.centerOnBishkek()}
            />
          </View>
          <View style={styles.bottomOverlay}>
            <GoOnlineButton
              label={state === 'waiting' ? 'На линии' : 'На линию'}
              disabled={state === 'waiting' || session.isStartingShift}
              onPress={handleGoOnline}
            />
          </View>
        </>
      ) : null}

      {state === 'to_pickup' && primaryDelivery ? (
        <View style={styles.bottomOverlay}>
          <GoOnlineButton label="Забрал" onPress={() => setChecklistOpen(true)} />
        </View>
      ) : null}

      {state === 'to_customer' && primaryDelivery ? (
        <View style={styles.bottomOverlay}>
          <GoOnlineButton
            label={deliveredState.isLoading ? 'Отправляем…' : 'Доставил'}
            disabled={deliveredState.isLoading}
            onPress={handleDeliver}
          />
        </View>
      ) : null}

      {checklistOpen && primaryDelivery ? (
        <ChecklistSheet
          items={primaryDelivery.items}
          loading={pickedUpState.isLoading}
          onConfirm={handleConfirmChecklist}
          onCancel={() => setChecklistOpen(false)}
        />
      ) : null}

      {deliveredToast ? (
        <DeliveredToast visible={!!deliveredToast} displayNumber={deliveredToast.number} />
      ) : null}

      <MapSearchSheet visible={searchOpen} onClose={() => setSearchOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  leftControls: {
    position: 'absolute',
    left: 16,
    top: '32%',
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    top: '32%',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },
});
