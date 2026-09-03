import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { HeaderUserActions } from '@/components/ui/HeaderUserActions';
import { DARK, DARK_SHADOW, RADIUS } from '@/constants/theme';
import { useCourierAvatar } from '@/features/profile/hooks/useCourierAvatar';

type MapHeaderProps = {
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function MapHeader({ onNotificationsPress, onAvatarPress }: MapHeaderProps) {
  const { fullName, photoUrl } = useCourierAvatar();

  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="dark" style={[styles.logoBlock, DARK_SHADOW.button]}>
        <AppLogo />
      </BlurView>

      <HeaderUserActions
        fullName={fullName}
        photoUrl={photoUrl}
        onNotificationsPress={onNotificationsPress}
        onAvatarPress={onAvatarPress}
        dark
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
    backgroundColor: DARK.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DARK.hairline,
    padding: 6,
    overflow: 'hidden',
  },
});
