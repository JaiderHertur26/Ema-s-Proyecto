import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import {
  getActiveLovedOneForNotifications,
  getNotificationPreferences,
  listFutureSpecialDatesForNotifications,
} from '@/data/repositories/notification-repository';

const CHANNEL_ID = 'emaus-gentle';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

type PermissionState = {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
};

export type NotificationScheduleResult = {
  permission: PermissionState;
  scheduledCount: number;
};

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Acompañamiento de EMAÚS',
    description: 'Recordatorios suaves y fechas que tú elijas recordar.',
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    enableVibrate: false,
    vibrationPattern: null,
    showBadge: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.SECRET,
  });
}

export async function getNotificationPermissionState(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return {
      granted: false,
      canAskAgain: false,
      status: 'unsupported',
    };
  }

  const permissions = await Notifications.getPermissionsAsync();

  return {
    granted: permissions.granted,
    canAskAgain: permissions.canAskAgain,
    status: permissions.status,
  };
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return getNotificationPermissionState();
  }

  await ensureAndroidChannel();

  const current = await getNotificationPermissionState();
  if (current.granted || !current.canAskAgain) return current;

  const requested = await Notifications.requestPermissionsAsync();

  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
    status: requested.status,
  };
}

function dateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

function localDate(
  parts: { year: number; month: number; day: number },
  hour: number,
  minute: number
) {
  return new Date(parts.year, parts.month - 1, parts.day, hour, minute, 0, 0);
}

