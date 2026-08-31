// Маршрут оставлен для Expo Router, контент — в HistorySheet (таб открывает шторку).
import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants/routes';

export default function HistoryRoute() {
  return <Redirect href={ROUTES.tabs.map} />;
}
