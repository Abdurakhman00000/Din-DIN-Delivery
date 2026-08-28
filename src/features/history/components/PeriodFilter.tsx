import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

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
  return (
    <View style={styles.row}>
      {PERIODS.map((period) => {
        const selected = period.id === value;

        return (
          <Pressable
            key={period.id}
            onPress={() => onChange(period.id)}
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
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  labelSelected: {
    color: COLORS.white,
  },
});
