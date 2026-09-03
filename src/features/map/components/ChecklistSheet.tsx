import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import type { DeliveryItem } from '@/features/deliveries/types';

type ChecklistSheetProps = {
  items: DeliveryItem[];
  displayNumber: string;
  loading: boolean;
  /** Сообщение backend'а на 422 (чек-лист неполный/не совпал состав)
   * или 409 (заказ уже не в том статусе) — null, пока ошибки нет. */
  error?: string | null;
  onConfirm: (checked: Record<string, boolean>) => void;
  onCancel: () => void;
};

/**
 * Бэкенд требует чек-лист **всех** позиций заказа, все is_checked: true
 * — иначе 422 (см. флоу-документ, "не хватает товара, забирать нельзя").
 * Поэтому кнопка подтверждения недоступна, пока не отмечено всё —
 * не даём отправить заведомо невалидный запрос.
 *
 * `displayNumber` в заголовке — не украшение: при бандле из двух
 * заказов курьер сверяет чек-лист для каждого отдельно (см.
 * MapScreen.tsx), и должен точно видеть, какой из двух сейчас перед ним.
 */
export function ChecklistSheet({
  items,
  displayNumber,
  loading,
  error,
  onConfirm,
  onCancel,
}: ChecklistSheetProps) {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = items.length > 0 && items.every((item) => checked[item.id]);

  function toggle(id: string) {
    void Haptics.selectionAsync();
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleConfirm() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(checked);
  }

  return (
    <BlurView
      intensity={70}
      tint="dark"
      style={[styles.sheet, DARK_SHADOW.card, { paddingBottom: insets.bottom + SPACING.lg }]}
    >
      <View style={styles.handle} />
      <Text style={styles.title}>Сверьте заказ №{displayNumber}</Text>
      <Text style={styles.subtitle}>Отметьте всё, что забираете — иначе заказ не отметится</Text>

      <View style={styles.list}>
        {items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <Pressable key={item.id} style={styles.row} onPress={() => toggle(item.id)}>
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.itemName}>{item.dish_name}</Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.confirm, !allChecked && styles.confirmDisabled]}
        disabled={!allChecked || loading}
        onPress={handleConfirm}
      >
        <Text style={styles.confirmText}>{loading ? 'Отправляем…' : 'Забрал'}</Text>
      </Pressable>
      <Pressable onPress={onCancel} style={styles.cancel} disabled={loading}>
        <Text style={styles.cancelText}>Отмена</Text>
      </Pressable>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: DARK.glass,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: DARK.hairline,
    borderBottomWidth: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DARK.hairlineStrong,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.title,
    color: DARK.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.label,
    color: DARK.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  list: {
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DARK.hairline,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: DARK.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemName: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textPrimary,
  },
  itemQty: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.body,
    color: DARK.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: DARK.dangerGlow,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    color: '#FCA5A5',
    lineHeight: 18,
  },
  confirm: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  confirmDisabled: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  confirmText: {
    color: '#FFFFFF',
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.bodyLarge,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelText: {
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.body,
    color: DARK.textMuted,
  },
});
