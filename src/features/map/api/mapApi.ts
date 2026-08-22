// RTK Query — эндпоинты раздела «Карта» (подключение API позже)
import { baseApi } from '@/services/api/baseApi';

import type {
  CourierMapStats,
  CourierOnlineStatus,
  CourierProfilePreview,
  IncomingOrder,
  MapPlace,
} from '../types';

export const mapApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourierMapStats: builder.query<CourierMapStats, void>({
      query: () => '/courier/map/stats',
      providesTags: ['MapStats'],
    }),
    getCourierOnlineStatus: builder.query<CourierOnlineStatus, void>({
      query: () => '/courier/online-status',
      providesTags: ['CourierStatus'],
    }),
    getCourierProfilePreview: builder.query<CourierProfilePreview, void>({
      query: () => '/courier/profile/preview',
      providesTags: ['CourierProfile'],
    }),
    searchPlaces: builder.query<MapPlace[], string>({
      query: (q) => `/places/search?q=${encodeURIComponent(q)}`,
      providesTags: ['Places'],
    }),
    goOnline: builder.mutation<CourierOnlineStatus, void>({
      query: () => ({ url: '/courier/online', method: 'POST' }),
      invalidatesTags: ['CourierStatus'],
    }),
    goOffline: builder.mutation<CourierOnlineStatus, void>({
      query: () => ({ url: '/courier/offline', method: 'POST' }),
      invalidatesTags: ['CourierStatus'],
    }),
    getIncomingOrder: builder.query<IncomingOrder | null, void>({
      query: () => '/courier/orders/incoming',
      providesTags: ['IncomingOrder'],
    }),
    acceptOrder: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/accept`, method: 'POST' }),
      invalidatesTags: ['IncomingOrder', 'CourierStatus'],
    }),
    declineOrder: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/decline`, method: 'POST' }),
      invalidatesTags: ['IncomingOrder'],
    }),
    arriveAtPickup: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/arrive-pickup`, method: 'POST' }),
    }),
    confirmPickup: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/pickup`, method: 'POST' }),
    }),
    arriveAtDropoff: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/arrive-dropoff`, method: 'POST' }),
    }),
    completeOrder: builder.mutation<{ ok: boolean }, string>({
      query: (orderId) => ({ url: `/courier/orders/${orderId}/complete`, method: 'POST' }),
      invalidatesTags: ['IncomingOrder', 'History', 'CourierStatus'],
    }),
  }),
});

export const {
  useGetCourierMapStatsQuery,
  useGetCourierOnlineStatusQuery,
  useGetCourierProfilePreviewQuery,
  useSearchPlacesQuery,
  useGoOnlineMutation,
  useGoOfflineMutation,
  useGetIncomingOrderQuery,
  useAcceptOrderMutation,
  useDeclineOrderMutation,
  useArriveAtPickupMutation,
  useConfirmPickupMutation,
  useArriveAtDropoffMutation,
  useCompleteOrderMutation,
} = mapApi;
