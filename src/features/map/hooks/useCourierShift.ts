import { useCallback, useEffect, useRef, useState } from 'react';

import { MOCK_INCOMING_ORDER } from '../constants/mockData';
import type { CourierShiftStatus, IncomingOrder, OrderPaymentStatus } from '../types';

const BLINK_MS = 1000;
const ORDER_DELAY_MS = 3000;
const PAYMENT_DELAY_MS = 2000;

export function useCourierShift() {
  const [status, setStatus] = useState<CourierShiftStatus>('offline');
  const [blinking, setBlinking] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [order, setOrder] = useState<IncomingOrder | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus>('pending');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const scheduleIncomingOrder = useCallback(() => {
    const timer = setTimeout(() => {
      setOrder(MOCK_INCOMING_ORDER);
      setStatus('incoming');
      setToastVisible(false);
    }, ORDER_DELAY_MS);
    timers.current.push(timer);
  }, []);

  const goOnline = useCallback(() => {
    if (status !== 'offline') {
      return;
    }

    clearTimers();
    setStatus('waiting');
    setBlinking(true);
    setToastVisible(true);

    timers.current.push(setTimeout(() => setBlinking(false), BLINK_MS));
    scheduleIncomingOrder();
  }, [clearTimers, scheduleIncomingOrder, status]);

  const declineOrder = useCallback(() => {
    clearTimers();
    setOrder(null);
    setStatus('waiting');
    setToastVisible(true);
    scheduleIncomingOrder();
  }, [clearTimers, scheduleIncomingOrder]);

  const acceptOrder = useCallback(() => {
    clearTimers();
    setStatus('toPickup');
    setToastVisible(false);
  }, [clearTimers]);

  const arriveAtPickup = useCallback(() => {
    clearTimers();
    setStatus('atPickup');
  }, [clearTimers]);

  const confirmPickup = useCallback(() => {
    clearTimers();
    setStatus('toDropoff');
  }, [clearTimers]);

  const arriveAtDropoff = useCallback(() => {
    clearTimers();
    setStatus('awaitingPayment');
    setPaymentStatus('pending');
    timers.current.push(
      setTimeout(() => {
        setPaymentStatus('paid');
        setStatus('completed');
      }, PAYMENT_DELAY_MS),
    );
  }, [clearTimers]);

  const completeOrder = useCallback(() => {
    clearTimers();
    setOrder(null);
    setPaymentStatus('pending');
    setStatus('offline');
    setToastVisible(false);
    setBlinking(false);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    status,
    blinking,
    toastVisible,
    order,
    paymentStatus,
    goOnline,
    declineOrder,
    acceptOrder,
    arriveAtPickup,
    confirmPickup,
    arriveAtDropoff,
    completeOrder,
    isWaiting: status === 'waiting',
    isIncoming: status === 'incoming',
    isToPickup: status === 'toPickup',
    isAtPickup: status === 'atPickup',
    isToDropoff: status === 'toDropoff',
    isAwaitingPayment: status === 'awaitingPayment',
    isCompleted: status === 'completed',
    isActiveTrip: ['toPickup', 'atPickup', 'toDropoff', 'awaitingPayment'].includes(status),
  };
}
