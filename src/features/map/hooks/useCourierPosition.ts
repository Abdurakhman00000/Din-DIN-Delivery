// Текущая позиция курьера — только для отображения (расстояние до
// точки/клиента на карточке, см. ActiveTripCard). Специально не
// переиспользует services/location/locationTracker.ts: тот — про то,
// что реально уходит на сервер пачками (§10 backend'а), это — про то,
// что здесь и сейчас показать на экране. Разная частота, разная цель,
// нет смысла их связывать.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { MapCoordinate } from '../types';

const REFRESH_INTERVAL_MS = 15_000;

export function useCourierPosition(enabled: boolean): MapCoordinate | null {
  const [position, setPosition] = useState<MapCoordinate | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function readPosition() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) {
        return;
      }
      try {
        const result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setPosition({
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
          });
        }
      } catch {
        // Позиция не критична для показа заказа — просто не покажем
        // расстояние в этот раз, попробуем на следующем тике.
      }
    }

    readPosition();
    const interval = setInterval(readPosition, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [enabled]);

  return position;
}
