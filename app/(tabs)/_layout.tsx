// Tab-навигация основных разделов курьера
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants/routes';
import { COLORS } from '@/constants/theme';
import { useOptionalSheets } from '@/features/sheets';
import { useAppSelector } from '@/store/hooks';

const TAB_BAR_CONTENT_HEIGHT = 56;
const ANDROID_NAV_EXTRA = 12;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { bootstrapped, isAuthenticated } = useAppSelector((state) => state.auth);
  const sheets = useOptionalSheets();
  const historyOpen = !!sheets?.isHistoryOpen;
  const bottomPadding =
    Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 8) + ANDROID_NAV_EXTRA;

  if (bootstrapped && !isAuthenticated) {
    return <Redirect href={ROUTES.auth.login} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.milky,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: TAB_BAR_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        listeners={{
          tabPress: () => {
            sheets?.closeSheet();
          },
        }}
        options={{
          title: 'Карта',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            sheets?.toggleSheet('history');
          },
        }}
        options={{
          title: 'История',
          tabBarIcon: ({ color, size }) => {
            const tint = historyOpen ? COLORS.primary : color;
            return <Ionicons name={historyOpen ? 'time' : 'time-outline'} size={size} color={tint} />;
          },
          tabBarLabel: ({ color }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                marginTop: 2,
                color: historyOpen ? COLORS.primary : color,
              }}
            >
              История
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={{
          tabPress: () => {
            sheets?.closeSheet();
          },
        }}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
