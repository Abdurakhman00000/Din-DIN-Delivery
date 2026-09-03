import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { COLORS, DARK, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import { useLogoutMutation } from '@/features/auth/api/authApi';
import { clearSession } from '@/features/auth/store/authSlice';
import { baseApi } from '@/services/api/baseApi';
import { useAppDispatch } from '@/store/hooks';

import { useGetCourierMeQuery } from '../api/profileApi';
import { ProfileHero } from '../components/ProfileHero';
import { ProfileInfoList } from '../components/ProfileInfoList';
import { ProfileLogoutButton } from '../components/ProfileLogoutButton';

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

  function handleRetry() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void refetch();
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {isLoading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Загружаем профиль…</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.stateWrap}>
            <Ionicons name="cloud-offline-outline" size={32} color={DARK.textMuted} />
            <Text style={styles.stateTitle}>Не удалось загрузить профиль</Text>
            <Text style={styles.stateText}>Проверьте подключение и попробуйте снова</Text>
            <Pressable style={styles.retryButton} onPress={handleRetry} disabled={isFetching}>
              {isFetching ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.retryText}>Повторить</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {data ? (
          <>
            <ProfileHero profile={data} />
            <ProfileInfoList profile={data} />
          </>
        ) : null}

        <View style={styles.logoutWrap}>
          <ProfileLogoutButton onPress={handleLogout} loading={isLoggingOut} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  content: {
    paddingBottom: SPACING.xl + 4,
    flexGrow: 1,
  },
  stateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
    gap: 10,
  },
  stateTitle: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.title - 2,
    color: DARK.textPrimary,
  },
  stateText: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.body,
    color: DARK.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.body,
  },
  logoutWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl - 4,
  },
});
