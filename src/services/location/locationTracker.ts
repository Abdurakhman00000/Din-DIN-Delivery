// Геопинги пачкой — архитектурный документ backend'а, §10

import * as Location from 'expo-location';

import type { LocationPing } from '@/features/locations/types';

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
}
