// Redux store
import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth/store/authSlice';
import { baseApi } from '@/services/api/baseApi';

import '@/features/auth/api/authApi';
import '@/features/map/api/mapApi';
import '@/features/history/api/historyApi';
import '@/features/profile/api/profileApi';
import '@/features/deliveries/api/deliveriesApi';
import '@/features/shifts/api/shiftsApi';
import '@/features/locations/api/locationsApi';
import '@/features/devices/api/devicesApi';
import '@/features/appVersion/api/appVersionApi';
import '@/features/stats/api/statsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
