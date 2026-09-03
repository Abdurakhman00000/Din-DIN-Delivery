import { StyleSheet, Text, View } from 'react-native';

import { DARK, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import type { DailyPortionsEntry } from '@/features/stats';

const WEEKDAY_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString('ru-RU', WEEKDAY_MONTH);
}

type DailyPortionsRowProps = {
  entry: DailyPortionsEntry;
};

/**
 * Заменяет старый HistoryOrderCard (карточка отдельного заказа —
 * адрес, время) — бэк такого списка не отдаёт вообще, только сумму
 * порций по дню (см. history/types/index.ts). Честная замена, не
 * попытка притвориться тем же самым.
 */
export function DailyPortionsRow({ entry }: DailyPortionsRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.date}>{formatDay(entry.day)}</Text>
      <Text style={styles.portions}>{entry.portions} порций</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: DARK.hairline,
    borderRadius: RADIUS.md,
  },
  date: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
  },
  portions: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    color: DARK.textSecondary,
  },
});
