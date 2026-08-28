// RTK Query — активные заказы курьера. Курьер их не выбирает и не
// принимает — GET /active это единственный способ узнать о своих
// заказах (см. флоу-документ backend'а, раздел "Смена целиком, по шагам").
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';
import { generateRequestId } from '@/utils/deviceId';

import type { ActiveDelivery, PickedUpRequest, ProblemRequest } from '../types';

export const deliveriesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getActiveDeliveries: builder.query<ActiveDelivery[], void>({
      query: () => API_ENDPOINTS.deliveries.active,
      providesTags: ['Delivery'],
    }),

    markPickedUp: builder.mutation<ActiveDelivery, PickedUpRequest>({
      query: ({ deliveryId, checklist }) => ({
        url: API_ENDPOINTS.deliveries.pickedUp(deliveryId),
        method: 'POST',
        body: { checklist },
        // Idempotency-Key: курьер может нажать "Забрал" несколько раз
        // на плохой связи — повторный вызов с тем же ключом возвращает
        // прежний ответ вместо повторного выполнения. Один ключ на одну
        // попытку действия, не на весь мутейшн (RTK Query не ретраит
        // сам — ключ тут защищает конкретно от повторного нажатия
        // пользователем/таймаута конкретно этого одного запроса).
        headers: { 'Idempotency-Key': generateRequestId() },
      }),
      invalidatesTags: ['Delivery'],
    }),

    markDelivered: builder.mutation<ActiveDelivery, { deliveryId: string }>({
      query: ({ deliveryId }) => ({
        url: API_ENDPOINTS.deliveries.delivered(deliveryId),
        method: 'POST',
        headers: { 'Idempotency-Key': generateRequestId() },
      }),
      invalidatesTags: ['Delivery', 'Stats'],
    }),

    reportProblem: builder.mutation<ActiveDelivery, ProblemRequest>({
      query: ({ deliveryId, type, comment }) => ({
        url: API_ENDPOINTS.deliveries.problem(deliveryId),
        method: 'POST',
        body: { type, comment },
        headers: { 'Idempotency-Key': generateRequestId() },
      }),
      invalidatesTags: ['Delivery'],
    }),
  }),
});

export const {
  useGetActiveDeliveriesQuery,
  useLazyGetActiveDeliveriesQuery,
  useMarkPickedUpMutation,
  useMarkDeliveredMutation,
  useReportProblemMutation,
} = deliveriesApi;
