// Локальная история push — Firebase историю не отдаёт, сохраняем сами
// при получении / тапе / синхронизации из системного трея.
//
// На Android title/body иногда пустые в JS (data-only / tray sync) —
// тогда собираем текст из data.type и полей data.

import { getStorageString, setStorageString } from '@/utils/storage';

import type { InboxNotification } from '@/features/notifications/types';

const STORAGE_KEY = 'teyva_notification_inbox';
const MAX_ITEMS = 40;

type HistoryListener = (items: InboxNotification[]) => void;

let cache: InboxNotification[] | null = null;
const listeners = new Set<HistoryListener>();

function notify(items: InboxNotification[]) {
  listeners.forEach((listener) => listener(items));
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function titleFromType(type: string | null): string | null {
  if (type === 'delivery.assigned') {
    return 'Новый заказ';
  }
  if (type === 'bundle.assigned') {
    return 'Новая связка заказов';
  }
  return null;
}

function bodyFromData(data: Record<string, unknown>): string | null {
  const direct =
    asString(data.body) ?? asString(data.message) ?? asString(data.text) ?? asString(data.subtitle);
  if (direct) {
    return direct;
  }

  const number = asString(data.display_number) ?? asString(data.order_number);
  const portions = asString(data.total_portions) ?? asString(data.portions);
  const district = asString(data.district);

  const parts: string[] = [];
  if (number) {
    parts.push(number.startsWith('№') ? number : `№${number}`);
  }
  if (portions) {
    parts.push(`${portions} порций`);
  }
  if (district) {
    parts.push(district);
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

function contentScore(title: string, body: string): number {
  const generic = title === 'Уведомление' ? 0 : title.length;
  return generic + body.length;
}

function dedupeKey(
  item: Pick<InboxNotification, 'type' | 'deliveryId' | 'title' | 'body' | 'id'>,
): string {
  if (item.deliveryId) {
    return `${item.type ?? 'unknown'}:${item.deliveryId}`;
  }
  if (item.id) {
    return `id:${item.id}`;
  }
  return `${item.type ?? 'unknown'}:${item.title}:${item.body}`;
}

function isUsefulItem(
  item: Pick<InboxNotification, 'title' | 'body' | 'type' | 'deliveryId'>,
): boolean {
  if (item.deliveryId || item.type) {
    return true;
  }
  const title = item.title.trim();
  const body = item.body.trim();
  if (!title && !body) {
    return false;
  }
  if (title === 'Уведомление' && !body) {
    return false;
  }
  return true;
}

function pruneUseless(items: InboxNotification[]): InboxNotification[] {
  return items.filter(isUsefulItem);
}

async function readAll(): Promise<InboxNotification[]> {
  if (cache) {
    return cache;
  }

  try {
    const raw = await getStorageString(STORAGE_KEY);
    if (!raw) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(raw) as InboxNotification[];
    cache = pruneUseless(Array.isArray(parsed) ? parsed : []);
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

async function writeAll(items: InboxNotification[]): Promise<void> {
  cache = pruneUseless(items).slice(0, MAX_ITEMS);
  notify(cache);
  try {
    await setStorageString(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // SecureStore лимит — оставляем in-memory.
  }
}

export function subscribeNotificationHistory(listener: HistoryListener): () => void {
  listeners.add(listener);
  void readAll().then((items) => listener(items));
  return () => {
    listeners.delete(listener);
  };
}

export async function getNotificationHistory(): Promise<InboxNotification[]> {
  return readAll();
}

export async function addInboxNotification(input: {
  id?: string;
  title: string | null | undefined;
  body: string | null | undefined;
  type?: string | null;
  deliveryId?: string | null;
  receivedAt?: string;
}): Promise<void> {
  const type = input.type ?? null;
  const deliveryId = input.deliveryId ?? null;
  const title =
    (input.title ?? '').trim() || titleFromType(type) || (deliveryId ? 'Новый заказ' : '');
  const body = (input.body ?? '').trim();
  const receivedAt = input.receivedAt ?? new Date().toISOString();
  const id = input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const candidate: InboxNotification = {
    id,
    title: title || 'Уведомление',
    body,
    type,
    deliveryId,
    receivedAt,
    read: false,
  };

  if (!isUsefulItem(candidate)) {
    return;
  }

  const items = await readAll();
  const key = dedupeKey(candidate);
  const existingIndex = items.findIndex((item) => dedupeKey(item) === key);

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    const keepExisting =
      contentScore(existing.title, existing.body) > contentScore(candidate.title, candidate.body);
    const updated: InboxNotification = keepExisting
      ? { ...existing, receivedAt, read: existing.read }
      : {
          ...existing,
          title: candidate.title,
          body: candidate.body || existing.body,
          type: candidate.type ?? existing.type,
          deliveryId: candidate.deliveryId ?? existing.deliveryId,
          receivedAt,
        };
    const next = [updated, ...items.filter((_, i) => i !== existingIndex)];
    await writeAll(next);
    return;
  }

  await writeAll([candidate, ...items]);
}

export async function markAllNotificationsRead(): Promise<void> {
  const items = await readAll();
  if (items.every((item) => item.read)) {
    return;
  }
  await writeAll(items.map((item) => ({ ...item, read: true })));
}

export function getUnreadCount(items: InboxNotification[]): number {
  return items.filter((item) => !item.read).length;
}

export function extractInboxFields(notification: {
  request: {
    identifier: string;
    content: {
      title?: string | null;
      body?: string | null;
      data?: Record<string, unknown>;
      subtitle?: string | null;
    };
  };
  date?: number;
}): Parameters<typeof addInboxNotification>[0] {
  const content = notification.request.content;
  const data = (content.data ?? {}) as Record<string, unknown>;

  // Android иногда кладёт все значения data строками; иногда title/body только в data.
  const type = asString(data.type);
  const deliveryId =
    asString(data.delivery_id) ?? asString(data.bundle_id) ?? asString(data.deliveryId);

  const title =
    asString(content.title) ??
    asString(data.title) ??
    asString(data.notification_title) ??
    titleFromType(type);

  const body = asString(content.body) ?? asString(content.subtitle) ?? bodyFromData(data);

  return {
    id: notification.request.identifier || undefined,
    title,
    body,
    type,
    deliveryId,
    receivedAt: notification.date
      ? new Date(notification.date).toISOString()
      : new Date().toISOString(),
  };
}
