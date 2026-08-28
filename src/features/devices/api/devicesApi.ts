// RTK Query — POST /api/courier/devices. Вызывать сразу после входа и
// при каждом обновлении push-токена (повторный вызов просто
// перезаписывает данные, отдельного unregister нет — см. флоу-документ).
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';

export type RegisterDeviceRequest = {
  push_token: string;
  platform: 'ios' | 'android';
  app_version: string;
};

export const devicesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerDevice: builder.mutation<void, RegisterDeviceRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.courier.devices,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRegisterDeviceMutation } = devicesApi;
