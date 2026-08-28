// Redux-слайс сессии авторизации
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  bootstrapped: boolean;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  bootstrapped: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
      state.bootstrapped = true;
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    clearSession(state) {
      state.isAuthenticated = false;
    },
  },
});

export const { setBootstrapped, setAuthenticated, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
