// Типы для раздела «Профиль»
import type { AvatarSource } from '@/constants/app';

export type ProfileMenuId =
  | 'personal'
  | 'requisites'
  | 'transport'
  | 'tasks'
  | 'support'
  | 'settings';

export type CourierProfile = {
  id: string;
  fullName: string;
  avatarUrl: AvatarSource;
  totalDeliveries: number;
};

export type ProfileMenuItem = {
  id: ProfileMenuId;
  title: string;
  icon: 'person-outline' | 'wallet-outline' | 'bicycle-outline' | 'clipboard-outline' | 'headset-outline' | 'settings-outline';
};
