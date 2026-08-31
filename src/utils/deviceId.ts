// Стабильный идентификатор устройства для auth/device_id
import { getStorageString, setStorageString } from '@/utils/storage';

const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId(): Promise<string> {
  const existing = await getStorageString(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const id = `teyva-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setStorageString(DEVICE_ID_KEY, id);
  return id;
}

/**
 * Не криптографический UUID — для Idempotency-Key заголовка (см.
 * deliveriesApi.ts) достаточно уникальности на одну попытку запроса,
 * не непредсказуемости. Тот же уровень строгости, что и у getDeviceId
 * выше, не поднимаем его искусственно новой зависимостью (expo-crypto).
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
