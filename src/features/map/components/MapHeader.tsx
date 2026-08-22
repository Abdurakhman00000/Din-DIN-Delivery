import { StyleSheet, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { HeaderUserActions } from '@/components/ui/HeaderUserActions';
import type { AvatarSource } from '@/constants/app';
import { COLORS, SHADOW } from '@/constants/theme';

type MapHeaderProps = {
  avatarUrl: AvatarSource;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function MapHeader({ avatarUrl, onNotificationsPress, onAvatarPress }: MapHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.logoBlock, SHADOW.soft]}>
        <AppLogo />
      </View>

      <HeaderUserActions
        avatarUrl={avatarUrl}
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
