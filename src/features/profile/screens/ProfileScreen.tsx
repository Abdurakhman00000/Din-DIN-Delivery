import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/ui/AppHeader';
import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/theme';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { clearSession } from '@/features/auth/store/authSlice';
import { baseApi } from '@/services/api/baseApi';
import { useAppDispatch } from '@/store/hooks';

import { useGetCourierMeQuery } from '../api/profileApi';
import { ProfileLogoutButton } from '../components/ProfileLogoutButton';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, refetch, isFetching } = useGetCourierMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Токены всё равно очищаются в mutation — продолжаем выход локально
    } finally {
      dispatch(clearSession());
      dispatch(baseApi.util.resetApiState());
      router.replace(ROUTES.auth.login);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем профиль…</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.stateWrap}>
            <Ionicons name="cloud-offline-outline" size={32} color={COLORS.gray400} />
            <Text style={styles.stateTitle}>Не удалось загрузить профиль</Text>
            <Text style={styles.stateText}>Проверьте подключение и попробуйте снова</Text>
            <Pressable style={styles.retryButton} onPress={refetch} disabled={isFetching}>
              {isFetching ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.retryText}>Повторить</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {data ? <ProfileSummaryCard profile={data} /> : null}

        <ProfileLogoutButton onPress={handleLogout} loading={isLoggingOut} />
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
  stateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
