// Зеркалит CourierStatsRead/DailyPortionsEntry бэкенда
// (src/modules/deliveries/schemas.py) — GET /api/courier/stats.
export type DailyPortionsEntry = {
  day: string; // date, ISO "YYYY-MM-DD"
  portions: number;
};

export type CourierStats = {
  today_portions: number;
  today_quota: number;
  week_portions: number;
  history: DailyPortionsEntry[];
};
