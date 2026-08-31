import { useOptionalSheets } from '@/features/sheets';

/** Карта (WebView) не должна получать жесты, пока открыта любая глобальная шторка. */
export function useGlobalOverlayOpen(): boolean {
  return !!useOptionalSheets()?.isOpen;
}
