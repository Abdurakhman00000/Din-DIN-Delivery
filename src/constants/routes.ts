// Маршруты приложения
export const ROUTES = {
  tabs: {
    map: '/(tabs)/map',
    history: '/(tabs)/history',
    profile: '/(tabs)/profile',
  },
  auth: {
    login: '/auth/login',
    verification: '/auth/verification',
  },
} as const;
