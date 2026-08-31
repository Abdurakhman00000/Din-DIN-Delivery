import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { CourierProfile, ProfileInfoRow } from '../types';
import { buildProfileInfoRows } from '../utils/profileFormatters';

type ProfileInfoListProps = {
  profile: CourierProfile;
};

type DisplayRow = ProfileInfoRow | {
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
              <Ionicons name={row.icon} size={20} color={COLORS.primary} />
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
    marginHorizontal: 4,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray400,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginLeft: 72,
    marginRight: 16,
  },
});
