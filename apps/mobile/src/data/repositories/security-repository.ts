import type { SQLiteDatabase } from 'expo-sqlite';

export type SecurityPreferences = {
  biometricLock: boolean;
  protectScreenCapture: boolean;
};

type SecurityPreferencesRow = {
  biometric_lock: number;
  protect_screen_capture: number;
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

export async function getSecurityPreferences(
  db: SQLiteDatabase
): Promise<SecurityPreferences> {
  const ownerId = await getOwnerId(db);
  const row = await db.getFirstAsync<SecurityPreferencesRow>(
    `SELECT biometric_lock, protect_screen_capture
       FROM user_preferences
      WHERE owner_id = ?`,
    ownerId
  );

  return {
    biometricLock: row?.biometric_lock === 1,
    protectScreenCapture: row?.protect_screen_capture === 1,
  };
}

export async function setBiometricLock(
  db: SQLiteDatabase,
  enabled: boolean
) {
  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET biometric_lock = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    enabled ? 1 : 0,
    now,
    ownerId
  );
}

export async function setProtectScreenCapture(
  db: SQLiteDatabase,
  enabled: boolean
) {
  const ownerId = await getOwnerId(db);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_preferences
        SET protect_screen_capture = ?,
            updated_at = ?
      WHERE owner_id = ?`,
    enabled ? 1 : 0,
    now,
    ownerId
  );
}
