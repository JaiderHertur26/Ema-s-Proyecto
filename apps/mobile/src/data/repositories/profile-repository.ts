import type { SQLiteDatabase } from 'expo-sqlite';

export type LocalIdentityProfile = {
  id: string;
  remoteUserId: string | null;
};

type ProfileRow = {
  id: string;
  remote_user_id: string | null;
};

export async function getLocalIdentityProfile(
  db: SQLiteDatabase
): Promise<LocalIdentityProfile> {
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT id, remote_user_id FROM profiles LIMIT 1'
  );

  if (!row) {
    throw new Error('No existe un perfil local.');
  }

  return {
    id: row.id,
    remoteUserId: row.remote_user_id,
  };
}

export async function attachRemoteUserId(
  db: SQLiteDatabase,
  remoteUserId: string
): Promise<'attached' | 'already_attached' | 'conflict'> {
  const profile = await getLocalIdentityProfile(db);

  if (profile.remoteUserId === remoteUserId) {
    return 'already_attached';
  }

  if (profile.remoteUserId && profile.remoteUserId !== remoteUserId) {
    return 'conflict';
  }

  const now = new Date().toISOString();

  await db.runAsync(
    'UPDATE profiles SET remote_user_id = ?, updated_at = ? WHERE id = ?',
    remoteUserId,
    now,
    profile.id
  );

  return 'attached';
}
