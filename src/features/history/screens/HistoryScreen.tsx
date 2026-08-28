import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';
import { useGetCourierStatsQuery } from '@/features/stats';

import { DailyPortionsRow } from '../components/DailyPortionsRow';
import { DeliveryStatsCard } from '../components/DeliveryStatsCard';
import { HistoryHeader } from '../components/HistoryHeader';
import { PeriodFilter } from '../components/PeriodFilter';
import type { HistoryPeriod } from '../types';

export function HistoryScreen() {
  const [period, setPeriod] = useState<HistoryPeriod>('today');
  const { data: stats, isLoading, isFetching } = useGetCourierStatsQuery();

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HistoryHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>История</Text>
        <PeriodFilter value={period} onChange={setPeriod} />

        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <DeliveryStatsCard {...statsCard} />
        )}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>По дням</Text>
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
      {isFetching && !isLoading ? (
        <View style={styles.refreshHint}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  historySection: {
    gap: 10,
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
  refreshHint: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
});
