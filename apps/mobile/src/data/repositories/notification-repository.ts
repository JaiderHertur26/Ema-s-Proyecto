import type { SQLiteDatabase } from 'expo-sqlite';

export type NotificationPreferences = {
  dailyNotifications: boolean;
  specialDateNotifications: boolean;
  dailyHour: number;
  dailyMinute: number;
  showLovedOneName: boolean;
};

export type NotificationLovedOne = {
  id: string;
  name: string | null;
  birthDate: string | null;
  deathDate: string | null;
  deathDatePrecision: string;
};

export type NotificationSpecialDate = {
  id: string;
  type: string;
  date: string;
  label: string | null;
};

type PreferencesRow = {
  daily_notifications: number;
  special_date_notifications: number;
  daily_notification_hour: number;
  daily_notification_minute: number;
  notification_show_loved_one_name: number;
};

async function getOwnerId(db: SQLiteDatabase) {
  const profile = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM profiles LIMIT 1'
  );

  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  return profile.id;
}

export async function getNotificationPreferences(
  db: SQLiteDatabase
): Promise<NotificationPreferences> {
  const ownerId = await getOwnerId(db);
  const row = await db.getFirstAsync<PreferencesRow>(
    `SELECT
       daily_notifications,
       special_date_notifications,
       daily_notification_hour,
       daily_notification_minute,
       notification_show_loved_one_name
     FROM user_preferences
     WHERE owner_id = ?`,
    ownerId
  );

  return {
    dailyNotifications: row?.daily_notifications === 1,
    specialDateNotifications: row?.special_date_notifications === 1,
    dailyHour: row?.daily_notification_hour ?? 8,
    dailyMinute: row?.daily_notification_minute ?? 0,
    showLovedOneName: row?.notification_show_loved_one_name === 1,
  };
}

export async function setDailyNotifications(
  db: SQLiteDatabase,
  enabled: boolean
) {
  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET daily_notifications = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    enabled ? 1 : 0,
    now,
    ownerId
  );
}

export async function setSpecialDateNotifications(
  db: SQLiteDatabase,
  enabled: boolean
) {
  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET special_date_notifications = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    enabled ? 1 : 0,
    now,
    ownerId
  );
}

export async function setDailyNotificationTime(
  db: SQLiteDatabase,
  hour: number,
  minute: number
) {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error('La hora de notificación no es válida.');
  }

  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET daily_notification_hour = ?,
            daily_notification_minute = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    hour,
    minute,
    now,
    ownerId
  );
}

export async function setNotificationShowLovedOneName(
  db: SQLiteDatabase,
  enabled: boolean
) {
  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET notification_show_loved_one_name = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    enabled ? 1 : 0,
    now,
    ownerId
  );
}

export async function getActiveLovedOneForNotifications(
  db: SQLiteDatabase
): Promise<NotificationLovedOne | null> {
  return db.getFirstAsync<NotificationLovedOne>(
    `SELECT
       lo.id AS id,
       lo.name AS name,
       lo.birth_date AS birthDate,
       lo.death_date AS deathDate,
       lo.death_date_precision AS deathDatePrecision
     FROM grief_journeys gj
     JOIN loved_ones lo ON lo.id = gj.loved_one_id
     WHERE gj.active = 1
       AND gj.deleted_at IS NULL
       AND lo.deleted_at IS NULL
     LIMIT 1`
  );
}

export async function listFutureSpecialDatesForNotifications(
  db: SQLiteDatabase
): Promise<NotificationSpecialDate[]> {
  const ownerId = await getOwnerId(db);
  const today = new Date().toISOString().slice(0, 10);

  return db.getAllAsync<NotificationSpecialDate>(
    `SELECT
       id,
       type,
       date,
       label
     FROM special_dates
     WHERE owner_id = ?
       AND notify = 1
       AND deleted_at IS NULL
       AND date >= ?
     ORDER BY date ASC`,
    ownerId,
    today
  );
}
