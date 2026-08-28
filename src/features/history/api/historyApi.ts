// RTK Query — эндпоинты раздела «История» (подключение API позже)
// Реальный путь: GET /api/courier/stats — см. API_ENDPOINTS в @/constants/api
import { baseApi } from '@/services/api/baseApi';

export const historyApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
});
