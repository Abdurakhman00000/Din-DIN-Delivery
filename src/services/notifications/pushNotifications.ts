// Push-уведомления (FCM). В Expo Go на Android (SDK 53+) remote push
// недоступен — модуль нельзя импортировать на верхнем уровне, иначе
// приложение падает при старте. Используем lazy-import + пропуск в Expo Go.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let handlerConfigured = false;

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (isExpoGo()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = (async () => {
      try {
        const Notifications = await import('expo-notifications');

        if (!handlerConfigured) {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowBanner: true,
              shouldShowList: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
          });
          handlerConfigured = true;
        }

        return Notifications;
      } catch {
        return null;
      }
    })();
  }

  return notificationsModulePromise;
}

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/** Просит разрешение и возвращает нативный push-токен платформы, или null. */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return null;
  }

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

/** Запрашивает разрешение, получает токен и регистрирует устройство на бэке. */
export async function setupPushNotifications(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    return;
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  try {
    const [{ store }, { devicesApi }] = await Promise.all([
      import('@/store/store'),
      import('@/features/devices/api/devicesApi'),
    ]);

    await store
      .dispatch(
        devicesApi.endpoints.registerDevice.initiate({
          push_token: token,
          platform,
          app_version: getAppVersion(),
        }),
      )
      .unwrap();
  } catch {
    // best-effort
  }
}

/** Подписка на тап по уведомлению — безопасна в Expo Go (no-op). */
export function subscribeToNotificationTaps(onOrderSignal: () => void): () => void {
  let removeListener: (() => void) | null = null;
  let cancelled = false;

  void (async () => {
    const Notifications = await loadNotificationsModule();
    if (!Notifications || cancelled) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'delivery.assigned' || type === 'bundle.assigned') {
        onOrderSignal();
      }
    });

    if (cancelled) {
      subscription.remove();
      return;
    }

    removeListener = () => subscription.remove();
  })();

  return () => {
    cancelled = true;
    removeListener?.();
  };
}

export { useRegisterDeviceMutation } from '@/features/devices/api/devicesApi';
