// Авторизация курьера
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { COLORS, DARK } from '@/constants/theme';
import { LoginScreen } from '@/features/auth';
import { useAppSelector } from '@/store/hooks';

export default function LoginRoute() {
  const { bootstrapped, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!bootstrapped) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={ROUTES.tabs.map} />;
  }

  return <LoginScreen />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK.bg,
  },
});
