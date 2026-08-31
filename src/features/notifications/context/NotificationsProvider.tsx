import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { NotificationsSheet } from '@/features/notifications/components/NotificationsSheet';
import type { InboxNotification } from '@/features/notifications/types';
import {
  getUnreadCount,
  markAllNotificationsRead,
  subscribeNotificationHistory,
} from '@/services/notifications/notificationHistory';
import { syncPresentedNotificationsToInbox } from '@/services/notifications/pushNotifications';

type NotificationsContextValue = {
  openNotifications: () => void;
  closeNotifications: () => void;
  unreadCount: number;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<InboxNotification[]>([]);

  useEffect(() => {
    return subscribeNotificationHistory(setItems);
  }, []);

  const openNotifications = useCallback(() => {
    setVisible(true);
    void (async () => {
      await syncPresentedNotificationsToInbox();
      await markAllNotificationsRead();
    })();
  }, []);

  const closeNotifications = useCallback(() => {
    setVisible(false);
  }, []);

  const value = useMemo(
    () => ({
      openNotifications,
      closeNotifications,
      unreadCount: getUnreadCount(items),
    }),
    [openNotifications, closeNotifications, items],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <View style={styles.overlay} pointerEvents="box-none">
        <NotificationsSheet visible={visible} items={items} onClose={closeNotifications} />
      </View>
    </NotificationsContext.Provider>
  );
}

export function useNotificationsUi() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotificationsUi must be used within NotificationsProvider');
  }
  return ctx;
}

/** Безопасно для хедеров вне провайдера — no-op. */
export function useOptionalNotificationsUi(): NotificationsContextValue | null {
  return useContext(NotificationsContext);
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
});
