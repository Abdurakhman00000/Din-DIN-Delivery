// Типы для активных доставок курьера — зеркалит DeliveryRead бэкенда
// (src/modules/deliveries/schemas.py). Курьер не выбирает и не
// принимает заказ — он приходит уже назначенным, поэтому здесь нет
// "предложения" или его срока действия, только реальная карточка заказа.

export type DeliveryStatus =
  | 'en_route_to_pickup'
  | 'en_route_to_customer'
  | 'delivered'
  | 'problem';

export type TariffType = 'now' | 'preorder_3h' | 'next_day';

export type PaymentMethod = 'cash' | 'online';

/** Ровно 5 типов, как на бэке — `leave_at_reception` не переводит
 * доставку в статус `problem` (это инструкция клиента, не сбой). */
export type ProblemType =
  | 'client_not_answering'
  | 'leave_at_reception'
  | 'return_to_point'
  | 'contact_support'
  | 'other';

export type DeliveryItem = {
  id: string;
  position: number;
  dish_name: string;
  quantity: number;
  portions: number;
  is_checked: boolean;
};

export type ActiveDelivery = {
  id: string;
  external_order_id: string;
  display_number: string;
  pickup_point_id: string;
  courier_id: string | null;
  bundle_id: string | null;
  bundle_position: number | null;
  status: DeliveryStatus;
  tariff: TariffType;
  payment_method: PaymentMethod;
  customer_address: string;
  customer_latitude: number;
  customer_longitude: number;
  customer_phone: string | null;
  customer_comment: string | null;
  district: string | null;
  total_weight_kg: string | null;
  total_portions: number;
  promised_at: string | null;
  ready_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  items: DeliveryItem[];
  // Пока НЕТ на проде (готово на бэке, ждёт отдельного подтверждения
  // выкладки) — координаты и адрес точки выдачи. Все опциональные,
  // фронт должен уметь работать и без них (см. флоу-документ, раздел
  // "Чего пока нет").
  pickup_point_name?: string | null;
  pickup_point_address?: string | null;
  pickup_point_latitude?: number | null;
  pickup_point_longitude?: number | null;
};

export type ChecklistItemIn = {
  item_id: string;
  is_checked: boolean;
};

export type PickedUpRequest = {
  deliveryId: string;
  checklist: ChecklistItemIn[];
};

export type ProblemRequest = {
  deliveryId: string;
  type: ProblemType;
  comment?: string;
};
