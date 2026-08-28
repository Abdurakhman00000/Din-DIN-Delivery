// RTK Query — GET /api/courier/stats ("план порций: сегодня/неделя +
// история по дням"). Отдельный модуль от history/profile — это ровно
// один эндпоинт со своей формой ответа, не про заказы и не про профиль.
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';

import type { CourierStats } from '../types';

export const statsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCourierStats: builder.query<CourierStats, void>({
      query: () => API_ENDPOINTS.courier.stats,
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetCourierStatsQuery } = statsApi;
