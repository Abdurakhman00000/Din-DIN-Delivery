import { StyleSheet, Text, View } from 'react-native';

import { AppLogo } from '@/components/ui/AppLogo';
import { HeaderUserActions } from '@/components/ui/HeaderUserActions';
import type { AvatarSource } from '@/constants/app';
import { COLORS } from '@/constants/theme';

type AppHeaderProps = {
  avatarUrl: AvatarSource;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
};

export function AppHeader({ avatarUrl, onNotificationsPress, onAvatarPress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <AppLogo />
        <Text style={styles.brandName}>Din Din</Text>
      </View>

      <HeaderUserActions
        avatarUrl={avatarUrl}
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
