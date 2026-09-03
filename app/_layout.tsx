// Корневой layout приложения (провайдеры, навигация)
import '../global.css';

import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UpdateRequiredScreen, useAppVersionGate } from '@/features/appVersion';
import { useAuthBootstrap } from '@/features/auth';
import { SheetsProvider } from '@/features/sheets';
import { useAppFonts } from '@/hooks/useAppFonts';
import { usePushNotificationHandlers } from '@/hooks/usePushNotificationHandlers';
import { store } from '@/store/store';

function RootNavigator() {
  const fontsLoaded = useAppFonts();
  const versionGate = useAppVersionGate();
  useAuthBootstrap();
  usePushNotificationHandlers();

  // Шрифты — до любого реального UI, чтобы не было заметного мигания
  // системным шрифтом с последующей подменой на Inter. На холодном
  // старте — доли секунды, дальше кешируется системой.
  if (!fontsLoaded) {
    return null;
  }

  // Самая первая проверка при старте, ещё до входа — см. useAppVersionGate.
  if (versionGate.blocked) {
    return (
      <UpdateRequiredScreen
        minSupported={versionGate.minSupported}
        updateUrl={versionGate.updateUrl}
      />
    );
  }

  return (
    <SheetsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" />
      </Stack>
    </SheetsProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar style="auto" />
          <RootNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
