// RTK Query — эндпоинты раздела «Профиль» (подключение API позже)
import { baseApi } from '@/services/api/baseApi';

import type { CourierProfile } from '../types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourierProfile: builder.query<CourierProfile, void>({
      query: () => '/courier/profile',
      providesTags: ['CourierProfile'],
    }),
  }),
});

export const { useGetCourierProfileQuery } = profileApi;
