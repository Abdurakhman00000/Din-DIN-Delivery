import { useCheckAppVersionQuery } from '../api/appVersionApi';

/**
 * `blocked: true` — ровно тот случай из описания эндпоинта: версия
 * ниже минимально поддерживаемой, показываем жёсткий экран
 * обновления и не пускаем дальше (даже до логина).
 *
 * Намеренно НЕ блокируем на `isError`/сетевой ошибке — сам факт "не
 * достучались до /app-version" не значит "версия устарела", а если
 * сделать наоборот, один упавший запрос кладёт вход всем курьерам
 * разом. Fail-open, не fail-closed.
 */
export function useAppVersionGate() {
  const { data, isLoading } = useCheckAppVersionQuery();

  return {
    blocked: data?.supported === false,
    isChecking: isLoading,
    minSupported: data?.min_supported ?? null,
    updateUrl: data?.update_url ?? null,
  };
}
