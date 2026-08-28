// Push-уведомления (FCM). В Expo Go на Android (SDK 53+) remote push
// недоступен — модуль нельзя импортировать на верхнем уровне, иначе
// приложение падает при старте. Используем lazy-import + пропуск в Expo Go.

import Constants from 'expo-constants';
import * as Device from 'expo-device';

import { getAppPlatform, getAppVersion } from '@/utils/appVersion';

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

/** Просит разрешение и возвращает нативный push-токен платформы, или
 * null — если разрешение не дали, устройство не поддерживает push
 * (симулятор/эмулятор/Expo Go), или Firebase ещё не настроен в проекте
 * (google-services.json/GoogleService-Info.plist). Ни один из этих
 * случаев не должен ронять остальной вход в приложение — курьер просто
 * не будет получать push, WS в моменты работы с приложением
 * по-прежнему работает. */
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

/** Запрашивает разрешение, получает токен и регистрирует устройство на
 * бэке — вызывать сразу после успешного входа (см. authApi.ts) и на
 * восстановлении сессии (см. useAuthBootstrap.ts). Тихо ничего не
 * делает при любой неудаче — push не блокирует вход. */
export async function setupPushNotifications(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    return;
  }

  const platform = getAppPlatform();

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
    // Регистрация устройства — best-effort (см. register_device на бэке).
  }
}

/** Подписка на тап по уведомлению — безопасна в Expo Go (no-op).
 * onOrderSignal вызывается без данных заказа — обработчик должен
 * просто перепроверить GET /active, как и по WS-событию. */
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
