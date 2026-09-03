import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useMarkDeliveredMutation,
  useMarkPickedUpMutation,
  useReportProblemMutation,
} from '@/features/deliveries/api/deliveriesApi';
import type { ActiveDelivery, ChecklistItemIn, ProblemType } from '@/features/deliveries/types';
import { useCourierSession } from '@/features/shifts';
import { useGlobalOverlayOpen } from '@/hooks/useGlobalOverlayOpen';
import { setActiveDeliveryForTracking } from '@/services/location/locationTracker';
import { DARK, SPACING } from '@/constants/theme';
import { extractApiErrorMessage } from '@/utils/apiError';

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
import { MapRightControls } from '../components/MapSideControls';
import { OnlineToast } from '../components/OnlineToast';
import { OrderSwitcher } from '../components/OrderSwitcher';
import { ProblemSheet } from '../components/ProblemSheet';
import { ToastBanner } from '../components/ToastBanner';
import { useCourierPosition } from '../hooks/useCourierPosition';

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<CourierMapViewRef>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [problemOpen, setProblemOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  const session = useCourierSession();
  const { state } = session;
  const globalOverlayOpen = useGlobalOverlayOpen();
  const mapInteractionEnabled = !globalOverlayOpen && !checklistOpen && !problemOpen;

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

  // Раньше следили только во время активной доставки (для дистанции на
  // карточке) — теперь всегда: нужна и для авто-слежения карты за собой
  // в режиме ожидания (см. эффект ниже), и для кнопки "моя локация".
  // Дёшево: сам хук ничего не делает без выданного разрешения.
  const courierPosition = useCourierPosition(true);

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

  // Авто-слежение карты за живой позицией курьера в режиме ожидания —
  // ровно то поведение, которое CourierMarker и задумывался изображать
  // ("карта двигается под ним, не наоборот", см. его же docstring): без
  // этого эффекта фиксированная в центре экрана точка "я здесь" ничем не
  // привязана к реальным координатам и просто висит там же, где карта
  // случайно оказалась (дефолтный центр Бишкека или последний ручной
  // разворот). Во время активной доставки не трогаем — там курьера ведёт
  // showRoute выше через свой собственный маркер внутри карты.
  useEffect(() => {
    if ((state === 'offline' || state === 'waiting') && courierPosition) {
      mapRef.current?.centerOn(courierPosition);
    }
  }, [state, courierPosition]);

  function showToast(message: string, tone: 'success' | 'error' = 'success') {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3000);
  }

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
      // уже не в том статусе) теперь реально показывается в самой
      // шторке — см. ChecklistSheet's error prop ниже. Шторка не
      // закрывается, курьер видит форму и может поправить/повторить.
    }
  }

  async function handleGoOnline() {
    try {
      await session.goOnline();
      setJustWentOnline(true);
      setTimeout(() => setJustWentOnline(false), 3000);
    } catch (err) {
      // Раньше здесь молчали при любой ошибке, включая 403 (аккаунт
      // заблокирован админом) — курьер жал "На линию", ничего не
      // происходило, и было совершенно непонятно почему.
      showToast(
        extractApiErrorMessage(err, 'Не удалось выйти на линию. Попробуйте ещё раз'),
        'error',
      );
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

  async function handleDeliver() {
    if (!selected) {
      return;
    }
    const number = selected.display_number;
    try {
      await markDelivered({ deliveryId: selected.id }).unwrap();
      showToast(`Заказ №${number} доставлен ✓`);
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Не удалось отметить доставку'), 'error');
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
      // Ошибка теперь реально видна в самой шторке — см. ProblemSheet's
      // error prop ниже. Шторка не закрывается — курьер может поправить
      // и повторить.
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
  const showBottomAction = showIdleControls || state === 'to_pickup' || state === 'to_customer';
  const showSwitcher = phaseDeliveries.length > 1;
  const idleLabel = state === 'waiting' ? 'Закончить смену' : 'На линию';
  const idleDisabled = session.isStartingShift || session.isEndingShift;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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

      {/* Зум/локация — всегда доступны, не только в режиме ожидания:
          раньше пропадали ровно тогда, когда нужнее всего (в процессе
          доставки), теперь низ-право во всех состояниях, единообразно
          над нижней кнопкой (в духе Google Maps/Uber/Yandex, не
          подвешены посередине бокового края экрана, как было). */}
      <View style={[styles.rightControls, { bottom: insets.bottom + 96 }]}>
        <MapRightControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocatePress={() => {
            // Раньше здесь всегда был захардкоженный центр Бишкека вместо
            // настоящих координат курьера — основная жалоба "стоит не
            // там, где я". Реальная позиция есть — идём на неё; нет (ещё
            // не пришла с GPS/нет разрешения) — тот же безопасный дефолт,
            // что и раньше, а не пустое место.
            if (courierPosition) {
              mapRef.current?.centerOn(courierPosition);
            } else {
              mapRef.current?.centerOnBishkek();
            }
          }}
        />
      </View>

      {showBottomAction ? (
        <View style={[styles.bottomOverlay, { bottom: insets.bottom + SPACING.md }]}>
          {showIdleControls ? (
            <GoOnlineButton label={idleLabel} disabled={idleDisabled} onPress={handleIdlePress} />
          ) : state === 'to_pickup' ? (
            <GoOnlineButton label="Забрал" onPress={openChecklist} />
          ) : (
            <GoOnlineButton
              label={deliveredState.isLoading ? 'Отправляем…' : 'Доставил'}
              disabled={deliveredState.isLoading}
              onPress={handleDeliver}
            />
          )}
        </View>
      ) : null}

      {checklistOpen && selected ? (
        <ChecklistSheet
          items={selected.items}
          displayNumber={selected.display_number}
          loading={pickedUpState.isLoading}
          error={
            pickedUpState.isError
              ? extractApiErrorMessage(pickedUpState.error, 'Не удалось отметить получение')
              : null
          }
          onConfirm={handleConfirmChecklist}
          onCancel={() => setChecklistOpen(false)}
        />
      ) : null}

      {problemOpen && selected ? (
        <ProblemSheet
          displayNumber={selected.display_number}
          loading={problemState.isLoading}
          error={
            problemState.isError
              ? extractApiErrorMessage(problemState.error, 'Не удалось отправить')
              : null
          }
          onConfirm={handleReportProblem}
          onCancel={() => setProblemOpen(false)}
        />
      ) : null}

      {toast ? <ToastBanner visible={!!toast} message={toast.message} tone={toast.tone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    zIndex: 10,
  },
  tripStack: {
    gap: SPACING.sm,
  },
  rightControls: {
    position: 'absolute',
    right: SPACING.lg,
    zIndex: 5,
  },
  bottomOverlay: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
  },
});
