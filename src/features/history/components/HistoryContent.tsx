import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { COLORS } from '@/constants/theme';
import { useGetCourierStatsQuery } from '@/features/stats';

import { DailyPortionsRow } from './DailyPortionsRow';
import { DeliveryStatsCard } from './DeliveryStatsCard';
import { PeriodFilter } from './PeriodFilter';
import type { HistoryPeriod } from '../types';

/** Контент истории порций — один и тот же для шторки (и раньше для экрана). */
export function HistoryContent() {
  const [period, setPeriod] = useState<HistoryPeriod>('today');
  const { data: stats, isLoading, isFetching, isError, refetch } = useGetCourierStatsQuery();

  const statsCard =
    period === 'today'
      ? {
          title: 'Сегодня',
          value: stats?.today_portions ?? 0,
          subtitle: `из ${stats?.today_quota ?? 0} порций по плану`,
        }
      : {
          title: 'Эта неделя',
          value: stats?.week_portions ?? 0,
          subtitle: 'порций доставлено',
        };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <PeriodFilter value={period} onChange={setPeriod} />

        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : isError ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTitle}>Не удалось загрузить</Text>
            <Text style={styles.errorText} onPress={() => void refetch()}>
              Нажмите, чтобы повторить
            </Text>
          </View>
        ) : (
          <DeliveryStatsCard {...statsCard} />
        )}

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>По дням</Text>
            {isFetching && !isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : null}
          </View>

          {stats && stats.history.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет доставленных заказов</Text>
          ) : (
            <View style={styles.list}>
              {stats?.history
                .slice()
                .reverse()
                .map((entry) => <DailyPortionsRow key={entry.day} entry={entry} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  loader: {
    marginVertical: 24,
  },
  errorWrap: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  historySection: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  list: {
    gap: 8,
  },
});
