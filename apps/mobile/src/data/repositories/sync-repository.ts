import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { SyncOperation } from '@/domain/types';

export type SyncOutboxItem = {
  id: string;
  ownerId: string | null;
  entityTable: string;
  entityId: string;
  operation: SyncOperation;
  payloadJson: string | null;
  attemptCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

type SyncOutboxRow = {
  id: string;
  owner_id: string | null;
  entity_table: string;
  entity_id: string;
  operation: SyncOperation;
  payload_json: string | null;
  attempt_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

function mapOutbox(row: SyncOutboxRow): SyncOutboxItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    entityTable: row.entity_table,
    entityId: row.entity_id,
    operation: row.operation,
    payloadJson: row.payload_json,
    attemptCount: row.attempt_count,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

export async function listPendingSync(
  db: SQLiteDatabase,
  limit = 100
): Promise<SyncOutboxItem[]> {
  const rows = await db.getAllAsync<SyncOutboxRow>(
    `SELECT
       id, owner_id, entity_table, entity_id, operation,
       payload_json, attempt_count, last_error, created_at, updated_at
     FROM sync_outbox
     ORDER BY created_at ASC
     LIMIT ?`,
    limit
  );

  return rows.map(mapOutbox);
}

export async function markOutboxFailure(
  db: SQLiteDatabase,
  id: string,
  errorMessage: string
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE sync_outbox
        SET attempt_count = attempt_count + 1,
            last_error = ?,
            updated_at = ?
      WHERE id = ?`,
    errorMessage,
    now,
    id
  );
}

export async function removeOutboxItem(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM sync_outbox WHERE id = ?', id);
}

export async function hasPendingEntity(
  db: SQLiteDatabase,
  entityTable: string,
  entityId: string
) {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count
       FROM sync_outbox
      WHERE entity_table = ? AND entity_id = ?`,
    entityTable,
    entityId
  );

  return (row?.count ?? 0) > 0;
}

export async function upsertSyncMetadata(
  db: SQLiteDatabase,
  input: {
    entityTable: string;
    entityId: string;
    localUpdatedAt: string | null;
    remoteUpdatedAt: string | null;
    syncState: 'pending' | 'synced' | 'conflict';
  }
) {
  await db.runAsync(
    `INSERT INTO sync_metadata (
       entity_table, entity_id, local_updated_at,
       remote_updated_at, sync_state
     ) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(entity_table, entity_id)
     DO UPDATE SET
       local_updated_at = excluded.local_updated_at,
       remote_updated_at = excluded.remote_updated_at,
       sync_state = excluded.sync_state`,
    input.entityTable,
    input.entityId,
    input.localUpdatedAt,
    input.remoteUpdatedAt,
    input.syncState
  );
}
