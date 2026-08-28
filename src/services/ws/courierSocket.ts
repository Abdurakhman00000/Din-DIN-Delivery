// WS /ws/courier — реалтайм-канал только на приём. Рукопожатие первым
// сообщением с токеном (не query-параметром — токен в URL оседает в
// логах прокси), дальше сервер сам шлёт события, клиент только читает.
// См. флоу-документ backend'а, раздел "Реалтайм: WS + push" — то же
// самое описано там текстом, это его реализация.
//
// Держать соединение открытым имеет смысл только пока приложение на
// переднем плане — в фоне ОС (особенно iOS) обрывает сокет достаточно
// быстро, это ограничение платформы, не баг этого класса. За доставку
// событий в фоне отвечает push (см. services/notifications), не этот
// файл. Поэтому подключение/отключение этого сокета должно быть
// завязано на AppState — см. useCourierSession, который им управляет.

import { WS_BASE_URL } from '@/constants/api';

export type CourierSocketEvent =
  | { type: 'delivery.assigned'; data: { delivery_id: string } }
  | { type: 'bundle.assigned'; data: { bundle_id: string } };

type CourierSocketHandlers = {
  /** Пришло реальное событие — сигнал "что-то изменилось", без полных
   * данных (полные данные — всегда через GET /active, см. деливери-api). */
  onEvent: (event: CourierSocketEvent) => void;
  /** Открылось/закрылось — используется для UI-индикатора реалтайма и
   * (при первом открытии/переоткрытии) для триггера сверки через
   * GET /active на случай, если событие было пропущено пока не было
   * соединения. */
  onStatusChange?: (connected: boolean) => void;
};

const AUTH_TIMEOUT_MS = 8_000; // сервер закрывает через 10с, отправляем с запасом
const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 30_000;

export class CourierSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private getToken: () => Promise<string | null>;
  private handlers: CourierSocketHandlers;

  constructor(getToken: () => Promise<string | null>, handlers: CourierSocketHandlers) {
    this.getToken = getToken;
    this.handlers = handlers;
  }

  /** Начинает подключение — и будет само переподключаться при разрывах,
   * пока не вызовут disconnect(). Безопасно звать повторно (no-op, если
   * уже запущено). */
  connect(): void {
    if (!this.stopped) {
      return;
    }
    this.stopped = false;
    this.reconnectAttempt = 0;
    this.open();
  }

  /** Останавливает соединение окончательно — никаких автоматических
   * переподключений после этого, пока не вызовут connect() заново. */
  disconnect(): void {
    this.stopped = true;
    this.clearTimers();
    this.ws?.close();
    this.ws = null;
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.authTimer) {
      clearTimeout(this.authTimer);
      this.authTimer = null;
    }
  }

  private async open(): Promise<void> {
    const token = await this.getToken();
    if (this.stopped || !token) {
      return;
    }

    const socket = new WebSocket(`${WS_BASE_URL}${'/ws/courier'}`);
    this.ws = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ token }));
      // Сервер ждёт ровно одно сообщение-рукопожатие и не подтверждает
      // его отдельно — если после этого нас не закрыли, считаем
      // подключение успешным чуть позже таймаута рукопожатия сервера.
      this.authTimer = setTimeout(() => {
        this.reconnectAttempt = 0;
        this.handlers.onStatusChange?.(true);
      }, AUTH_TIMEOUT_MS / 2);
    };

    socket.onmessage = (event) => {
      const parsed = safeParse(event.data);
      if (parsed && (parsed.type === 'delivery.assigned' || parsed.type === 'bundle.assigned')) {
        this.handlers.onEvent(parsed as CourierSocketEvent);
      }
    };

    socket.onerror = () => {
      // onclose всегда следует за onerror для WebSocket — переподключение
      // планируем там один раз, не здесь тоже (иначе задвоится).
    };

    socket.onclose = () => {
      this.ws = null;
      this.handlers.onStatusChange?.(false);
      if (!this.stopped) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    this.clearTimers();
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_MS,
    );
    // Небольшой джиттер, чтобы много клиентов не переподключались хором
    // одной и той же секундой после общего сбоя сети/сервера.
    const jitter = Math.random() * 500;
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      if (!this.stopped) {
        this.open();
      }
    }, delay + jitter);
  }
}

function safeParse(raw: unknown): { type?: string } | null {
  if (typeof raw !== 'string') {
    return null;
  }
  try {
    return JSON.parse(raw) as { type?: string };
  } catch {
    return null;
  }
}
