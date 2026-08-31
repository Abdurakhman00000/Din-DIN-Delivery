export type InboxNotification = {
  id: string;
  title: string;
  body: string;
  type: string | null;
  deliveryId: string | null;
  receivedAt: string;
  read: boolean;
};
