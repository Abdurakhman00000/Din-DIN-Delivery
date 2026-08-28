// GET /api/courier/app-version — без авторизации, первый запрос при
// старте приложения (см. api/courier/profile.py: специально вынесен
// из-под JWT, чтобы блокировать устаревшую версию ещё до входа).
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';
import { getAppPlatform, getAppVersion } from '@/utils/appVersion';

import type { AppVersionCheck } from '../types';

export const appVersionApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    checkAppVersion: builder.query<AppVersionCheck, void>({
      query: () => ({
        url: API_ENDPOINTS.courier.appVersion,
        params: { platform: getAppPlatform(), version: getAppVersion() },
      }),
    }),
  }),
});

export const { useCheckAppVersionQuery } = appVersionApi;
