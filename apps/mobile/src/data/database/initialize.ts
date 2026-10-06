import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getOrCreateDatabaseKey } from './database-key';
import { migrateDatabase } from './migrate';

export const DATABASE_NAME = 'emaus.db';

export async function initializeDatabase(db: SQLiteDatabase) {
  const key = await getOrCreateDatabaseKey();

  if (key) {
    await db.execAsync(`PRAGMA key = "x'${key}'";`);
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
  `);

  await migrateDatabase(db);
  await ensureLocalProfile(db);
}

async function ensureLocalProfile(db: SQLiteDatabase) {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM profiles LIMIT 1'
  );

  if (existing) {
    return existing.id;
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO profiles (id, created_at, updated_at) VALUES (?, ?, ?)`,
    id,
    now,
    now
  );

  await db.runAsync(
    `INSERT INTO user_preferences (owner_id, updated_at) VALUES (?, ?)`,
    id,
    now
  );

  return id;
}
