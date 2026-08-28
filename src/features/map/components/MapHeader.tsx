import { StyleSheet, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { HeaderUserActions } from '@/components/ui/HeaderUserActions';
import { COLORS, SHADOW } from '@/constants/theme';
import { useCourierAvatar } from '@/features/profile/hooks/useCourierAvatar';

type MapHeaderProps = {
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function MapHeader({ onNotificationsPress, onAvatarPress }: MapHeaderProps) {
  const { fullName, photoUrl } = useCourierAvatar();

  return (
    <View style={styles.container}>
      <View style={[styles.logoBlock, SHADOW.soft]}>
        <AppLogo />
      </View>

      <HeaderUserActions
        fullName={fullName}
        photoUrl={photoUrl}
        onNotificationsPress={onNotificationsPress}
        onAvatarPress={onAvatarPress}
        elevated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoBlock: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
  },
});
