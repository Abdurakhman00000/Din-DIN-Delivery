// RTK Query — GET /api/courier/me
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';

import type { CourierProfile } from '../types';

export const profileApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCourierMe: builder.query<CourierProfile, void>({
      query: () => API_ENDPOINTS.courier.me,
      providesTags: ['Courier'],
    }),
  }),
});

export const { useGetCourierMeQuery } = profileApi;
