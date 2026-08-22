// Типы для раздела «История»

export type HistoryPeriod = 'today' | 'week' | 'month';

export type HistoryOrderStatus = 'delivered';

export type HistoryOrder = {
  id: string;
  address: string;
  deliveredAtLabel: string;
  earningsLabel: string;
  status: HistoryOrderStatus;
};

export type HistorySummary = {
  title: string;
  amountLabel: string;
};

export type HistoryResponse = {
  period: HistoryPeriod;
  summary: HistorySummary;
  orders: HistoryOrder[];
};
