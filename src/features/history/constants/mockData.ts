// Мок-данные истории (заменятся ответом API)
import type { HistoryPeriod, HistoryResponse } from '../types';

export const MOCK_HISTORY: Record<HistoryPeriod, HistoryResponse> = {
  today: {
    period: 'today',
    summary: {
      title: 'Доставок сегодня',
      deliveriesCount: 4,
      portionsLabel: '11 порций',
    },
    orders: [
      {
        id: '1',
        address: 'ул. Ленина, 15, кв 42',
        deliveredAtLabel: 'Сегодня, 14:30',
        portionsLabel: '3 порции',
        status: 'delivered',
      },
      {
        id: '2',
        address: 'пр. Чуй, 88',
        deliveredAtLabel: 'Сегодня, 13:10',
        portionsLabel: '2 порции',
        status: 'delivered',
      },
      {
        id: '3',
        address: 'ул. Киевская, 102',
        deliveredAtLabel: 'Сегодня, 11:45',
        portionsLabel: '4 порции',
        status: 'delivered',
      },
      {
        id: '4',
        address: 'мкр. Джал, 12/3',
        deliveredAtLabel: 'Сегодня, 09:20',
        portionsLabel: '2 порции',
        status: 'delivered',
      },
    ],
  },
  week: {
    period: 'week',
    summary: {
      title: 'Доставок за неделю',
      deliveriesCount: 2,
      portionsLabel: '5 порций',
    },
    orders: [
      {
        id: '5',
        address: 'ул. Ибраимова, 4',
        deliveredAtLabel: 'Вчера, 18:40',
        portionsLabel: '3 порции',
        status: 'delivered',
      },
      {
        id: '6',
        address: 'ул. Токтогула, 21',
        deliveredAtLabel: 'Пн, 16:05',
        portionsLabel: '2 порции',
        status: 'delivered',
      },
    ],
  },
  month: {
    period: 'month',
    summary: {
      title: 'Доставок за месяц',
      deliveriesCount: 1,
      portionsLabel: '3 порции',
    },
    orders: [
      {
        id: '7',
        address: 'ул. Ахунбаева, 90',
        deliveredAtLabel: '12 авг, 15:12',
        portionsLabel: '3 порции',
        status: 'delivered',
      },
    ],
  },
};
