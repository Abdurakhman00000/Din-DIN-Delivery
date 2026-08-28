import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import type { DeliveryItem } from '@/features/deliveries/types';

type ChecklistSheetProps = {
  items: DeliveryItem[];
  loading: boolean;
  onConfirm: (checked: Record<string, boolean>) => void;
  onCancel: () => void;
};

/**
 * Бэкенд требует чек-лист **всех** позиций заказа, все is_checked: true
 * — иначе 422 (см. флоу-документ, "не хватает товара, забирать нельзя").
 * Поэтому кнопка подтверждения недоступна, пока не отмечено всё —
 * не даём отправить заведомо невалидный запрос.
 */
export function ChecklistSheet({ items, loading, onConfirm, onCancel }: ChecklistSheetProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = items.length > 0 && items.every((item) => checked[item.id]);

  return (
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>Сверьте заказ</Text>
      <Text style={styles.subtitle}>Отметьте всё, что забираете — иначе заказ не отметится</Text>

      <View style={styles.list}>
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : null}
              </View>
              <Text style={styles.itemName}>{item.dish_name}</Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.confirm, !allChecked && styles.confirmDisabled]}
        disabled={!allChecked || loading}
        onPress={() => onConfirm(checked)}
      >
        <Text style={styles.confirmText}>{loading ? 'Отправляем…' : 'Забрал'}</Text>
      </Pressable>
      <Pressable onPress={onCancel} style={styles.cancel} disabled={loading}>
        <Text style={styles.cancelText}>Отмена</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray400,
    marginTop: 4,
    marginBottom: 12,
  },
  list: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  itemQty: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  confirm: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmDisabled: {
    backgroundColor: COLORS.gray100,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray400,
  },
});
