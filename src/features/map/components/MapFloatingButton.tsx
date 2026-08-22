import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SHADOW } from '@/constants/theme';

type MapCircleButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
};

export function MapCircleButton({
  icon,
  onPress,
  size = 48,
  iconSize = 22,
}: MapCircleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        SHADOW.soft,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={COLORS.gray900} />
    </Pressable>
  );
}

type MapFloatingPanelProps = {
  children: ReactNode;
};

export function MapFloatingPanel({ children }: MapFloatingPanelProps) {
  return <View style={[styles.panel, SHADOW.soft]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  panel: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
