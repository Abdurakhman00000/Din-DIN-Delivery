// Фоновая геолокация — TaskManager.defineTask ниже должен выполниться в
// глобальной области модуля при КАЖДОМ старте JS-бандла, в том числе
// когда ОС поднимает приложение только под этот таск, без единого
// смонтированного экрана ("must be called in the global scope of your
// JavaScript bundle... cannot be called in any of React lifecycle
// methods" — так и написано в самом expo-task-manager). Поэтому этот
// файл импортируется как side-effect из app/_layout.tsx до всего
// остального — не из locationTracker.ts, чтобы регистрация таска не
// зависела от того, успел ли загрузиться граф модулей карты.
//
// Сам старт/остановка обновлений — в locationTracker.ts
// (startLocationTracking/stopLocationTracking), привязаны к тому же
// online-статусу курьера, что и раньше был у чисто foreground-трекинга.
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { LocationPing } from '@/features/locations/types';
import { getAccessToken, refreshAccessToken } from '@/services/api/tokens';

export const BACKGROUND_LOCATION_TASK = 'courier-background-location';

type BackgroundLocationTaskData = {
  locations: Location.LocationObject[];
};

function toPing(location: Location.LocationObject): LocationPing {
  // Тот же маппинг полей, что у foreground-варианта (locationTracker.ts)
  // — единственное отличие: delivery_id здесь не проставляем. То, какая
  // из (возможно двух) активных доставок сейчас в фокусе — состояние
  // экрана карты (MapScreen.tsx), которое не переживает перезапуск JS
  // под фоновый таск, а персистить его отдельно ради необязательного
  // поля — лишняя сложность против прямой просьбы "делай быстро".
  // Бэку это поле и так опционально ("null, если едет вне заказа").
  return {
    recorded_at: new Date(location.timestamp).toISOString(),
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy_m: location.coords.accuracy ?? undefined,
    speed_kmh:
      location.coords.speed != null && location.coords.speed >= 0
        ? location.coords.speed * 3.6
        : undefined,
    heading:
      location.coords.heading != null && location.coords.heading >= 0
        ? location.coords.heading
        : undefined,
  };
}

/** Голый fetch, не RTK Query — тот же приём, что у refreshAccessToken/
 * logoutSession в services/api/tokens.ts, специально для мест, которые
 * не могут положиться на то, что Redux store в этот момент вообще жив
 * (см. модульный комментарий выше). На 401 — один рефреш и одна
 * повторная попытка, как у baseApi.ts's baseQueryWithReauth; если и это
 * не помогло — пропускаем пачку, не роняем таск (тот же best-effort
 * принцип, что у foreground-варианта в locationTracker.ts). */
async function sendPings(pings: LocationPing[], token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.locations.batch}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pings }),
  });
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return;
    }
    const freshToken = await getAccessToken();
    if (!freshToken) {
      return;
    }
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.locations.batch}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshToken}` },
      body: JSON.stringify({ pings }),
    });
  }
}

TaskManager.defineTask<BackgroundLocationTaskData>(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    if (error) {
      return;
    }
    const locations = data?.locations ?? [];
    if (locations.length === 0) {
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      // Не залогинен, или токен уже стёрт (вышел из аккаунта) — некому
      // отправлять. Трекинг в любом случае должен был остановиться
      // вместе с сессией (stopLocationTracking вызывается при логауте
      // так же, как при "Закончить смену") — если это событие всё равно
      // добралось сюда, просто тихо пропускаем его.
      return;
    }

    try {
      await sendPings(locations.map(toPing), token);
    } catch {
      // Сетевая ошибка одного фонового батча не должна ронять таск —
      // трекинг продолжится на следующем срабатывании.
    }
  },
);
