export type LocationPing = {
  recorded_at: string;
  latitude: number;
  longitude: number;
  accuracy_m?: number;
  speed_kmh?: number;
  heading?: number;
  delivery_id?: string;
};
