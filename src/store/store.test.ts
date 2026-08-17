// Smoke-тест: Redux store инициализируется корректно
import { store } from '@/store/store';

describe('store', () => {
  it('initializes with api reducer', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
  });
});
