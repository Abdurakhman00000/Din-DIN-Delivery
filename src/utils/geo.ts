// Прямое расстояние по прямой (формула гаверсинуса) — используется вместо
// реального маршрута, пока не подключён 2ГИС (у него нет официальной
// поддержки React Native, см. обсуждение с командой). Это честное
// приближение "по прямой", не настоящая дистанция по дорогам — не
// выдавать за реальный маршрут, только как грубый ориентир "далеко/близко".

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

  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
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