function addDays(
  parts: { year: number; month: number; day: number },
  days: number
) {
  const date = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function addOneMonthClamped(parts: {
  year: number;
  month: number;
  day: number;
}) {
  const targetYear = parts.month === 12 ? parts.year + 1 : parts.year;
  const targetMonth = parts.month === 12 ? 1 : parts.month + 1;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();

  return {
    year: targetYear,
    month: targetMonth,
    day: Math.min(parts.day, lastDay),
  };
}

function personReference(name: string | null, showName: boolean) {
  return showName && name?.trim() ? name.trim() : 'tu ser querido';
}

function privateBody(bodyWithName: string, showName: boolean) {
  if (showName) return bodyWithName;

  return 'EMAÚS está contigo hoy. Si lo deseas, abre la app cuando tengas un momento para ti.';
}

async function scheduleDateNotification(input: {
  identifier: string;
  title: string;
  body: string;
  date: Date;
  kind: string;
}) {
  if (input.date.getTime() <= Date.now() + 30_000) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: input.identifier,
    content: {
      title: input.title,
      body: input.body,
      sound: false,
      data: {
        source: 'emaus',
        kind: input.kind,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.date,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });

  return true;
}

async function scheduleYearlyNotification(input: {
  identifier: string;
  title: string;
  body: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
  kind: string;
}) {
  await Notifications.scheduleNotificationAsync({
    identifier: input.identifier,
    content: {
      title: input.title,
      body: input.body,
      sound: false,
      data: {
        source: 'emaus',
        kind: input.kind,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.YEARLY,
      month: input.month - 1,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

export async function rebuildNotificationSchedule(
  db: SQLiteDatabase,
  options: { requestPermission: boolean }
): Promise<NotificationScheduleResult> {
  if (Platform.OS === 'web') {
    return {
      permission: await getNotificationPermissionState(),
      scheduledCount: 0,
    };
  }

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const preferences = await getNotificationPreferences(db);

  if (
    !preferences.dailyNotifications &&
    !preferences.specialDateNotifications
  ) {
    return {
      permission: await getNotificationPermissionState(),
      scheduledCount: 0,
    };
  }

  const permission = options.requestPermission
    ? await requestNotificationPermission()
    : await getNotificationPermissionState();

  if (!permission.granted) {
    return {
      permission,
      scheduledCount: 0,
    };
  }

  let scheduledCount = 0;

  if (preferences.dailyNotifications) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'emaus-daily',
      content: {
        title: 'Un momento para ti',
        body:
          'EMAÚS está aquí. Si lo deseas, regálate unos minutos de oración, recuerdo o cuidado.',
        sound: false,
        data: {
          source: 'emaus',
          kind: 'daily',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: preferences.dailyHour,
        minute: preferences.dailyMinute,
        channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
      },
    });

    scheduledCount += 1;
  }

  if (preferences.specialDateNotifications) {
    const [lovedOne, specialDates] = await Promise.all([
      getActiveLovedOneForNotifications(db),
      listFutureSpecialDatesForNotifications(db),
    ]);

    if (lovedOne) {
      const reference = personReference(
        lovedOne.name,
        preferences.showLovedOneName
      );

      if (
        lovedOne.deathDate &&
        lovedOne.deathDatePrecision === 'exact'
      ) {
        const death = dateParts(lovedOne.deathDate);

        if (death) {
          const ninthDay = localDate(
            addDays(death, 9),
            preferences.dailyHour,
            preferences.dailyMinute
          );

          if (
            await scheduleDateNotification({
              identifier: 'emaus-nine-days',
              title: 'Un día para caminar con calma',
              body: privateBody(
                `Si te ayuda, hoy puedes recordar a ${reference} con una oración y sin exigirte sentir de una manera concreta.`,
                preferences.showLovedOneName
              ),
              date: ninthDay,
              kind: 'nine_days',
            })
          ) {
            scheduledCount += 1;
          }

          const firstMonth = localDate(
            addOneMonthClamped(death),
            preferences.dailyHour,
            preferences.dailyMinute
          );

          if (
            await scheduleDateNotification({
              identifier: 'emaus-first-month',
              title: 'Memoria y esperanza',
              body: privateBody(
                `Hoy puede ser un momento para recordar a ${reference}, agradecer lo vivido y seguir caminando a tu ritmo.`,
                preferences.showLovedOneName
              ),
              date: firstMonth,
              kind: 'first_month',
            })
          ) {
            scheduledCount += 1;
          }

          await scheduleYearlyNotification({
            identifier: 'emaus-anniversary',
            title: 'Un día de memoria y esperanza',
            body: privateBody(
              `Hoy puedes recordar a ${reference} a tu manera. EMAÚS está aquí si quieres acompañamiento.`,
              preferences.showLovedOneName
            ),
            month: death.month,
            day: death.day,
            hour: preferences.dailyHour,
            minute: preferences.dailyMinute,
            kind: 'anniversary',
          });
          scheduledCount += 1;
        }
      }

      if (lovedOne.birthDate) {
        const birth = dateParts(lovedOne.birthDate);

        if (birth) {
          await scheduleYearlyNotification({
            identifier: 'emaus-birthday',
            title: 'Recordar también puede ser agradecer',
            body: privateBody(
              `Si hoy te hace bien, puedes recordar con gratitud la vida de ${reference}.`,
              preferences.showLovedOneName
            ),
            month: birth.month,
            day: birth.day,
            hour: preferences.dailyHour,
            minute: preferences.dailyMinute,
            kind: 'birthday',
          });
          scheduledCount += 1;
        }
      }
    }

    for (const specialDate of specialDates) {
      const parts = dateParts(specialDate.date);
      if (!parts) continue;

      const when = localDate(
        parts,
        preferences.dailyHour,
        preferences.dailyMinute
      );

      if (
        await scheduleDateNotification({
          identifier: `emaus-special-${specialDate.id}`,
          title: 'Una fecha importante para ti',
          body:
            'EMAÚS está contigo hoy. Si lo deseas, abre la app cuando tengas un momento para ti.',
          date: when,
          kind: 'special_date',
        })
      ) {
        scheduledCount += 1;
      }
    }
  }

  return {
    permission,
    scheduledCount,
  };
}

export async function scheduleTestNotification() {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Las notificaciones locales están disponibles en Android y iPhone.',
    };
  }

  const permission = await requestNotificationPermission();

  if (!permission.granted) {
    return {
      ok: false,
      message:
        permission.canAskAgain
          ? 'No se concedió permiso para notificaciones.'
          : 'Las notificaciones están desactivadas en los ajustes del dispositivo.',
    };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'EMAÚS',
      body: 'Esta es una notificación de prueba. Los recordatorios reales serán igual de discretos.',
      sound: false,
      data: {
        source: 'emaus',
        kind: 'test',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      repeats: false,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });

  return { ok: true, message: null };
}


export async function getScheduledNotificationCount() {
  if (Platform.OS === 'web') return 0;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length;
}
