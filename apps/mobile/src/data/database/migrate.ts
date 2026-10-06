import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';

type UserVersionRow = {
  user_version: number;
};

export async function migrateDatabase(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<UserVersionRow>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(migration.sql);
      await txn.execAsync(`PRAGMA user_version = ${migration.version}`);
    });

    currentVersion = migration.version;
  }
}
