// RTK Query — эндпоинты раздела «История» (подключение API позже)
import { baseApi } from '@/services/api/baseApi';

import type { HistoryPeriod, HistoryResponse } from '../types';

export const historyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourierHistory: builder.query<HistoryResponse, HistoryPeriod>({
      query: (period) => `/courier/history?period=${period}`,
      providesTags: ['History'],
    }),
  }),
});

export const { useGetCourierHistoryQuery } = historyApi;
