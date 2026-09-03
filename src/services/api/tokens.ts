// Хранение и обновление токенов авторизации
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type { AuthTokenPair } from '@/features/auth/types';
import { deleteSecureItem, getSecureItem, saveSecureItem } from '@/utils/secureStorage';

const ACCESS_TOKEN_KEY = 'courier_access_token';
const REFRESH_TOKEN_KEY = 'courier_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecureItem(REFRESH_TOKEN_KEY);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await saveSecureItem(ACCESS_TOKEN_KEY, accessToken);
  await saveSecureItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await deleteSecureItem(ACCESS_TOKEN_KEY);
  await deleteSecureItem(REFRESH_TOKEN_KEY);
}

let refreshPromise: Promise<boolean> | null = null;

/** Обновляет пару токенов через refresh_token (ротация). */
export async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // Только 401 значит "бэк однозначно отклонил именно этот
        // refresh_token" (просрочен/уже использован/отозван) — только
        // тогда есть смысл его стирать. Любой другой код (5xx — бэк
        // упал/перегружен, 429 и т.п.) — токен вполне может быть ещё
        // рабочим, просто сейчас не получилось; стирать его в этом
        // случае — реальный баг: курьер молча "разлогинивается" из-за
        // временной проблемы сети/бэка, а не потому что сессия истекла.
        if (response.status === 401) {
          await clearTokens();
        }
        return false;
      }

      const data = (await response.json()) as AuthTokenPair;
      await saveTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      // Сетевая ошибка (нет связи, таймаут) — тем более не повод стирать
      // токен, который может быть абсолютно валиден: просто повторим
      // попытку в следующий раз, когда связь появится.
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Отзывает refresh_token на сервере и очищает локальные токены. */
export async function logoutSession(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.logout}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // logout всегда считается успешным на клиенте
    }
  }

  await clearTokens();
}
