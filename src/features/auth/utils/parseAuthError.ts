import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type { ApiValidationError } from '../types';

const AUTH_MESSAGES: Record<number, string> = {
  401: 'Неверный телефон или пароль',
  403: 'Доступ запрещён',
  423: 'Аккаунт временно заблокирован. Подождите и попробуйте снова позже',
};

export function parseAuthError(error: unknown): string {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return 'Не удалось выполнить вход. Проверьте подключение к интернету';
  }

  const fetchError = error as FetchBaseQueryError;
  const status = typeof fetchError.status === 'number' ? fetchError.status : 0;

  if (status in AUTH_MESSAGES) {
    return AUTH_MESSAGES[status];
  }

  if (status === 422 && fetchError.data && typeof fetchError.data === 'object') {
    const validation = fetchError.data as ApiValidationError;
    const first = validation.detail?.[0]?.msg;
    if (first) {
      return first;
    }
  }

  return 'Не удалось выполнить вход. Попробуйте ещё раз';
}
