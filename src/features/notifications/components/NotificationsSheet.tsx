/* Reanimated shared values are mutated on the UI thread. */
/* eslint-disable react-hooks/immutability */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';
import type { InboxNotification } from '@/features/notifications/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.62;

type NotificationsSheetProps = {
  visible: boolean;
  items: InboxNotification[];
  onClose: () => void;
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

export function NotificationsSheet({ visible, items, onClose }: NotificationsSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : SHEET_HEIGHT, { duration: visible ? 280 : 220 });
  }, [translateY, visible]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(12)
        .onUpdate((event) => {
          translateY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
          const shouldClose = event.translationY > 90 || event.velocityY > 900;
          if (shouldClose) {
            translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 }, (finished) => {
              if (finished) {
                runOnJS(onClose)();
              }
            });
          } else {
            translateY.value = withTiming(0, { duration: 200 });
          }
        }),
    [onClose, translateY],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SHEET_HEIGHT], [0.35, 0]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
      </Pressable>

      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GestureDetector gesture={pan}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
            <Text style={styles.title}>Уведомления</Text>
          </View>
        </GestureDetector>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-outline" size={32} color={COLORS.gray400} />
              <Text style={styles.emptyTitle}>Пока нет уведомлений</Text>
              <Text style={styles.emptyText}>
                Новые заказы появятся здесь, когда придёт push
              </Text>
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  title: {
    alignSelf: 'stretch',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
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
