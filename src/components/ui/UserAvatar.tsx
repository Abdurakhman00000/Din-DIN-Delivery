import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import { getInitials } from '@/utils/initials';

type UserAvatarProps = {
  fullName?: string | null;
  photoUrl?: string | null;
  size?: number;
  fontSize?: number;
  borderWidth?: number;
};

export function UserAvatar({
  fullName = '',
  photoUrl,
  size = 36,
  fontSize,
  borderWidth = 0,
}: UserAvatarProps) {
  const initials = getInitials(fullName);
  const labelSize = fontSize ?? Math.round(size * 0.38);
  const hasPhoto = Boolean(photoUrl?.trim());

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
        },
      ]}
    >
      {hasPhoto ? (
        <Image source={{ uri: photoUrl! }} style={styles.image} contentFit="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: labelSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    // Полупрозрачная зелёная подложка, не сплошная (#ECFDF3) — этот
    // компонент используется и на светлых поверхностях (кольцо аватара
    // на ProfileHero), и на тёмном стекле (HeaderUserActions с dark) —
    // полупрозрачность одинаково хорошо читается на обеих.
    backgroundColor: 'rgba(22, 163, 74, 0.16)',
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});
