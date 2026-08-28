// RTK Query — POST /locations/batch. Всегда 204, ничего не разбираем в
// ответе (см. флоу-документ backend'а) — только ошибку, если запрос не
// прошёл вовсе.
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';

import type { LocationPing } from '../types';

export const locationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sendLocationBatch: builder.mutation<null, LocationPing[]>({
      query: (pings) => ({
        url: API_ENDPOINTS.locations.batch,
        method: 'POST',
        body: { pings },
      }),
    }),
  }),
});

export const { useSendLocationBatchMutation } = locationsApi;
