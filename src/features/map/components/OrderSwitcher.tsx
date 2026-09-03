import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

import { DARK, DARK_SHADOW, FONTS, RADIUS, TYPE_SCALE } from '@/constants/theme';
import type { ActiveDelivery } from '@/features/deliveries/types';

type OrderSwitcherProps = {
  items: ActiveDelivery[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/**
 * До двух активных доставок разом (bundle) — этот переключатель
 * появляется только когда их правда две в текущей фазе (см.
 * MapScreen.tsx). Один заказ в работе за раз показывается тем же
 * ActiveTripCard, что и раньше, без переключателя.
 */
export function OrderSwitcher({ items, selectedId, onSelect }: OrderSwitcherProps) {
  if (items.length < 2) {
    return null;
  }

  function handleSelect(id: string) {
    void Haptics.selectionAsync();
    onSelect(id);
  }

  return (
    <BlurView intensity={50} tint="dark" style={[styles.row, DARK_SHADOW.button]}>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => handleSelect(item.id)}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              №{item.display_number}
            </Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: DARK.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DARK.hairline,
    padding: 4,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  pillSelected: {
    backgroundColor: '#16A34A',
  },
  pillText: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.label,
    color: DARK.textSecondary,
  },
  pillTextSelected: {
    color: DARK.textPrimary,
  },
});
