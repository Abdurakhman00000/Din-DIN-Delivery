// Общие константы приложения
import type { ImageSource } from 'expo-image';

export const APP_NAME = 'Teyva';

export type AvatarSource = ImageSource | string;

// Временный единый аватар: Max Verstappen (Wikimedia Commons)
export const MOCK_AVATAR_URL: ImageSource = require('../../assets/avatars/max-verstappen.jpg');

export function toAvatarSource(source: AvatarSource): ImageSource {
  return typeof source === 'string' ? { uri: source } : source;
}
