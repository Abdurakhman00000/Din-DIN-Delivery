// RTK Query — эндпоинты авторизации курьера
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';
import { clearTokens, getRefreshToken, saveTokens } from '@/services/api/tokens';

import type { AuthTokenPair, LoginRequest, LogoutRequest, RefreshRequest } from '../types';

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokenPair, LoginRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.login,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        await saveTokens(data.access_token, data.refresh_token);
      },
    }),
    refreshTokens: builder.mutation<AuthTokenPair, RefreshRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.auth.refresh,
        method: 'POST',
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        await saveTokens(data.access_token, data.refresh_token);
      },
    }),
    logout: builder.mutation<null, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const refreshToken = await getRefreshToken();

        if (refreshToken) {
          await baseQuery({
            url: API_ENDPOINTS.auth.logout,
            method: 'POST',
            body: { refresh_token: refreshToken } satisfies LogoutRequest,
          });
        }

        await clearTokens();
        return { data: null };
      },
      invalidatesTags: ['Courier'],
    }),
  }),
});

export const { useLoginMutation, useRefreshTokensMutation, useLogoutMutation } = authApi;
