import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ROUTES } from '@/constants/routes';
import { COLORS, SHADOW } from '@/constants/theme';
import { useLoginMutation } from '@/features/auth/api/authApi';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema';
import { setAuthenticated } from '@/features/auth/store/authSlice';
import { parseAuthError } from '@/features/auth/utils/parseAuthError';
import { profileApi } from '@/features/profile/api/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { getDeviceId } from '@/utils/deviceId';
import { formatLocalDigits, extractLocalDigits, KG_PHONE_PLACEHOLDER, normalizePhoneForApi } from '@/utils/phone';

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
      setSubmitError(parseAuthError(error));
    }
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
            <Text style={[styles.title, keyboardVisible && styles.titleCompact]}>Din Din</Text>
            <Text style={styles.subtitle}>Вход для курьеров</Text>
          </View>

          <View style={[styles.card, SHADOW.soft]}>
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
                    <Ionicons name="call-outline" size={18} color={COLORS.gray400} />
                    <Text style={styles.phonePrefix}>+996</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={KG_PHONE_PLACEHOLDER}
                      placeholderTextColor={COLORS.gray400}
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
                    <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} />
                    <TextInput
                      style={styles.input}
                      placeholder="Введите пароль"
                      placeholderTextColor={COLORS.gray400}
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
                        color={COLORS.gray400}
                      />
                    </Pressable>
                  </View>
                )}
              />
              {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
            </View>

            {submitError ? (
              <View style={styles.submitError}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.submitErrorText}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
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
    backgroundColor: COLORS.milky,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.gray900,
  },
  titleCompact: {
    marginTop: 10,
    fontSize: 26,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: COLORS.gray600,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  cardHint: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.gray600,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.milky,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputWrapError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  phonePrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray900,
    paddingVertical: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: '#DC2626',
  },
  submitError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  submitErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#DC2626',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.gray400,
    paddingHorizontal: 8,
  },
});
