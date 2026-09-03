import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { COLORS, DARK, FONTS } from '@/constants/theme';
import { useOptionalSheets } from '@/features/sheets';

type HeaderUserActionsProps = {
  fullName?: string | null;
  photoUrl?: string | null;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
  elevated?: boolean;
  /** Тёмное стеклянное исполнение вместо непрозрачных белых кружков —
   * для плавающего поверх карты хедера (MapHeader.tsx). LoginScreen и
   * прочие светлые экраны это не передают, для них поведение не
   * меняется. */
  dark?: boolean;
};

export function HeaderUserActions({
  fullName,
  photoUrl,
  onNotificationsPress,
  onAvatarPress,
  elevated = false,
  dark = false,
}: HeaderUserActionsProps) {
  const sheets = useOptionalSheets();
  const handleNotificationsPress = onNotificationsPress ?? sheets?.openNotifications;
  const unreadCount = sheets?.unreadCount ?? 0;
  const Circle = dark ? BlurView : View;
  const circleProps = dark ? { intensity: 50, tint: 'dark' as const } : {};

  function handlePress(fn?: () => void) {
    return () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fn?.();
    };
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={handlePress(onAvatarPress)} accessibilityLabel="Профиль">
        <Circle
          {...circleProps}
          style={[
            styles.circle,
            dark ? styles.circleDark : styles.circleLight,
            elevated && !dark && styles.elevated,
          ]}
        >
          <UserAvatar fullName={fullName ?? ''} photoUrl={photoUrl} size={36} />
        </Circle>
      </Pressable>
      <Pressable onPress={handlePress(handleNotificationsPress)} accessibilityLabel="Уведомления">
        <Circle
          {...circleProps}
          style={[
            styles.circle,
            dark ? styles.circleDark : styles.circleLight,
            elevated && !dark && styles.elevated,
          ]}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={dark ? DARK.textPrimary : COLORS.gray900}
          />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
            </View>
          ) : null}
        </Circle>
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
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleLight: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  circleDark: {
    backgroundColor: DARK.glass,
    borderWidth: 1,
    borderColor: DARK.hairline,
  },
  elevated: {
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 9,
    lineHeight: 11,
  },
});
