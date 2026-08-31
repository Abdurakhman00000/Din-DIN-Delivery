import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { SwipeSheet } from '@/components/ui/SwipeSheet';
import { HistoryContent } from '@/features/history/components/HistoryContent';
import { NotificationsContent } from '@/features/notifications/components/NotificationsContent';
import type { InboxNotification } from '@/features/notifications/types';
import type { SheetId } from '@/features/sheets/types';
import {
  getUnreadCount,
  markAllNotificationsRead,
  subscribeNotificationHistory,
} from '@/services/notifications/notificationHistory';
import { syncPresentedNotificationsToInbox } from '@/services/notifications/pushNotifications';

type SheetsContextValue = {
  activeSheet: SheetId | null;
  isOpen: boolean;
  isHistoryOpen: boolean;
  isNotificationsOpen: boolean;
  unreadCount: number;
  openSheet: (id: SheetId) => void;
  closeSheet: () => void;
  toggleSheet: (id: SheetId) => void;
  openHistory: () => void;
  closeHistory: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
};

const SheetsContext = createContext<SheetsContextValue | null>(null);

const SHEET_META: Record<SheetId, { title: string; heightRatio: number }> = {
  history: { title: 'История', heightRatio: 0.78 },
  notifications: { title: 'Уведомления', heightRatio: 0.62 },
};

/**
 * Один хост на все глобальные шторки:
 * - одновременно открыт максимум один лист
 * - контент монтируется только для активного id
 * - закрытие: свайп / тап вне листа / closeSheet
 */
export function SheetsProvider({ children }: { children: ReactNode }) {
  const [sheetId, setSheetId] = useState<SheetId | null>(null);
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<InboxNotification[]>([]);

  useEffect(() => {
    return subscribeNotificationHistory(setItems);
  }, []);

  const prepareNotifications = useCallback(() => {
    void (async () => {
      await syncPresentedNotificationsToInbox();
      await markAllNotificationsRead();
    })();
  }, []);

  const openSheet = useCallback(
    (id: SheetId) => {
      setSheetId(id);
      setVisible(true);
      if (id === 'notifications') {
        prepareNotifications();
      }
    },
    [prepareNotifications],
  );

  const closeSheet = useCallback(() => {
    setVisible(false);
  }, []);

  const handleClosed = useCallback(() => {
    setSheetId(null);
  }, []);

  const toggleSheet = useCallback(
    (id: SheetId) => {
      if (sheetId === id && visible) {
        closeSheet();
        return;
      }
      openSheet(id);
    },
    [sheetId, visible, closeSheet, openSheet],
  );

  const value = useMemo<SheetsContextValue>(
    () => ({
      activeSheet: visible ? sheetId : null,
      isOpen: visible && sheetId != null,
      isHistoryOpen: visible && sheetId === 'history',
      isNotificationsOpen: visible && sheetId === 'notifications',
      unreadCount: getUnreadCount(items),
      openSheet,
      closeSheet,
      toggleSheet,
      openHistory: () => openSheet('history'),
      closeHistory: closeSheet,
      openNotifications: () => openSheet('notifications'),
      closeNotifications: closeSheet,
    }),
    [sheetId, visible, items, openSheet, closeSheet, toggleSheet],
  );

  const meta = sheetId ? SHEET_META[sheetId] : null;

  return (
    <SheetsContext.Provider value={value}>
      {children}
      {sheetId && meta ? (
        <SwipeSheet
          visible={visible}
          onClose={closeSheet}
          onClosed={handleClosed}
          title={meta.title}
          heightRatio={meta.heightRatio}
          closeOnBackdropPress
        >
          {sheetId === 'history' ? <HistoryContent /> : null}
          {sheetId === 'notifications' ? <NotificationsContent items={items} /> : null}
        </SwipeSheet>
      ) : null}
    </SheetsContext.Provider>
  );
}

export function useSheets(): SheetsContextValue {
  const ctx = useContext(SheetsContext);
  if (!ctx) {
    throw new Error('useSheets must be used within SheetsProvider');
  }
  return ctx;
}

export function useOptionalSheets(): SheetsContextValue | null {
  return useContext(SheetsContext);
}
