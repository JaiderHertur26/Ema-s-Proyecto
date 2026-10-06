import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { SyncOperation } from '@/domain/types';

export async function enqueueSync(
  db: SQLiteDatabase,
  ownerId: string | null,
  entityTable: string,
  entityId: string,
  operation: SyncOperation,
  payload: unknown
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sync_outbox (
       id, owner_id, entity_table, entity_id, operation,
       payload_json, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    Crypto.randomUUID(),
    ownerId,
    entityTable,
    entityId,
    operation,
    payload == null ? null : JSON.stringify(payload),
    now,
    now
  );
}
