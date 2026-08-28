// Push-уведомления (FCM) — единственный надёжный канал, когда
// приложение свёрнуто (WS живёт только на переднем плане, см.
// courierSocket.ts). См. флоу-документ backend'а, раздел "Push (FCM)":
// придёт одновременно с WS-событием, с тем же типом события в data —
// используем для роутинга тапа, не для самих данных заказа (в самом
// уведомлении только заголовок, полные данные всегда через GET /active).
//
// ВАЖНО — внешняя зависимость, не решается одним кодом: бэкенд ждёт
// настоящий FCM-токен ("не Expo Push Token, не Firebase Installation ID
// — именно токен, полученный через FCM SDK", см. DeviceRegisterIn в
// Swagger), поэтому здесь используется getDevicePushTokenAsync
// (нативный токен платформы), а не более простой getExpoPushTokenAsync.
// Но сам нативный токен на Android в принципе не появится без
// google-services.json (регистрация Android-приложения в том же
// Firebase-проекте, что уже настроен на бэке) — файла с реальными
// учётными данными Firebase-проекта, которого в этом репозитории нет и
// быть не должно (секрет). На iOS понадобится свой push-сертификат/ключ
// в том же Firebase-проекте. До того, как эти файлы добавят в проект
// (Belek/бэкенд-команда, у них уже есть Firebase-проект) —
// registerForPushNotificationsAsync() не упадёт, но вернёт null,
// и push просто не будет доходить — то же самое поведение, что и
// LoggingPushSender на бэке до того, как туда завели Firebase.

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { devicesApi, useRegisterDeviceMutation } from '@/features/devices/api/devicesApi';
import { store } from '@/store/store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

/** Просит разрешение и возвращает нативный push-токен платформы, или
 * null — если разрешение не дали, устройство не поддерживает push
 * (симулятор/эмулятор), или Firebase ещё не настроен в проекте (см.
 * комментарий выше файла). Ни один из этих случаев не должен ронять
 * остальной вход в приложение — курьер просто не будет получать push,
 * WS в моменты работы с приложением по-прежнему работает.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
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
    // Не настроен Firebase на этой платформе — см. комментарий выше файла.
    return null;
  }
}

/** Запрашивает разрешение, получает токен и регистрирует устройство на
 * бэке — вызывать сразу после успешного входа (см. флоу-документ).
 * Тихо ничего не делает при любой неудаче — push не блокирует вход. */
export async function setupPushNotifications(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    return;
  }

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  try {
    // Прямой вызов через store, не хук — этот сервис не React-компонент,
    // тот же приём, что и locationTracker.ts.
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
    // Регистрация устройства — best-effort, как и на бэке (см.
    // register_device: не критична для остального входа).
  }
}

/** Подписка на тап по уведомлению — вызывать один раз, например в
 * корневом layout. Возвращает функцию отписки. onOrderSignal вызывается
 * без данных заказа (см. заголовок файла) — обработчик должен просто
 * перепроверить GET /active, как и по WS-событию. */
export function subscribeToNotificationTaps(onOrderSignal: () => void): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const type = response.notification.request.content.data?.type;
    if (type === 'delivery.assigned' || type === 'bundle.assigned') {
      onOrderSignal();
    }
  });
  return () => subscription.remove();
}

// Реэкспорт для мест, где удобнее хук, а не прямой dispatch (например,
// экран настроек, где полезно показать состояние мутации).
export { useRegisterDeviceMutation };
