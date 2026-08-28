// Redux store
import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/features/auth/store/authSlice';
import { baseApi } from '@/services/api/baseApi';

import '@/features/auth/api/authApi';
import '@/features/map/api/mapApi';
import '@/features/history/api/historyApi';
import '@/features/profile/api/profileApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
