// Геопинги пачкой — архитектурный документ backend'а, §10
//
// 03.09.2026: добавлен фоновый режим — до этого трекинг работал только
// пока приложение на переднем плане (watchPositionAsync — обычный JS-
// колбэк, ОС его не будит из фона). Сам таск и его обработчик — в
// backgroundLocationTask.ts (там же объяснение, почему defineTask не
// может жить здесь). Этот файл только запускает/останавливает оба
// режима разом по одному и тому же триггеру (см. useCourierSession —
// online/offline), фон — best-effort поверх основного: не получилось
// попросить фоновое разрешение или запустить таск — просто продолжаем
// с одним foreground-трекингом, как было раньше, не роняем всё целиком.
import * as Location from 'expo-location';

import type { LocationPing } from '@/features/locations/types';

import { BACKGROUND_LOCATION_TASK } from './backgroundLocationTask';

const FLUSH_INTERVAL_MS = 20_000;
const WATCH_TIME_INTERVAL_MS = 5_000;
const WATCH_DISTANCE_INTERVAL_M = 20;

let watchSubscription: Location.LocationSubscription | null = null;
let flushTimer: ReturnType<typeof setInterval> | null = null;
let buffer: LocationPing[] = [];
let activeDeliveryId: string | null = null;

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
    const [{ store }, { locationsApi }] = await Promise.all([
      import('@/store/store'),
      import('@/features/locations/api/locationsApi'),
    ]);
    await store.dispatch(locationsApi.endpoints.sendLocationBatch.initiate(pings)).unwrap();
  } catch {
    // Один неудачный батч не должен ронять трекинг
  }
}

async function startBackgroundTracking(): Promise<void> {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      // Курьер отказал в "всегда" (оставил только "во время
      // использования") — легитимный выбор, не ошибка. Просто остаёмся
      // на foreground-трекинге, который уже запущен к этому моменту.
      return;
    }
    const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    ).catch(() => false);
    if (alreadyRunning) {
      return;
    }
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: WATCH_TIME_INTERVAL_MS,
      distanceInterval: WATCH_DISTANCE_INTERVAL_M,
      // Android 10+ без foreground-сервиса не даёт вообще ничего слать
      // из фона на постоянной основе — системная плашка обязательна,
      // это ограничение платформы, не наш выбор.
      foregroundService: {
        notificationTitle: 'Teyva — смена активна',
        notificationBody: 'Передаём геопозицию, пока вы на линии',
        notificationColor: '#16A34A',
      },
      showsBackgroundLocationIndicator: true,
    });
  } catch {
    // Тот же best-effort принцип — фон не запустился, foreground всё
    // равно работает.
  }
}

async function stopBackgroundTracking(): Promise<void> {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK,
    ).catch(() => false);
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch {
    // Не страшно — таск просто продолжит числиться зарегистрированным
    // до следующей успешной остановки/переустановки приложения, но
    // слать он будет только пока курьер снова не выйдет на линию.
  }
}

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
            ? position.coords.speed * 3.6
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
  void startBackgroundTracking(); // не блокирует "на линию" ожиданием второго системного диалога
  return true;
}

export async function stopLocationTracking(): Promise<void> {
  watchSubscription?.remove();
  watchSubscription = null;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flush();
  activeDeliveryId = null;
  await stopBackgroundTracking();
}
