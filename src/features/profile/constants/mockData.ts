// Мок-данные профиля (заменятся ответом API)
import { MOCK_AVATAR_URL } from '@/constants/app';
import type { CourierProfile, ProfileMenuItem } from '../types';

export const MOCK_PROFILE: CourierProfile = {
  id: 'courier-1',
  fullName: 'Иван Смирнов',
  avatarUrl: MOCK_AVATAR_URL,
  totalDeliveries: 3428,
};

export const PROFILE_MENU: ProfileMenuItem[] = [
  { id: 'personal', title: 'Личные данные', icon: 'person-outline' },
  { id: 'requisites', title: 'Реквизиты', icon: 'wallet-outline' },
  { id: 'transport', title: 'Транспорт', icon: 'bicycle-outline' },
  { id: 'tasks', title: 'План задач', icon: 'clipboard-outline' },
  { id: 'support', title: 'Поддержка', icon: 'headset-outline' },
  { id: 'settings', title: 'Настройка', icon: 'settings-outline' },
];
