import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import type { ProblemType } from '@/features/deliveries/types';

const PROBLEM_LABELS: { type: ProblemType; label: string }[] = [
  { type: 'client_not_answering', label: 'Клиент не отвечает' },
  { type: 'leave_at_reception', label: 'Оставить на ресепшене' },
  { type: 'return_to_point', label: 'Вернуть на точку' },
  { type: 'contact_support', label: 'Связаться с поддержкой' },
  { type: 'other', label: 'Другое' },
];

type ProblemSheetProps = {
  displayNumber: string;
  loading: boolean;
  /** Сообщение backend'а на 409 (заказ уже не в статусе, из которого
   * можно сообщить о проблеме) — null, пока ошибки нет. */
  error?: string | null;
  onConfirm: (type: ProblemType, comment: string) => void;
  onCancel: () => void;
};

/**
 * `leave_at_reception` — единственный тип, который не переводит заказ
 * в problem (см. deliveries/schemas.py::ProblemReportIn) — курьер
 * после него продолжает как обычно и сам вызывает /delivered. Остальные
 * четыре закрывают заказ для курьера сразу (см. MapScreen.tsx —
 * доставка пропадает из GET /active после любого из них).
 */
export function ProblemSheet({
  displayNumber,
  loading,
  error,
  onConfirm,
  onCancel,
}: ProblemSheetProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ProblemType | null>(null);
  const [comment, setComment] = useState('');

  function handleSelect(type: ProblemType) {
    void Haptics.selectionAsync();
    setSelected(type);
  }

  function handleConfirm() {
    if (!selected) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(selected, comment.trim());
  }

  return (
    <BlurView
      intensity={70}
      tint="dark"
      style={[styles.sheet, DARK_SHADOW.card, { paddingBottom: insets.bottom + SPACING.lg }]}
    >
      <View style={styles.handle} />
      <Text style={styles.title}>Проблема с заказом №{displayNumber}</Text>
      <Text style={styles.subtitle}>Выберите, что случилось</Text>

      <View style={styles.list}>
        {PROBLEM_LABELS.map((item) => {
          const isSelected = item.type === selected;
          return (
            <Pressable
              key={item.type}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => handleSelect(item.type)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.rowText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Комментарий (необязательно)"
        placeholderTextColor={DARK.textMuted}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.confirm, !selected && styles.confirmDisabled]}
        disabled={!selected || loading}
        onPress={handleConfirm}
      >
        <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
        <Text style={styles.confirmText}>{loading ? 'Отправляем…' : 'Сообщить'}</Text>
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
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DARK.hairline,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rowSelected: {
    borderColor: '#22C55E',
    backgroundColor: DARK.primaryGlow,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DARK.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#22C55E',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  rowText: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: DARK.hairline,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.body,
    color: DARK.textPrimary,
    minHeight: 44,
    marginBottom: SPACING.lg,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    minHeight: 56,
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
