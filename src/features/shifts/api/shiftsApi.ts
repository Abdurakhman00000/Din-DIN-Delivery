// RTK Query — POST /shifts/start, POST /shifts/end
import { API_ENDPOINTS } from '@/constants/api';
import { baseApi } from '@/services/api/baseApi';

import type { Shift } from '../types';

export const shiftsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    startShift: builder.mutation<Shift, void>({
      query: () => ({ url: API_ENDPOINTS.shifts.start, method: 'POST' }),
      invalidatesTags: ['Courier', 'Shift'],
    }),
    endShift: builder.mutation<Shift, void>({
      query: () => ({ url: API_ENDPOINTS.shifts.end, method: 'POST' }),
      invalidatesTags: ['Courier', 'Shift'],
    }),
  }),
});

export const { useStartShiftMutation, useEndShiftMutation } = shiftsApi;
