import { StyleSheet, Text, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { HeaderUserActions } from '@/components/ui/HeaderUserActions';
import { COLORS } from '@/constants/theme';
import { useCourierAvatar } from '@/features/profile/hooks/useCourierAvatar';

type AppHeaderProps = {
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function AppHeader({ onNotificationsPress, onAvatarPress }: AppHeaderProps) {
  const { fullName, photoUrl } = useCourierAvatar();

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <AppLogo />
        <Text style={styles.brandName}>Din Din</Text>
      </View>

      <HeaderUserActions
        fullName={fullName}
        photoUrl={photoUrl}
        onNotificationsPress={onNotificationsPress}
        onAvatarPress={onAvatarPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
});
