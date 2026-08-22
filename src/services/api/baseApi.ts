// Базовая конфигурация RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/', // TODO: заменить на API URL по ТЗ
  }),
  endpoints: () => ({}),
  tagTypes: ['MapStats', 'CourierStatus', 'CourierProfile', 'History', 'Places', 'IncomingOrder'],
});
