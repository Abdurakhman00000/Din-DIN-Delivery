import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MOCK_AVATAR_URL } from '@/constants/app';
import { COLORS } from '@/constants/theme';

import { EarningsCard } from '../components/EarningsCard';
import { HistoryHeader } from '../components/HistoryHeader';
import { HistoryOrderCard } from '../components/HistoryOrderCard';
import { PeriodFilter } from '../components/PeriodFilter';
import { MOCK_HISTORY } from '../constants/mockData';
import type { HistoryPeriod } from '../types';

export function HistoryScreen() {
  const [period, setPeriod] = useState<HistoryPeriod>('today');
  // Позже: const { data } = useGetCourierHistoryQuery(period);
  const history = MOCK_HISTORY[period];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HistoryHeader avatarUrl={MOCK_AVATAR_URL} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>История</Text>
        <PeriodFilter value={period} onChange={setPeriod} />
        <EarningsCard summary={history.summary} />

        <View style={styles.list}>
          {history.orders.map((order) => (
            <HistoryOrderCard key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>
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
  list: {
    gap: 12,
  },
});
