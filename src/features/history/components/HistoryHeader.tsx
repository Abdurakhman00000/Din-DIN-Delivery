import { AppHeader } from '@/components/ui/AppHeader';

type HistoryHeaderProps = {
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function HistoryHeader(props: HistoryHeaderProps) {
  return <AppHeader {...props} />;
}
