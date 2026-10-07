import { type PropsWithChildren, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { rebuildNotificationSchedule } from './notification-service';

export function NotificationProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();

  useEffect(() => {
    let active = true;

    rebuildNotificationSchedule(db, { requestPermission: false })
      .catch(() => undefined)
      .finally(() => {
        if (!active) return;
      });

    return () => {
      active = false;
    };
  }, [db]);

  return children;
}
