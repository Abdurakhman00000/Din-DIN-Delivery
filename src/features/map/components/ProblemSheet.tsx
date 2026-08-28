import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/theme';
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
export function ProblemSheet({ displayNumber, loading, onConfirm, onCancel }: ProblemSheetProps) {
  const [selected, setSelected] = useState<ProblemType | null>(null);
  const [comment, setComment] = useState('');

  return (
    <View style={styles.sheet}>
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
              onPress={() => setSelected(item.type)}
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
        placeholderTextColor={COLORS.gray400}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <Pressable
        style={[styles.confirm, !selected && styles.confirmDisabled]}
        disabled={!selected || loading}
        onPress={() => selected && onConfirm(selected, comment.trim())}
      >
        <Ionicons name="alert-circle-outline" size={18} color={COLORS.white} />
        <Text style={styles.confirmText}>{loading ? 'Отправляем…' : 'Сообщить'}</Text>
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
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ECFDF3',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray900,
    minHeight: 44,
    marginBottom: 16,
  },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
  },
  confirmDisabled: {
    // gray400, не gray100 — белый текст на gray100 почти не читается
    backgroundColor: COLORS.gray400,
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
