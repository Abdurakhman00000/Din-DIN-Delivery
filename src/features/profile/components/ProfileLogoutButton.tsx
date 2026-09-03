import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { DARK, FONTS, RADIUS, TYPE_SCALE } from '@/constants/theme';

type ProfileLogoutButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function ProfileLogoutButton({
  onPress,
  loading = false,
  disabled = false,
}: ProfileLogoutButtonProps) {
  function handlePress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        (loading || disabled) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
      ]}
      onPress={handlePress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={DARK.danger} />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={18} color={DARK.danger} />
          <Text style={styles.text}>Выйти из аккаунта</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DARK.dangerGlow,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: RADIUS.lg,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.danger,
  },
});
