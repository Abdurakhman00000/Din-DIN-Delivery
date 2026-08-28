// Локальное хранилище через expo-secure-store (без native MMKV/NitroModules)
import { deleteSecureItem, getSecureItem, saveSecureItem } from './secureStorage';

export async function getStorageString(key: string): Promise<string | null> {
  return getSecureItem(key);
}

export async function setStorageString(key: string, value: string): Promise<void> {
  await saveSecureItem(key, value);
}

export async function getStorageBoolean(key: string): Promise<boolean> {
  const value = await getSecureItem(key);
  return value === '1';
}

export async function setStorageBoolean(key: string, value: boolean): Promise<void> {
  if (value) {
    await saveSecureItem(key, '1');
  } else {
    await deleteSecureItem(key);
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  await deleteSecureItem(key);
}
