import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

import type { ProfileMenuItem } from '../types';

type ProfileMenuListProps = {
  items: ProfileMenuItem[];
  onItemPress?: (id: ProfileMenuItem['id']) => void;
};

export function ProfileMenuList({ items, onItemPress }: ProfileMenuListProps) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress?.(item.id)}
          style={[styles.row, index < items.length - 1 && styles.rowBorder]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={item.icon} size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
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
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
});
