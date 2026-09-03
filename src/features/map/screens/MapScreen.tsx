import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useMarkDeliveredMutation,
  useMarkPickedUpMutation,
  useReportProblemMutation,
} from '@/features/deliveries/api/deliveriesApi';
import type { ActiveDelivery, ChecklistItemIn, ProblemType } from '@/features/deliveries/types';
import { useCourierSession } from '@/features/shifts';
import { useGlobalOverlayOpen } from '@/hooks/useGlobalOverlayOpen';
import { setActiveDeliveryForTracking } from '@/services/location/locationTracker';

import { ActiveTripCard } from '../components/ActiveTripCard';
import { ChecklistSheet } from '../components/ChecklistSheet';
import {
  CourierMapView,
  type CourierMapViewRef,
  type RouteInfo,
} from '../components/CourierMapView';
import { CourierMarker } from '../components/CourierMarker';
import { GoOnlineButton } from '../components/GoOnlineButton';
import { MapHeader } from '../components/MapHeader';
import { MapSearchSheet } from '../components/MapSearchSheet';
import { MapLeftControls, MapRightControls } from '../components/MapSideControls';
import { OnlineToast } from '../components/OnlineToast';
import { OrderSwitcher } from '../components/OrderSwitcher';
import { ProblemSheet } from '../components/ProblemSheet';
import { ToastBanner } from '../components/ToastBanner';
import { useCourierPosition } from '../hooks/useCourierPosition';

