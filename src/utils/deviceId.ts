// Стабильный идентификатор устройства для auth/device_id
import { getStorageString, setStorageString } from '@/utils/storage';

const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId(): Promise<string> {
  const existing = await getStorageString(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const id = `dindin-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await setStorageString(DEVICE_ID_KEY, id);
  return id;
}
