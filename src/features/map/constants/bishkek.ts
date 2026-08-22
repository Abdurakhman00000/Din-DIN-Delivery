// Координаты и регион карты Бишкека
export const BISHKEK_CENTER = {
  latitude: 42.8746,
  longitude: 74.5698,
} as const;

export const BISHKEK_REGION = {
  ...BISHKEK_CENTER,
  latitudeDelta: 0.045,
  longitudeDelta: 0.045,
} as const;
