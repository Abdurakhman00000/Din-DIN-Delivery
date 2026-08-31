export type SheetId = 'history' | 'notifications';

export type SheetConfig = {
  id: SheetId;
  title: string;
  heightRatio: number;
};
