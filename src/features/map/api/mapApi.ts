// RTK Query — эндпоинты раздела «Карта» (подключение API позже)
// Реальные пути: см. API_ENDPOINTS в @/constants/api
import { baseApi } from '@/services/api/baseApi';

export const mapApi = baseApi.injectEndpoints({
  endpoints: () => ({}),
});
