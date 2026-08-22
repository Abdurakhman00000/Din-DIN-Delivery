import { AppHeader } from '@/components/ui/AppHeader';
import type { AvatarSource } from '@/constants/app';

type HistoryHeaderProps = {
  avatarUrl: AvatarSource;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function HistoryHeader(props: HistoryHeaderProps) {
  return <AppHeader {...props} />;
}
