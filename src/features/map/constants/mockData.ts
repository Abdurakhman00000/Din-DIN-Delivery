// Мок-данные карты (заменятся ответом API)
import type { IncomingOrder, MapPlace } from '../types';
import { BISHKEK_CENTER } from './bishkek';

export const MOCK_MAP_STATS = {
  activeOrders: '2,2',
  rating: '3,4',
} as const;

export const MOCK_PLACES: MapPlace[] = [
  { id: '1', name: 'ЦУМ', address: 'пр. Чуй, 155, Бишкек' },
  { id: '2', name: 'Площадь Ала-Тоо', address: 'пр. Чуй, Бишкек' },
  { id: '3', name: 'Asia Mall', address: 'ул. Горького, 1/2, Бишкек' },
  { id: '4', name: 'Дордой Плаза', address: 'ул. Ибраимова, 115, Бишкек' },
  { id: '5', name: 'Филармония', address: 'пр. Чуй, 253, Бишкек' },
  { id: '6', name: 'Ошский рынок', address: 'ул. Суюмбаева, Бишкек' },
  { id: '7', name: 'Вефа Центр', address: 'ул. Льва Толстого, 10, Бишкек' },
  { id: '8', name: 'ТЦ Бета Сторес', address: 'ул. Чокморова, 127, Бишкек' },
  { id: '9', name: 'АУЦА', address: 'ул. Аалы Токомбаева, 7/6, Бишкек' },
  { id: '10', name: 'Национальный госпиталь', address: 'ул. Тоголок Молдо, 1, Бишкек' },
  { id: '11', name: 'Парк Панфилова', address: 'ул. Пушкина, Бишкек' },
  { id: '12', name: 'Аэропорт Манас', address: 'аэропорт Манас, Бишкек' },
];

export const MOCK_INCOMING_ORDER: IncomingOrder = {
  id: 'order-demo-1',
  priceLabel: '450 ₽',
  durationLabel: '12 мин',
  distanceLabel: '2.4 км',
  deliveryDurationLabel: '8 мин',
  deliveryDistanceLabel: '1.8 км',
  pickupLabel: 'Забор',
  pickupAddress: 'ПВЗ №42, ул. Советская 12',
  dropoffLabel: 'Доставка',
  dropoffAddress: 'ул. Киевская 114, кв. 15',
  comment: 'Позвонить за 5 минут до приезда',
  earningsLabel: '450 ₽',
  commissionLabel: '45 ₽',
  courier: { latitude: BISHKEK_CENTER.latitude, longitude: BISHKEK_CENTER.longitude },
  pickup: { latitude: 42.8824, longitude: 74.5822 },
  dropoff: { latitude: 42.8681, longitude: 74.6038 },
};
