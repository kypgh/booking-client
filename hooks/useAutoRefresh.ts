import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  interval: number;
  queryKeys: string[][];
  enabled?: boolean;
}

export const useAutoRefresh = ({ 
  interval, 
  queryKeys, 
  enabled = true 
}: UseAutoRefreshOptions) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = () => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(refresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled, queryKeys, queryClient]);

  return { refresh };
};

export const REFRESH_CONFIGS = {
  PLANS: {
    interval: 30000, // 30 seconds
    queryKeys: [
      ['packages', 'active'],
      ['subscriptionBookings', 'active'],
      ['packages', 'owned'],
      ['subscriptions', 'owned'],
      ['subscriptionPlans'],
    ],
  },
  BOOKINGS: {
    interval: 15000, // 15 seconds
    queryKeys: [
      ['bookings', 'active'],
      ['bookings', 'history'],
    ],
  },
  SESSIONS: {
    interval: 20000, // 20 seconds
    queryKeys: [
      ['sessions', 'available'],
      ['sessions'],
    ],
  },
};
