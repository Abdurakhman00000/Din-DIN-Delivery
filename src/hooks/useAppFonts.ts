import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';

/** Грузит Inter (см. constants/theme.ts::FONTS) — вызывать один раз в
 * корневом layout, до первого рендера настоящего UI: `loaded === false`
 * — считанные секунды на холодном старте, дальше кешируется системой. */
export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  return loaded;
}
