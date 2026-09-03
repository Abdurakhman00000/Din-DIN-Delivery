import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, DARK, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

import type { CourierProfile, ProfileInfoRow } from '../types';
import { buildProfileInfoRows } from '../utils/profileFormatters';

type ProfileInfoListProps = {
  profile: CourierProfile;
};

type DisplayRow =
  | ProfileInfoRow
  | {
      label: string;
      value: string;
      icon: 'person-outline';
    };

export function ProfileInfoList({ profile }: ProfileInfoListProps) {
  const rows: DisplayRow[] = [
    {
      label: 'Имя',
      value: profile.full_name?.trim() || 'Курьер',
      icon: 'person-outline',
    },
    ...buildProfileInfoRows(profile),
  ];

  return (
    <View style={styles.list}>
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <Ionicons name={row.icon} size={20} color={COLORS.primaryLight} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.value} numberOfLines={2}>
                {row.value}
              </Text>
              <Text style={styles.label}>{row.label}</Text>
            </View>
          </View>
          {index < rows.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    backgroundColor: DARK.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK.hairline,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DARK.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  value: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.caption,
    color: DARK.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DARK.hairline,
    marginLeft: 72,
    marginRight: SPACING.lg,
  },
});
