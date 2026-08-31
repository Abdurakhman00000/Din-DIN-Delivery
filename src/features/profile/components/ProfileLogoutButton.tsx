import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

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
  return (
    <Pressable
      style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color="#DC2626" />
      ) : (
        <>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
});
