import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/theme';

type AppLogoProps = {
  size?: number;
  iconSize?: number;
};

export function AppLogo({ size = 40, iconSize = 22 }: AppLogoProps) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <MaterialCommunityIcons name="motorbike" size={iconSize} color={COLORS.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
