import { useEffect } from 'react';

import { deliveriesApi } from '@/features/deliveries/api/deliveriesApi';
import {
  handleColdStartNotification,
  setupPushNotificationListeners,
} from '@/services/notifications/pushNotifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/** Глобальные обработчики push — работают на любом экране после входа. */
export function usePushNotificationHandlers() {
  const dispatch = useAppDispatch();
  const { bootstrapped, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!bootstrapped || !isAuthenticated) {
      return;
    }

    const refetchActive = () => {
      void dispatch(
        deliveriesApi.endpoints.getActiveDeliveries.initiate(undefined, { forceRefetch: true }),
      );
    };

    void handleColdStartNotification(refetchActive);
    return setupPushNotificationListeners(refetchActive);
  }, [bootstrapped, isAuthenticated, dispatch]);
}
