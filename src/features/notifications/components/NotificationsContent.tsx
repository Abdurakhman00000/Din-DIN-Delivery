import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { COLORS } from '@/constants/theme';
import type { InboxNotification } from '@/features/notifications/types';

type NotificationsContentProps = {
  items: InboxNotification[];
};

function formatReceivedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) {
    return time;
  }

  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return `${day}, ${time}`;
}

export function NotificationsContent({ items }: NotificationsContentProps) {
  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-outline" size={32} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>Пока нет уведомлений</Text>
          <Text style={styles.emptyText}>Новые заказы появятся здесь, когда придёт push</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={[styles.row, !item.read && styles.rowUnread]}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.content}>
              <View style={styles.rowTop}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{formatReceivedAt(item.receivedAt)}</Text>
              </View>
              {item.body ? (
                <Text style={styles.itemBody} numberOfLines={3}>
                  {item.body}
                </Text>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: COLORS.gray100,
  },
  rowUnread: {
    backgroundColor: '#ECFDF3',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  itemBody: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.gray600,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 20,
  },
});
