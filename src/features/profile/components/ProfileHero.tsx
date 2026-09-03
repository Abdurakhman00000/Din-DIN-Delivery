import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserAvatar } from '@/components/ui/UserAvatar';
import { COLORS, DARK, DARK_SHADOW, FONTS, RADIUS, TYPE_SCALE } from '@/constants/theme';

import type { CourierProfile, CourierWorkStatus } from '../types';
import { getStatusLabel, getVehicleLabel } from '../utils/profileFormatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = 120;

type ProfileHeroProps = {
  profile: CourierProfile;
};

function statusAccent(status: CourierWorkStatus): string {
  if (status === 'online') {
    return COLORS.primaryLight;
  }
  if (status === 'suspended') {
    return DARK.danger;
  }
  return DARK.textSecondary;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const insets = useSafeAreaInsets();
  const name = profile.full_name?.trim() || 'Курьер';
  const statusColor = statusAccent(profile.status);
  const headerHeight = insets.top + 168;

  return (
    <View style={styles.wrap}>
      <View style={[styles.headerClip, { height: headerHeight + AVATAR_SIZE / 2 }]}>
        <LinearGradient
          colors={['#166534', COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
          locations={[0, 0.28, 0.62, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={[
            styles.gradient,
            {
              height: headerHeight,
              paddingTop: insets.top + 14,
              borderBottomLeftRadius: SCREEN_WIDTH * 0.5,
              borderBottomRightRadius: SCREEN_WIDTH * 0.5,
            },
          ]}
        >
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
        </LinearGradient>

        <View style={styles.avatarAnchor}>
          <View style={[styles.avatarRing, DARK_SHADOW.card]}>
            <UserAvatar
              fullName={name}
              photoUrl={profile.avatar_url}
              size={AVATAR_SIZE - 10}
              fontSize={34}
              borderWidth={0}
            />
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.metaText, { color: statusColor }]}>
            {getStatusLabel(profile.status)}
          </Text>
        </View>

        <View style={styles.metaChip}>
          <Ionicons
            name={profile.vehicle === 'foot' ? 'walk-outline' : 'bicycle-outline'}
            size={16}
            color={COLORS.primaryLight}
          />
          <Text style={styles.metaTextDark}>{getVehicleLabel(profile.vehicle)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: DARK.bg,
  },
  headerClip: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    overflow: 'visible',
  },
  gradient: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.headline - 2,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  avatarAnchor: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: COLORS.white,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DARK.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: DARK.hairline,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaText: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.label,
  },
  metaTextDark: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.label,
    color: DARK.textPrimary,
  },
});