export function MapScreen() {
  const mapRef = useRef<CourierMapViewRef>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const session = useCourierSession();
  const { state } = session;
  const globalOverlayOpen = useGlobalOverlayOpen();
  const mapInteractionEnabled = !globalOverlayOpen && !searchOpen && !checklistOpen && !problemOpen;

  // До двух активных доставок разом (bundle — см. useCourierSession).
  // "Фокус" — какую из них сейчас показываем/ведём — локальный выбор
  // экрана, не часть машины состояний сессии: сессия знает только
  // "какие заказы вообще активны сейчас", а какую карточку смотрит
  // курьер в моменте — решает сам этот экран.
  const phaseDeliveries: ActiveDelivery[] =
    state === 'to_pickup'
      ? session.pickupDeliveries
      : state === 'to_customer'
        ? session.customerDeliveries
        : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = phaseDeliveries.find((d) => d.id === selectedId) ?? phaseDeliveries[0] ?? null;

  const [markPickedUp, pickedUpState] = useMarkPickedUpMutation();
  const [markDelivered, deliveredState] = useMarkDeliveredMutation();
  const [reportProblem, problemState] = useReportProblemMutation();

  const courierPosition = useCourierPosition(state === 'to_pickup' || state === 'to_customer');

  // Реальные distance/duration от 2ГИС Routing API для текущего показанного
  // маршрута — обновляется через onRouteInfo у CourierMapView (сообщение из
  // WebView). null — либо ещё грузится, либо запрос не удался; в обоих
  // случаях ActiveTripCard откатывается на честное приближение "по прямой"
  // (см. utils/geo.ts), не показывает пусто и не врёт устаревшим числом.
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  // Только что вышел на линию — короткий тост "ожидайте заказов".
  // Показываем ровно там, где произошло событие (успешный вызов
  // goOnline в handleGoOnline ниже) — не из эффекта, реагирующего на
  // производное состояние сессии.
  const [justWentOnline, setJustWentOnline] = useState(false);

  // Какая из активных доставок помечает пачки геопинга (см.
  // locationTracker.ts) — та, что сейчас в фокусе экрана. Просто
  // best-effort метка для аудита/карты, не платёжный лог — не страшно,
  // если на секунду отстаёт от реального переключения.
  useEffect(() => {
    setActiveDeliveryForTracking(selected?.id ?? null);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || !courierPosition) {
      mapRef.current?.clearRoute();
      return;
    }

    if (state === 'to_pickup') {
      const destination =
        selected.pickup_point_latitude != null && selected.pickup_point_longitude != null
          ? {
              latitude: selected.pickup_point_latitude,
              longitude: selected.pickup_point_longitude,
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
        { latitude: selected.customer_latitude, longitude: selected.customer_longitude },
        'B',
      );
      return;
    }

    mapRef.current?.clearRoute();
  }, [state, selected, courierPosition]);

  async function handleConfirmChecklist(checked: Record<string, boolean>) {
    if (!selected) {
      return;
    }
    const checklist: ChecklistItemIn[] = selected.items.map((item) => ({
      item_id: item.id,
      is_checked: !!checked[item.id],
    }));
    try {
      await markPickedUp({ deliveryId: selected.id, checklist }).unwrap();
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

  async function handleGoOffline() {
    try {
      await session.goOffline();
    } catch {
      // 409, если заказ назначили за секунду до тапа (см. goOffline в
      // useCourierSession) — просто остаёмся на смене, GET /active сам
      // покажет новый заказ через страховочный поллинг/WS.
    }
  }

  async function handleIdlePress() {
    if (state === 'waiting') {
      await handleGoOffline();
    } else {
      await handleGoOnline();
    }
  }

  function showToast(message: string) {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDeliver() {
    if (!selected) {
      return;
    }
    const number = selected.display_number;
    try {
      await markDelivered({ deliveryId: selected.id }).unwrap();
      showToast(`Заказ №${number} доставлен ✓`);
    } catch {
      // См. комментарий в handleConfirmChecklist — ошибка видна через
      // deliveredState.error, кнопка просто останется активной.
    }
  }

  async function handleReportProblem(type: ProblemType, comment: string) {
    if (!selected) {
      return;
    }
    try {
      await reportProblem({
        deliveryId: selected.id,
        type,
        comment: comment || undefined,
      }).unwrap();
      setProblemOpen(false);
      // leave_at_reception не закрывает заказ (см. ProblemSheet) — курьер
      // продолжает как обычно и сам жмёт "Доставил"; остальные типы
      // заказ закрывают, он пропадёт из GET /active.
      showToast(
        type === 'leave_at_reception'
          ? 'Отмечено — доставьте как обычно'
          : 'Сообщено, заказ передан диспетчеру',
      );
    } catch {
      // Ошибка видна через problemState.error, шторка не закрывается —
      // курьер может поправить и повторить.
    }
  }

  function openChecklist() {
    setProblemOpen(false);
    setChecklistOpen(true);
  }

  function openProblem() {
    setChecklistOpen(false);
    setProblemOpen(true);
  }

  const showIdleControls = state === 'offline' || state === 'waiting';
  const showSwitcher = phaseDeliveries.length > 1;
  const idleLabel = state === 'waiting' ? 'Закончить смену' : 'На линию';
  const idleDisabled = session.isStartingShift || session.isEndingShift;

  return (
    <View style={styles.container}>
      <CourierMapView
        ref={mapRef}
        interactionEnabled={mapInteractionEnabled}
        vehicle={session.courier?.vehicle ?? 'foot'}
        onRouteInfo={setRouteInfo}
      />
      {state === 'to_pickup' || state === 'to_customer' ? null : <CourierMarker />}

      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        {selected && (state === 'to_pickup' || state === 'to_customer') ? (
          <View style={styles.tripStack}>
            {showSwitcher ? (
              <OrderSwitcher
                items={phaseDeliveries}
                selectedId={selected.id}
                onSelect={setSelectedId}
              />
            ) : null}
            <ActiveTripCard
              delivery={selected}
              phase={state}
              courierPosition={courierPosition}
              routeInfo={routeInfo}
              onProblemPress={openProblem}
            />
          </View>
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
            <GoOnlineButton label={idleLabel} disabled={idleDisabled} onPress={handleIdlePress} />
          </View>
        </>
      ) : null}

      {state === 'to_pickup' && selected ? (
        <View style={styles.bottomOverlay}>
          <GoOnlineButton label="Забрал" onPress={openChecklist} />
        </View>
      ) : null}

      {state === 'to_customer' && selected ? (
        <View style={styles.bottomOverlay}>
          <GoOnlineButton
            label={deliveredState.isLoading ? 'Отправляем…' : 'Доставил'}
            disabled={deliveredState.isLoading}
            onPress={handleDeliver}
          />
        </View>
      ) : null}

      {checklistOpen && selected ? (
        <ChecklistSheet
          items={selected.items}
          displayNumber={selected.display_number}
          loading={pickedUpState.isLoading}
          onConfirm={handleConfirmChecklist}
          onCancel={() => setChecklistOpen(false)}
        />
      ) : null}

      {problemOpen && selected ? (
        <ProblemSheet
          displayNumber={selected.display_number}
          loading={problemState.isLoading}
          onConfirm={handleReportProblem}
          onCancel={() => setProblemOpen(false)}
        />
      ) : null}

      {toast ? <ToastBanner visible={!!toast} message={toast.message} /> : null}

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
  tripStack: {
    gap: 8,
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
