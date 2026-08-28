// Конфигурация API и пути эндпоинтов (реальный бэкенд)

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://169.58.192.208:8001';

/** Пути эндпоинтов — подключать по мере интеграции */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/courier/auth/login',
    refresh: '/api/courier/auth/refresh',
    logout: '/api/courier/auth/logout',
  },
  courier: {
    me: '/api/courier/me',
    stats: '/api/courier/stats',
  },
  shifts: {
    start: '/api/courier/shifts/start',
    end: '/api/courier/shifts/end',
  },
  deliveries: {
    active: '/api/courier/deliveries/active',
    pickedUp: (id: string) => `/api/courier/deliveries/${id}/picked-up`,
    delivered: (id: string) => `/api/courier/deliveries/${id}/delivered`,
  },
  locations: {
    batch: '/api/courier/locations/batch',
  },
  ws: {
    courier: '/ws/courier',
  },
} as const;
