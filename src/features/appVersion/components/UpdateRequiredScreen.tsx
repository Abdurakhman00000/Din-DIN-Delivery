import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/components/ui/AppLogo';
import { COLORS, SHADOW } from '@/constants/theme';

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
      <View style={styles.content}>
        <AppLogo />
        <View style={[styles.iconWrap, SHADOW.soft]}>
          <Ionicons name="arrow-up-circle-outline" size={36} color={COLORS.primary} />
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
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
