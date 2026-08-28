import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { COLORS } from '@/constants/theme';

type HeaderUserActionsProps = {
  fullName?: string | null;
  photoUrl?: string | null;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
  elevated?: boolean;
};

export function HeaderUserActions({
  fullName,
  photoUrl,
  onNotificationsPress,
  onAvatarPress,
  elevated = false,
}: HeaderUserActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onAvatarPress}
        style={[styles.whiteCircle, elevated && styles.elevated]}
        accessibilityLabel="Профиль"
      >
        <UserAvatar fullName={fullName ?? ''} photoUrl={photoUrl} size={36} />
      </Pressable>
      <Pressable
        onPress={onNotificationsPress}
        style={[styles.whiteCircle, elevated && styles.elevated]}
        accessibilityLabel="Уведомления"
      >
        <Ionicons name="notifications-outline" size={20} color={COLORS.gray900} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  whiteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
