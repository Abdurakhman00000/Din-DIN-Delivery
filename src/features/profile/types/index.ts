// Типы для раздела «Профиль» (GET /api/courier/me)

export type CourierVehicle = 'foot' | 'bicycle' | 'car' | (string & {});

export type CourierWorkStatus = 'offline' | 'online' | 'busy' | (string & {});

export type CourierProfile = {
  id: string;
  phone: string;
  full_name: string;
  avatar_url?: string | null;
  pickup_point_id: string;
  vehicle: CourierVehicle;
  status: CourierWorkStatus;
  daily_quota_portions: number;
  max_active_deliveries: number;
  is_active: boolean;
  hired_at: string;
  created_at: string;
  updated_at: string;
};

export type ProfileInfoRow = {
  label: string;
  value: string;
  icon: 'call-outline' | 'bicycle-outline' | 'radio-button-on-outline' | 'restaurant-outline' | 'layers-outline' | 'checkmark-circle-outline' | 'calendar-outline' | 'location-outline' | 'time-outline';
};
