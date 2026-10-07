import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

export async function saveSyncConflict(
  db: SQLiteDatabase,
  input: {
    entityTable: string;
    entityId: string;
    localPayload: unknown;
    remotePayload: unknown;
  }
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sync_conflicts (
       id, entity_table, entity_id,
       local_payload_json, remote_payload_json,
       detected_at
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    Crypto.randomUUID(),
    input.entityTable,
    input.entityId,
    JSON.stringify(input.localPayload),
    JSON.stringify(input.remotePayload),
    now
  );
}
