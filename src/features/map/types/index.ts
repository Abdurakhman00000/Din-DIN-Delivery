// Типы для раздела «Карта». Состояние смены/заказа теперь берётся из
// features/shifts (useCourierSession) и features/deliveries — здесь
// остаётся только то, что относится к самой карте.

export type CourierMapStats = {
  activeOrders: string;
  rating: string;
};

export type MapPlace = {
  id: string;
  name: string;
  address: string;
};

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};
