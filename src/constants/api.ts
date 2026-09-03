// Конфигурация API и пути эндпоинтов (реальный бэкенд)

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://169.58.192.208:8001';

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
    devices: '/api/courier/devices',
    appVersion: '/api/courier/app-version',
  },
  shifts: {
    start: '/api/courier/shifts/start',
    end: '/api/courier/shifts/end',
  },
  deliveries: {
    active: '/api/courier/deliveries/active',
    pickedUp: (id: string) => `/api/courier/deliveries/${id}/picked-up`,
    delivered: (id: string) => `/api/courier/deliveries/${id}/delivered`,
    problem: (id: string) => `/api/courier/deliveries/${id}/problem`,
  },
  locations: {
    batch: '/api/courier/locations/batch',
  },
  ws: {
    courier: '/ws/courier',
  },
} as const;

/** Тот же хост, что API_BASE_URL, только ws(s):// вместо http(s):// —
 * WebSocket-соединение идёт на тот же бэкенд, тот же порт. */
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');
