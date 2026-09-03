import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, DARK, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

import type { HistoryPeriod } from '../types';

// Только то, что реально считает бэк (GET /api/courier/stats) — без
// "месяца", для него там нет данных (см. history/types/index.ts).
const PERIODS: { id: HistoryPeriod; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'Неделя' },
];

type PeriodFilterProps = {
  value: HistoryPeriod;
  onChange: (period: HistoryPeriod) => void;
};

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  function handleChange(period: HistoryPeriod) {
    void Haptics.selectionAsync();
    onChange(period);
  }

  return (
    <View style={styles.row}>
      {PERIODS.map((period) => {
        const selected = period.id === value;

        return (
          <Pressable
            key={period.id}
            onPress={() => handleChange(period.id)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{period.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: DARK.hairline,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textSecondary,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
