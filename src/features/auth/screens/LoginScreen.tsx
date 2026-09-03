import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppLogo } from '@/components/ui/AppLogo';
import { APP_NAME } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { COLORS, DARK, DARK_SHADOW, FONTS, RADIUS, SPACING, TYPE_SCALE } from '@/constants/theme';
import { useLoginMutation } from '@/features/auth/api/authApi';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema';
import { setAuthenticated } from '@/features/auth/store/authSlice';
import { parseAuthError } from '@/features/auth/utils/parseAuthError';
import { profileApi } from '@/features/profile/api/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { getDeviceId } from '@/utils/deviceId';
import {
  formatLocalDigits,
  extractLocalDigits,
  KG_PHONE_PLACEHOLDER,
  normalizePhoneForApi,
} from '@/utils/phone';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToField = (offsetY: number) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: offsetY, animated: true });
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await login({
        phone: normalizePhoneForApi(values.phone),
        password: values.password,
        device_id: await getDeviceId(),
      }).unwrap();

      dispatch(setAuthenticated(true));
      dispatch(profileApi.endpoints.getCourierMe.initiate(undefined, { forceRefetch: true }));
      router.replace(ROUTES.tabs.map);
    } catch (error) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSubmitError(parseAuthError(error));
    }
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            keyboardVisible ? styles.contentKeyboardOpen : styles.contentCentered,
            { paddingBottom: keyboardVisible ? 24 : 32 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, keyboardVisible && styles.heroCompact]}>
            <AppLogo size={keyboardVisible ? 56 : 72} iconSize={keyboardVisible ? 30 : 38} />
            <Text style={[styles.title, keyboardVisible && styles.titleCompact]}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>Вход для курьеров</Text>
          </View>

          <View style={[styles.card, DARK_SHADOW.card]}>
            <Text style={styles.cardTitle}>Вход</Text>
            <Text style={styles.cardHint}>
              Используйте телефон и пароль, которые выдал администратор
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Телефон</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrap, errors.phone && styles.inputWrapError]}>
                    <Ionicons name="call-outline" size={18} color={DARK.textMuted} />
                    <Text style={styles.phonePrefix}>+996</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={KG_PHONE_PLACEHOLDER}
                      placeholderTextColor={DARK.textMuted}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={formatLocalDigits(value)}
                      onChangeText={(text) => onChange(extractLocalDigits(text))}
                      onBlur={onBlur}
                      onFocus={() => scrollToField(80)}
                      editable={!isLoading}
                      maxLength={12}
                    />
                  </View>
                )}
              />
              {errors.phone ? <Text style={styles.error}>{errors.phone.message}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Пароль</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
                    <Ionicons name="lock-closed-outline" size={18} color={DARK.textMuted} />
                    <TextInput
                      style={styles.input}
                      placeholder="Введите пароль"
                      placeholderTextColor={DARK.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onFocus={() => scrollToField(220)}
                      editable={!isLoading}
                    />
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      hitSlop={8}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={DARK.textMuted}
                      />
                    </Pressable>
                  </View>
                )}
              />
              {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
            </View>

            {submitError ? (
              <View style={styles.submitError}>
                <Ionicons name="alert-circle" size={16} color={DARK.danger} />
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                isLoading && styles.buttonDisabled,
                pressed && !isLoading && styles.buttonPressed,
              ]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Войти</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Забыли пароль? Обратитесь к администратору — восстановление доступно только через
            админ-панель.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl - 4,
    paddingTop: SPACING.xl,
  },
  contentCentered: {
    justifyContent: 'center',
  },
  contentKeyboardOpen: {
    justifyContent: 'flex-start',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroCompact: {
    marginBottom: 16,
  },
  title: {
    marginTop: 16,
    fontFamily: FONTS.extrabold,
    fontSize: TYPE_SCALE.display,
    color: DARK.textPrimary,
  },
  titleCompact: {
    marginTop: 10,
    fontSize: TYPE_SCALE.headline + 2,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textSecondary,
  },
  card: {
    backgroundColor: DARK.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl - 4,
    borderWidth: 1,
    borderColor: DARK.hairline,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.title + 2,
    color: DARK.textPrimary,
  },
  cardHint: {
    marginTop: 6,
    marginBottom: SPACING.xl - 4,
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.label,
    lineHeight: 18,
    color: DARK.textSecondary,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    marginBottom: SPACING.sm,
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.label,
    color: DARK.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: DARK.hairline,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: SPACING.md + 2,
    minHeight: 52,
  },
  inputWrapError: {
    borderColor: 'rgba(248,113,113,0.5)',
    backgroundColor: DARK.dangerGlow,
  },
  phonePrefix: {
    fontFamily: FONTS.semibold,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textPrimary,
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.bodyLarge,
    color: DARK.textPrimary,
    paddingVertical: 12,
  },
  error: {
    marginTop: 6,
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.caption,
    color: DARK.danger,
  },
  submitError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: DARK.dangerGlow,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  submitErrorText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: TYPE_SCALE.label,
    lineHeight: 18,
    color: '#FCA5A5',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: TYPE_SCALE.bodyLarge,
  },
  footer: {
    marginTop: SPACING.xl - 4,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: TYPE_SCALE.caption,
    lineHeight: 18,
    color: DARK.textMuted,
    paddingHorizontal: SPACING.sm,
  },
});
