// Feature: история
export { HistoryContent } from './components/HistoryContent';
export type { HistoryPeriod } from './types';

/** @deprecated используйте useSheets / useOptionalSheets из @/features/sheets */
export {
  useSheets as useHistoryUi,
  useOptionalSheets as useOptionalHistoryUi,
} from '@/features/sheets';
