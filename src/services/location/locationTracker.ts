// Геопинги пачкой — архитектурный документ backend'а, §10: "приложение
// копит пинги локально и шлёт пачкой раз в 15-30 с", не по одной точке
// на запрос. Это не про 2ГИС и не зависит от него вообще — просто
// читаем GPS-датчик телефона (expo-location) и складываем координаты
// в локальный буфер, отдельным таймером сбрасываем на сервер.
//
// Работает только пока приложение на переднем плане — как и WS
// (courierSocket.ts), фоновый GPS-трекинг на постоянной основе требует
// отдельной, более тяжёлой настройки (background location task) и
// решения по батарее/приватности, которое пока не принято. Начинать
// с переднего плана — осознанное упрощение первой версии, не забытый
// кусок.

import * as Location from 'expo-location';

import { store } from '@/store/store';

import { locationsApi } from '@/features/locations';
import type { LocationPing } from '@/features/locations';

const FLUSH_INTERVAL_MS = 20_000; // §10: раз в 15-30 секунд
const WATCH_TIME_INTERVAL_MS = 5_000;
const WATCH_DISTANCE_INTERVAL_M = 20;

let watchSubscription: Location.LocationSubscription | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;
let buffer: LocationPing[] = [];
let activeDeliveryId: string | null = null;

/** Заказ, к которому относится текущий пинг — см. LocationPing.delivery_id
 * в описании бэкенда: null, если курьер едет вне заказа (например, к
 * точке между доставками). Обновляется извне (useCourierSession знает
 * текущую активную доставку), не пытается вычислить сам. */
export function setActiveDeliveryForTracking(deliveryId: string | null): void {
  activeDeliveryId = deliveryId;
}

async function flush(): Promise<void> {
  if (buffer.length === 0) {
    return;
  }
  const pings = buffer;
  buffer = [];
  try {
    await store.dispatch(locationsApi.endpoints.sendLocationBatch.initiate(pings)).unwrap();
  } catch {
    // Один неудачный батч не должен ронять трекинг — просто теряем эти
    // конкретные точки и продолжаем копить новые. Больше точности тут
    // не нужно: это трек для карты/аудита, не платёжный лог.
  }
}

/** Начать трекинг — просить разрешение, если ещё не дано. Вызывать
 * когда курьер выходит на смену (online), не раньше. */
export async function startLocationTracking(): Promise<boolean> {
  if (watchSubscription) {
    return true;
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }

  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: WATCH_TIME_INTERVAL_MS,
      distanceInterval: WATCH_DISTANCE_INTERVAL_M,
    },
    (position) => {
      buffer.push({
        recorded_at: new Date(position.timestamp).toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy_m: position.coords.accuracy ?? undefined,
        speed_kmh:
          position.coords.speed != null && position.coords.speed >= 0
            ? position.coords.speed * 3.6 // м/с -> км/ч
            : undefined,
        heading:
          position.coords.heading != null && position.coords.heading >= 0
            ? position.coords.heading
            : undefined,
        delivery_id: activeDeliveryId ?? undefined,
      });
    },
  );

  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
  return true;
}

/** Остановить трекинг — вызывать при завершении смены (offline) или
 * при выходе из приложения. Досылает то, что успело накопиться. */
export async function stopLocationTracking(): Promise<void> {
  watchSubscription?.remove();
  watchSubscription = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flush();
  activeDeliveryId = null;
}
