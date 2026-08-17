// Корневой layout приложения (провайдеры, навигация)
import '../global.css';

import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import { store } from '@/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}
