// Корневой layout приложения (провайдеры, навигация)
import '../global.css';
// Регистрирует фоновый геолокационный таск (TaskManager.defineTask) —
// импорт ради побочного эффекта, самый первый в файле специально:
// должен выполниться при КАЖДОМ старте JS-бандла, включая случаи, когда
// ОС поднимает приложение только под этот таск, без единого
// смонтированного экрана — см. комментарий в самом файле.
import '@/services/location/backgroundLocationTask';

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
          {/* Приложение целиком тёмное с редизайна 03.09.2026 — светлых
              экранов, которым нужны тёмные иконки статус-бара, больше
              нет. Локальные <StatusBar style="light" /> по экранам
              оставлены как явная подстраховка, этот — дефолт. */}
          <StatusBar style="light" />
          <RootNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
