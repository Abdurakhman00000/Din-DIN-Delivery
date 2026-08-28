import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, SHADOW } from '@/constants/theme';
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

  return (
    <View style={[styles.row, SHADOW.soft]}>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
              №{item.display_number}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  pillTextSelected: {
    color: COLORS.white,
  },
});
