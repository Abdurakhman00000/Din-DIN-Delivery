import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DARK, DARK_SHADOW, RADIUS } from '@/constants/theme';

type MapCircleButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
};

export function MapCircleButton({ icon, onPress, size = 44, iconSize = 20 }: MapCircleButtonProps) {
  function handlePress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <Pressable onPress={handlePress} hitSlop={6}>
      {({ pressed }) => (
        <BlurView
          intensity={50}
          tint="dark"
          style={[
            styles.button,
            DARK_SHADOW.button,
            { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name={icon} size={iconSize} color={DARK.textPrimary} />
        </BlurView>
      )}
    </Pressable>
  );
}

type MapFloatingPanelProps = {
  children: ReactNode;
};

export function MapFloatingPanel({ children }: MapFloatingPanelProps) {
  return (
    <BlurView intensity={50} tint="dark" style={[styles.panel, DARK_SHADOW.button]}>
      {children}
    </BlurView>
  );
}

/** Разделитель между кнопками внутри MapFloatingPanel (например зум +/−). */
export function MapFloatingDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK.hairline,
    backgroundColor: DARK.glass,
    overflow: 'hidden',
  },
  panel: {
    backgroundColor: DARK.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: DARK.hairline,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: DARK.hairline,
    marginHorizontal: 6,
  },
});
