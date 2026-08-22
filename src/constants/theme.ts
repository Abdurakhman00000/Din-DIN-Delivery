// Цвета и размеры приложения
export const COLORS = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  accent: '#F97316',
  white: '#FFFFFF',
  milky: '#FAFAF8',
  border: '#E5E7EB',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray900: '#111827',
  shadow: 'rgba(0, 0, 0, 0.12)',
} as const;

export const SHADOW = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
