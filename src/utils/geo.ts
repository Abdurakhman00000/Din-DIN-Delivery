// Прямое расстояние по прямой (формула гаверсинуса) — с 02.09.2026 это
// только запасной вариант: пока настоящий маршрут от 2ГИС Routing API
// ещё не пришёл (первые секунды после смены точки) или запрос не удался
// (сеть) — см. CourierMapView.tsx/showRoute и MapScreen.tsx/routeInfo.
// Как только реальные distance/duration приходят от 2ГИС — используются
// они, это приближение "по прямой" их не заменяет и не переопределяет.

type Coordinate = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Расстояние по прямой между двумя точками, в километрах. */
export function straightLineDistanceKm(from: Coordinate, to: Coordinate): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/** "1.2 км" / "850 м" — для отображения в карточке заказа. */
export function formatDistanceKm(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} м`;
  }
  return `${km.toFixed(1)} км`;
}

/** "12 мин" / "1 ч 5 мин" — время в пути от 2ГИС Routing API (в секундах). */
export function formatDurationMin(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} мин`;
  }
  return `${hours} ч ${minutes} мин`;
}
