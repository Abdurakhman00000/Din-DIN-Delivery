import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/ui/AppLogo';
import { COLORS, DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';

type UpdateRequiredScreenProps = {
  minSupported: string | null;
  updateUrl: string | null;
};

/**
 * Единственный экран, который курьер видит, если его сборка ниже
 * `min_supported` — заменяет собой весь Stack (см. app/_layout.tsx),
 * даже логин недоступен, как того требует бэк ("не пускать даже до
 * экрана ввода телефона").
 */
export function UpdateRequiredScreen({ minSupported, updateUrl }: UpdateRequiredScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <AppLogo />
        <View style={[styles.iconWrap, DARK_SHADOW.glow(COLORS.primary)]}>
          <Ionicons name="arrow-up-circle" size={36} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.title}>Нужно обновить приложение</Text>
        <Text style={styles.subtitle}>
          {minSupported
            ? `Эта версия больше не поддерживается — минимальная версия ${minSupported}.`
            : 'Эта версия больше не поддерживается.'}{' '}
          Обновите приложение, чтобы продолжить работу.
        </Text>
        {updateUrl ? (
          <Pressable
            style={styles.button}
            onPress={() => {
              Linking.openURL(updateUrl);
            }}
          >
            <Text style={styles.buttonText}>Обновить</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: DARK.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.title + 2,
    color: DARK.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.body,
    color: DARK.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: SPACING.sm,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
  },
});
