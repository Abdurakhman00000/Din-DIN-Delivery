import type { CourierProfile, ProfileInfoRow } from '../types';
import { formatLocalDigits } from '@/utils/phone';

// Ровно то, что реально бывает на бэке (couriers/models.py) — не
// "велосипед"/"авто", которых в системе нет.
const VEHICLE_LABELS: Record<string, string> = {
  foot: 'Пешком',
  scooter: 'Мопед',
};

const STATUS_LABELS: Record<string, string> = {
  offline: 'Не на линии',
  online: 'На линии',
  suspended: 'Заблокирован',
};

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPhone(phone: string): string {
  if (phone.startsWith('+996') && phone.length === 13) {
    const local = phone.slice(4);
    return `+996 ${formatLocalDigits(local)}`;
  }

  return phone;
}

function shortId(id: string): string {
  if (id.length <= 12) {
    return id;
  }

  return `${id.slice(0, 8)}…`;
}

export function getVehicleLabel(vehicle: string): string {
  return VEHICLE_LABELS[vehicle] ?? vehicle;
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function buildProfileInfoRows(profile: CourierProfile): ProfileInfoRow[] {
  return [
    { label: 'Телефон', value: formatPhone(profile.phone), icon: 'call-outline' },
    {
      label: 'План порций',
      value: String(profile.daily_quota_portions),
      icon: 'restaurant-outline',
    },
    {
      label: 'Макс. заказов',
      value: String(profile.max_active_deliveries),
      icon: 'layers-outline',
    },
    {
      label: 'Аккаунт',
      value: profile.is_active ? 'Активен' : 'Неактивен',
      icon: 'checkmark-circle-outline',
    },
    { label: 'Дата найма', value: formatDate(profile.hired_at), icon: 'calendar-outline' },
    { label: 'ПВЗ', value: shortId(profile.pickup_point_id), icon: 'location-outline' },
    { label: 'Обновлён', value: formatDate(profile.updated_at), icon: 'time-outline' },
  ];
}

export function getProfileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}
