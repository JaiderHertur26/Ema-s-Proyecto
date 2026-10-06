import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { enqueueSync } from './sync-repository';

export async function logPrayer(
  db: SQLiteDatabase,
  lovedOneId: string | null,
  prayerType: string,
  note: string | null = null
) {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles LIMIT 1');
  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO prayer_logs (
        id, owner_id, loved_one_id, prayer_type, note, offered_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      profile.id,
      lovedOneId,
      prayerType,
      note,
      now,
      now
    );

    await enqueueSync(txn, profile.id, 'prayer_logs', id, 'insert', {
      id,
      lovedOneId,
      prayerType,
      note,
      offeredAt: now,
      createdAt: now,
    });
  });

  return id;
}
