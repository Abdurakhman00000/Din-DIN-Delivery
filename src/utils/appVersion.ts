// Версия приложения (app.json -> expo.version) и текущая платформа —
// общие для двух мест, которым нужно то же самое: регистрация
// устройства (services/notifications/pushNotifications.ts) и проверка
// поддерживаемой версии (features/appVersion). Раньше жило только
// внутри pushNotifications.ts — вынесено сюда, чтобы не тянуть модуль
// пушей туда, где он не при чём.
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function getAppPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
