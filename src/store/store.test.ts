// Smoke-тест: Redux store инициализируется корректно
import { store } from '@/store/store';

describe('store', () => {
  it('initializes with api reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
  });

  it('initializes with auth reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state.auth.bootstrapped).toBe(false);
    expect(state.auth.isAuthenticated).toBe(false);
  });
});
