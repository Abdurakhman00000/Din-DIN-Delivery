// Мок-данные истории (заменятся ответом API)
import type { HistoryPeriod, HistoryResponse } from '../types';

export const MOCK_HISTORY: Record<HistoryPeriod, HistoryResponse> = {
  today: {
    period: 'today',
    summary: {
      title: 'Заработано сегодня',
      amountLabel: '3 450 ₽',
    },
    orders: [
      {
        id: '1',
        address: 'ул. Ленина, 15, кв 42',
        deliveredAtLabel: 'Сегодня, 14:30',
        earningsLabel: '450 ₽',
        status: 'delivered',
      },
      {
        id: '2',
        address: 'пр. Чуй, 88',
        deliveredAtLabel: 'Сегодня, 13:10',
        earningsLabel: '380 ₽',
        status: 'delivered',
      },
      {
        id: '3',
        address: 'ул. Киевская, 102',
        deliveredAtLabel: 'Сегодня, 11:45',
        earningsLabel: '520 ₽',
        status: 'delivered',
      },
      {
        id: '4',
        address: 'мкр. Джал, 12/3',
        deliveredAtLabel: 'Сегодня, 09:20',
        earningsLabel: '410 ₽',
        status: 'delivered',
      },
    ],
  },
  week: {
    period: 'week',
    summary: {
      title: 'Заработано за неделю',
      amountLabel: '18 200 ₽',
    },
    orders: [
      {
        id: '5',
        address: 'ул. Ибраимова, 4',
        deliveredAtLabel: 'Вчера, 18:40',
        earningsLabel: '470 ₽',
        status: 'delivered',
      },
      {
        id: '6',
        address: 'ул. Токтогула, 21',
        deliveredAtLabel: 'Пн, 16:05',
        earningsLabel: '390 ₽',
        status: 'delivered',
      },
    ],
  },
  month: {
    period: 'month',
    summary: {
      title: 'Заработано за месяц',
      amountLabel: '72 800 ₽',
    },
    orders: [
      {
        id: '7',
        address: 'ул. Ахунбаева, 90',
        deliveredAtLabel: '12 авг, 15:12',
        earningsLabel: '430 ₽',
        status: 'delivered',
      },
    ],
  },
};
