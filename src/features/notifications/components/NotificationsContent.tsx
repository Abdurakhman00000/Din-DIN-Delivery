import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { COLORS, DARK, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
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
          <Ionicons name="notifications-outline" size={32} color={DARK.textMuted} />
          <Text style={styles.emptyTitle}>Пока нет уведомлений</Text>
          <Text style={styles.emptyText}>Новые заказы появятся здесь, когда придёт push</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={[styles.row, !item.read && styles.rowUnread]}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications" size={18} color={COLORS.primaryLight} />
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
    marginTop: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: DARK.hairline,
  },
  rowUnread: {
    backgroundColor: DARK.primaryGlow,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    gap: SPACING.sm,
  },
  itemTitle: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
  },
  time: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.caption,
    color: DARK.textMuted,
  },
  itemBody: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.label,
    lineHeight: 18,
    color: DARK.textSecondary,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textPrimary,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.body,
    color: DARK.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
