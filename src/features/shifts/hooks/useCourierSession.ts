// Машина состояний "курьер на смене" — заменяет старый useCourierShift
// (таймеры, фейковый заказ). Реализует итоговую схему из обсуждения
// с бэкендом: при каждом запуске/возврате в приложение сверяемся с
// сервером заново (GET /me + GET /active), не доверяем локальной
// памяти; пока на переднем плане — WS с реконнектом + лёгкий поллинг
// как страховка; в фоне полагаемся на push (см. services/notifications).
//
// Ровно 4 состояния, без "входящий заказ, реши сам" — заказ уже
// назначен, курьеру нечего принимать/отклонять:
//   offline    — не на смене
//   waiting    — на смене, GET /active пусто
//   to_pickup  — есть хоть одна доставка в статусе en_route_to_pickup
//   to_customer — все доставки уже забраны, хоть одна en_route_to_customer
//
// До двух доставок одновременно (bundle, max_active_deliveries — см.
// флоу-документ бэка). Пока хоть одна из них ещё не забрана с точки —
// вся сессия остаётся в фазе to_pickup: бэк не требует забирать бандл
// разом (`/picked-up` дергается отдельно на каждый id), но по смыслу
// курьер должен забрать оба заказа с одной точки за один заход, а не
// уехать с одним, забыв второй — это решает интерфейс, не бэк.

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useGetActiveDeliveriesQuery } from '@/features/deliveries/api/deliveriesApi';
import type { ActiveDelivery, ChecklistItemIn, ProblemType } from '@/features/deliveries/types';
import { useGetCourierMeQuery } from '@/features/profile/api/profileApi';
import { useEndShiftMutation, useStartShiftMutation } from '@/features/shifts/api/shiftsApi';
import { getAccessToken } from '@/services/api/tokens';
import { startLocationTracking, stopLocationTracking } from '@/services/location/locationTracker';
import { subscribeToNotificationTaps } from '@/services/notifications/pushNotifications';
import { CourierSocket } from '@/services/ws/courierSocket';

export type CourierSessionState = 'offline' | 'waiting' | 'to_pickup' | 'to_customer';

const POLL_INTERVAL_MS = 20_000; // страховка на случай пропущенного WS/push-сигнала

function computeState(isOnline: boolean, deliveries: ActiveDelivery[]): CourierSessionState {
  if (!isOnline) {
    return 'offline';
  }
  if (deliveries.length === 0) {
    return 'waiting';
  }
  // Хоть одна ещё не забрана с точки — вся сессия в фазе "еду за
  // заказом", даже если вторая из бандла уже en_route_to_customer.
  if (deliveries.some((d) => d.status === 'en_route_to_pickup')) {
    return 'to_pickup';
  }
  if (deliveries.some((d) => d.status === 'en_route_to_customer')) {
    return 'to_customer';
  }
  // GET /active по контракту бэка не возвращает финальные статусы
  // (delivered/problem) — если всё же увидели такой набор, безопаснее
  // считать "ждём", чем показать неверный экран действия.
  return 'waiting';
}

function byBundlePosition(a: ActiveDelivery, b: ActiveDelivery): number {
  return (a.bundle_position ?? 0) - (b.bundle_position ?? 0);
}

export function useCourierSession() {
  const { data: me } = useGetCourierMeQuery();
  const isOnline = me?.status === 'online';

  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const onChange = (next: AppStateStatus) => setIsForeground(next === 'active');
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  const activeQuery = useGetActiveDeliveriesQuery(undefined, {
    skip: !isOnline,
    // RTK Query сам перестаёт опрашивать, когда интервал 0 — используем
    // это для "поллинг только пока на переднем плане" без ручного таймера.
    pollingInterval: isOnline && isForeground ? POLL_INTERVAL_MS : 0,
  });

  const deliveries = activeQuery.data ?? [];
  const sessionState = computeState(isOnline, deliveries);

  const pickupDeliveries = deliveries
    .filter((d) => d.status === 'en_route_to_pickup')
    .sort(byBundlePosition);
  const customerDeliveries = deliveries
    .filter((d) => d.status === 'en_route_to_customer')
    .sort(byBundlePosition);

  // WS — только сигнал "перепроверь", решение о переподключении не
  // хранит собственное состояние компонента, только connect/disconnect.
  const socketRef = useRef<CourierSocket | null>(null);
  if (socketRef.current === null) {
    socketRef.current = new CourierSocket(getAccessToken, {
      onEvent: () => {
        activeQuery.refetch();
      },
    });
  }
  useEffect(() => {
    if (isOnline && isForeground) {
      socketRef.current?.connect();
    } else {
      socketRef.current?.disconnect();
    }
  }, [isOnline, isForeground]);
  useEffect(() => {
    return () => socketRef.current?.disconnect();
  }, []);

  // Push-тап — та же реакция, что и WS-событие: просто перепроверить.
  useEffect(() => {
    return subscribeToNotificationTaps(() => {
      activeQuery.refetch();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Геотрекинг — привязан к online, не к переднему плану (см.
  // locationTracker.ts о том, почему фон — отдельная, не сделанная пока
  // задача).
  useEffect(() => {
    if (isOnline) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isOnline]);
  // Какая именно из (возможно двух) активных доставок помечает пачки
  // геопинга — решает экран (какая карточка сейчас в фокусе), не этот
  // хук: см. MapScreen.tsx, setActiveDeliveryForTracking там же.

  const [startShiftMutation, startShiftState] = useStartShiftMutation();
  const [endShiftMutation, endShiftState] = useEndShiftMutation();

  const goOnline = useCallback(async () => {
    await startShiftMutation().unwrap();
  }, [startShiftMutation]);

  const goOffline = useCallback(async () => {
    // 409, если есть активные доставки — тот же случай, что и на бэке:
    // кнопка "Закончить смену" не должна быть доступна, пока
    // deliveries.length > 0, но mutation всё равно может прилететь с
    // ошибкой при гонке (например, заказ назначили за секунду до тапа) —
    // даём это увидеть вызывающему коду, не проглатываем молча.
    await endShiftMutation().unwrap();
  }, [endShiftMutation]);

  return {
    state: sessionState,
    isLoadingProfile: !me,
    courier: me ?? null,
    deliveries,
    pickupDeliveries,
    customerDeliveries,
    isFetchingActive: activeQuery.isFetching,
    canEndShift: deliveries.length === 0,
    goOnline,
    goOffline,
    isStartingShift: startShiftState.isLoading,
    isEndingShift: endShiftState.isLoading,
    refetchActive: activeQuery.refetch,
  } as const;
}

export type { ActiveDelivery, ChecklistItemIn, ProblemType };
