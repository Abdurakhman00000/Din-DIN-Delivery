import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Достаёт человекочитаемое сообщение из ошибки мутирующих ручек
 * /deliveries/*, /shifts/* — они на 422/409/403 отдают
 * `{"detail": "<строка>"}` (FastAPI HTTPException с обычным текстом),
 * не массив ошибок валидации как /auth/* (см. features/auth/utils/
 * parseAuthError.ts — там другая форма ответа, потому и другая функция).
 *
 * Раньше эти ошибки нигде не рендерились — код был написан в расчёте
 * "видно через X.error", но X.error никуда не передавался (см.
 * MapScreen.tsx/ChecklistSheet.tsx/ProblemSheet.tsx) — курьер просто не
 * понимал, почему кнопка снова активна и ничего не произошло.
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }
  if (!('data' in error)) {
    return fallback;
  }
  const data = (error as FetchBaseQueryError).data;
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail;
    if (typeof detail === 'string' && detail.length > 0) {
      return detail;
    }
  }
  return fallback;
}
