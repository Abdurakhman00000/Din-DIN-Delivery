import { useEffect } from 'react';

import { profileApi } from '@/features/profile/api/profileApi';
import { getAccessToken, getRefreshToken, refreshAccessToken } from '@/services/api/tokens';
import { useAppDispatch } from '@/store/hooks';

import { setBootstrapped } from '../store/authSlice';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = await getRefreshToken();
      let authenticated = false;

      if (refreshToken) {
        authenticated = await refreshAccessToken();
      } else {
        authenticated = !!(await getAccessToken());
      }

      if (cancelled) {
        return;
      }

      dispatch(setBootstrapped(authenticated));

      if (authenticated) {
        dispatch(profileApi.endpoints.getCourierMe.initiate(undefined, { forceRefetch: true }));
        const { setupPushNotifications } =
          await import('@/services/notifications/pushNotifications');
        void setupPushNotifications();
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
