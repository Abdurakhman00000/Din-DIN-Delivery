import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/AppHeader';
import { COLORS } from '@/constants/theme';

import { ProfileMenuList } from '../components/ProfileMenuList';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { MOCK_PROFILE, PROFILE_MENU } from '../constants/mockData';

export function ProfileScreen() {
  // Позже: const { data } = useGetCourierProfileQuery();
  const profile = MOCK_PROFILE;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader avatarUrl={profile.avatarUrl} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileSummaryCard profile={profile} />
        <ProfileMenuList items={PROFILE_MENU} />
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
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
});
