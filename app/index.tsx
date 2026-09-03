// Точка входа — проверка сессии и редирект
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { COLORS, DARK } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';

export default function Index() {
  const { bootstrapped, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!bootstrapped) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.auth.login} />;
  }

  return <Redirect href={ROUTES.tabs.map} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK.bg,
  },
});
