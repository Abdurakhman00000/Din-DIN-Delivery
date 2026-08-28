// Типы для раздела «Профиль» (GET /api/courier/me) — ровно два варианта
// транспорта и три статуса, как на бэке (couriers/models.py::VehicleType/
// CourierStatus), не больше. `(string & {})` намеренно убран: он тише
// принимает опечатку в значении, чем ловит её на этапе типов.

export type CourierVehicle = 'foot' | 'scooter';

export type CourierWorkStatus = 'offline' | 'online' | 'suspended';

export type CourierProfile = {
  id: string;
  phone: string;
  full_name: string;
  // ⚠️ На бэке этого поля нет (см. couriers/schemas.py::CourierRead —
  // фото курьера отдаётся только в админском CourierAdminRead, не в
  // курьерском /me, намеренно). Оставлено как есть, чтобы не ломать
  // уже написанный на нём UI (useCourierAvatar/UserAvatar) — но
  // реально всегда undefined, пока бэк не отдаст отдельную ручку.
  avatar_url?: string | null;
  pickup_point_id: string;
  vehicle: CourierVehicle;
  status: CourierWorkStatus;
  daily_quota_portions: number;
  max_active_deliveries: number;
  is_active: boolean;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInfoRow = {
  label: string;
  value: string;
  icon: 'call-outline' | 'bicycle-outline' | 'radio-button-on-outline' | 'restaurant-outline' | 'layers-outline' | 'checkmark-circle-outline' | 'calendar-outline' | 'location-outline' | 'time-outline';
};
