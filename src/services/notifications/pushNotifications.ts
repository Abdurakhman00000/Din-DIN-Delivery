// Push-уведомления (FCM). В Expo Go на Android (SDK 53+) remote push
// недоступен — модуль нельзя импортировать на верхнем уровне, иначе
// приложение падает при старте. Используем lazy-import + пропуск в Expo Go.
//
// Native build + google-services.json обязательны для FCM-токена на Android.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { getAppPlatform, getAppVersion } from '@/utils/appVersion';

import { addInboxNotification, extractInboxFields } from './notificationHistory';

type NotificationsModule = typeof import('expo-notifications');

/** Канал Android — должен совпадать с defaultChannel в app.json и с
 * channel_id на бэке, если FCM шлёт android.notification.channel_id. */
export const ORDER_NOTIFICATION_CHANNEL = 'orders';

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let handlerConfigured = false;

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

function isOrderNotification(data: Record<string, unknown> | undefined): boolean {
  const type = data?.type;
  return type === 'delivery.assigned' || type === 'bundle.assigned';
}

async function rememberNotification(notification: {
  request: {
    identifier: string;
    content: {
      title?: string | null;
      body?: string | null;
      data?: Record<string, unknown>;
    };
  };
  date?: number;
}): Promise<void> {
  try {
    await addInboxNotification(extractInboxFields(notification));
  } catch {
    // История — best-effort, не должна ломать realtime-флоу.
  }
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
              shouldPlaySound: true,
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

/** Android 13+ требует канал до запроса push-токена (см. Expo docs). */
export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.setNotificationChannelAsync(ORDER_NOTIFICATION_CHANNEL, {
    name: 'Заказы',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#16A34A',
    sound: 'default',
  });
}

/** Просит разрешение и возвращает нативный FCM push-токен, или null. */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return null;
  }

  await ensureAndroidNotificationChannel();

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

/** Запрашивает разрешение, получает FCM-токен и регистрирует устройство на
 * бэке — вызывать сразу после успешного входа и при восстановлении сессии. */
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
    // Регистрация устройства — best-effort.
  }

  void syncPresentedNotificationsToInbox();
}

/** Подтянуть в inbox то, что ещё висит в системном трее. */
export async function syncPresentedNotificationsToInbox(): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const notification of presented) {
      await rememberNotification(notification);
    }
  } catch {
    // ignore
  }
}

/** Слушатели push: foreground receive + tap + холодный старт по тапу. */
export function setupPushNotificationListeners(onOrderSignal: () => void): () => void {
  let cancelled = false;
  const cleanups: Array<() => void> = [];

  void (async () => {
    const Notifications = await loadNotificationsModule();
    if (!Notifications || cancelled) {
      return;
    }

    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      void rememberNotification(notification);
      if (isOrderNotification(notification.request.content.data as Record<string, unknown>)) {
        onOrderSignal();
      }
    });
    cleanups.push(() => receivedSub.remove());

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      void rememberNotification(response.notification);
      if (
        isOrderNotification(response.notification.request.content.data as Record<string, unknown>)
      ) {
        onOrderSignal();
      }
    });
    cleanups.push(() => responseSub.remove());
  })();

  return () => {
    cancelled = true;
    cleanups.forEach((cleanup) => cleanup());
  };
}

/** Если приложение открыли тапом по push после kill — обработать один раз. */
export async function handleColdStartNotification(onOrderSignal: () => void): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  const last = await Notifications.getLastNotificationResponseAsync();
  if (!last) {
    return;
  }

  await rememberNotification(last.notification);

  if (isOrderNotification(last.notification.request.content.data as Record<string, unknown>)) {
    onOrderSignal();
  }
}

/** @deprecated Используйте setupPushNotificationListeners — слушает только tap. */
export function subscribeToNotificationTaps(onOrderSignal: () => void): () => void {
  return setupPushNotificationListeners(onOrderSignal);
}

export { useRegisterDeviceMutation } from '@/features/devices/api/devicesApi';
