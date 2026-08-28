// Зеркалит AppVersionCheckOut бэкенда (src/api/courier/profile.py).
export type AppVersionCheck = {
  supported: boolean;
  min_supported: string | null;
  latest: string | null;
  update_url: string | null;
};
