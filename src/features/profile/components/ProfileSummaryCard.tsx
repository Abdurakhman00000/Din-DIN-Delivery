import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { COLORS } from '@/constants/theme';

import type { CourierProfile } from '../types';
import { buildProfileInfoRows, getStatusLabel, getVehicleLabel } from '../utils/profileFormatters';

type ProfileSummaryCardProps = {
  profile: CourierProfile;
};

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const infoRows = buildProfileInfoRows(profile);

  return (
    <View style={styles.card}>
      <UserAvatar
        fullName={profile.full_name ?? ''}
        photoUrl={profile.avatar_url}
        size={96}
        fontSize={28}
        borderWidth={2}
      />

      <Text style={styles.name}>{profile.full_name ?? 'Курьер'}</Text>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Ionicons name="radio-button-on-outline" size={14} color={COLORS.primary} />
          <Text style={styles.badgeText}>{getStatusLabel(profile.status)}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="bicycle-outline" size={14} color={COLORS.primary} />
          <Text style={styles.badgeText}>{getVehicleLabel(profile.vehicle)}</Text>
        </View>
      </View>

      <View style={styles.infoList}>
        {infoRows.map((row, index) => (
          <View key={row.label} style={[styles.infoRow, index < infoRows.length - 1 && styles.infoRowBorder]}>
            <View style={styles.iconWrap}>
              <Ionicons name={row.icon} size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  infoList: {
    alignSelf: 'stretch',
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray400,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
});
