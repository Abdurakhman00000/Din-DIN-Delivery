// Типы для раздела «Карта»
import type { AvatarSource } from '@/constants/app';

export type CourierMapStats = {
  activeOrders: string;
  rating: string;
};

export type CourierOnlineStatus = {
  isOnline: boolean;
};

export type CourierProfilePreview = {
  avatarUrl: AvatarSource;
  fullName: string;
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

export type CourierShiftStatus =
  | 'offline'
  | 'waiting'
  | 'incoming'
  | 'toPickup'
  | 'atPickup'
  | 'toDropoff'
  | 'awaitingPayment'
  | 'completed';

export type OrderPaymentStatus = 'pending' | 'paid' | 'unpaid';

export type IncomingOrder = {
  id: string;
  priceLabel: string;
  durationLabel: string;
  distanceLabel: string;
  deliveryDurationLabel: string;
  deliveryDistanceLabel: string;
  pickupLabel: string;
  pickupAddress: string;
  dropoffLabel: string;
  dropoffAddress: string;
  comment: string;
  earningsLabel: string;
  commissionLabel: string;
  courier: MapCoordinate;
  pickup: MapCoordinate;
  dropoff: MapCoordinate;
};
