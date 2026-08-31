/* Reanimated shared values are mutated on the UI thread. */
/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, Pressable } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const OPEN_MS = 340;
const CLOSE_MS = 380;
const OPEN_EASING = Easing.out(Easing.cubic);
const CLOSE_EASING = Easing.inOut(Easing.cubic);

type SwipeSheetProps = {
  visible: boolean;
  /** Запрос на закрытие (backdrop) — родитель ставит visible=false */
  onClose: () => void;
  /** После полной анимации закрытия и размонтирования */
  onClosed?: () => void;
  title: string;
  heightRatio?: number;
  closeOnBackdropPress?: boolean;
  children: ReactNode;
};

/**
 * Единая нижняя шторка:
 * - плавное открытие/закрытие (easing, без рывков)
 * - свайп вниз с любой части листа
 * - тап по затемнению
 */
export function SwipeSheet({
  visible,
  onClose,
  onClosed,
  title,
  heightRatio = 0.72,
  closeOnBackdropPress = true,
  children,
}: SwipeSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetHeight = SCREEN_HEIGHT * heightRatio;

  const translateY = useSharedValue(sheetHeight);
  const dragStartY = useSharedValue(0);
  const closingFromGesture = useSharedValue(false);
  const sheetHeightSV = useSharedValue(sheetHeight);

  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    sheetHeightSV.value = sheetHeight;
  }, [sheetHeight, sheetHeightSV]);

  const finishClose = useCallback(() => {
    setMounted(false);
    onClosed?.();
  }, [onClosed]);

  const requestClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      closingFromGesture.value = false;
      setMounted(true);
      translateY.value = withTiming(0, { duration: OPEN_MS, easing: OPEN_EASING });
      return;
    }

    if (!mounted) {
      return;
    }

    // Жест уже дотягивает анимацию сам — не запускаем вторую.
    if (closingFromGesture.value) {
      return;
    }

    translateY.value = withTiming(
      sheetHeight,
      { duration: CLOSE_MS, easing: CLOSE_EASING },
      (finished) => {
        if (finished) {
          runOnJS(finishClose)();
        }
      },
    );
  }, [visible, sheetHeight, mounted, closingFromGesture, translateY, finishClose]);

  const pan = Gesture.Pan()
    .activeOffsetY(14)
    .failOffsetX([-28, 28])
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = dragStartY.value + event.translationY;
      translateY.value = Math.max(0, next);
    })
    .onEnd((event) => {
      const height = sheetHeightSV.value;
      const progress = height > 0 ? translateY.value / height : 0;
      const shouldClose = progress > 0.18 || translateY.value > 110 || event.velocityY > 700;

      if (shouldClose) {
        closingFromGesture.value = true;
        // Анимация на UI-потоке от текущей позиции — без рывка.
        translateY.value = withTiming(
          height,
          { duration: CLOSE_MS, easing: CLOSE_EASING },
          (finished) => {
            if (finished) {
              runOnJS(requestClose)();
              runOnJS(finishClose)();
            }
          },
        );
      } else {
        translateY.value = withSpring(0, {
          damping: 26,
          stiffness: 260,
          mass: 0.9,
        });
      }
    });

  const composed = Gesture.Simultaneous(pan, Gesture.Native());

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeightSV.value], [0.42, 0], 'clamp'),
  }));

  if (!mounted) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={closeOnBackdropPress ? requestClose : undefined}
        accessible={false}
      >
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
      </Pressable>

      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { height: sheetHeight, paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.body}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  title: {
    alignSelf: 'stretch',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
});
