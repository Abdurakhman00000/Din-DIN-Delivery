import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { toAvatarSource } from '@/constants/app';
import { COLORS } from '@/constants/theme';

import type { CourierProfile } from '../types';

type ProfileSummaryCardProps = {
  profile: CourierProfile;
};

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Image source={toAvatarSource(profile.avatarUrl)} style={styles.avatar} contentFit="cover" />
      <Text style={styles.name}>{profile.fullName}</Text>
      <View style={styles.badge}>
        <Ionicons name="bicycle-outline" size={14} color={COLORS.primary} />
        <Text style={styles.badgeText}>
          Всего доставок: {profile.totalDeliveries.toLocaleString('ru-RU')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gray100,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
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
});
