export type { InboxNotification } from './types';
export { NotificationsContent } from './components/NotificationsContent';

/** @deprecated используйте useSheets / useOptionalSheets из @/features/sheets */
export {
  useSheets as useNotificationsUi,
  useOptionalSheets as useOptionalNotificationsUi,
} from '@/features/sheets';
