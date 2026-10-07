import type { SQLiteDatabase } from 'expo-sqlite';

export type SyncRuntimeState = {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  pendingCount: number;
};

type SyncRuntimeRow = {
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  pending_count: number;
};

export async function getSyncRuntimeState(
  db: SQLiteDatabase
): Promise<SyncRuntimeState> {
  const row = await db.getFirstAsync<SyncRuntimeRow>(
    `SELECT last_attempt_at, last_success_at, last_error, pending_count
       FROM sync_runtime_state
      WHERE id = 'current'`
  );

  return {
    lastAttemptAt: row?.last_attempt_at ?? null,
    lastSuccessAt: row?.last_success_at ?? null,
    lastError: row?.last_error ?? null,
    pendingCount: row?.pending_count ?? 0,
  };
}

export async function markSyncAttempt(db: SQLiteDatabase, pendingCount: number) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE sync_runtime_state
        SET last_attempt_at = ?,
            pending_count = ?,
            updated_at = ?
      WHERE id = 'current'`,
    now,
    pendingCount,
    now
  );
}

export async function markSyncSuccess(db: SQLiteDatabase, pendingCount: number) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE sync_runtime_state
        SET last_success_at = ?,
            last_error = NULL,
            pending_count = ?,
            updated_at = ?
      WHERE id = 'current'`,
    now,
    pendingCount,
    now
  );
}

export async function markSyncFailure(
  db: SQLiteDatabase,
  errorMessage: string,
  pendingCount: number
) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE sync_runtime_state
        SET last_error = ?,
            pending_count = ?,
            updated_at = ?
      WHERE id = 'current'`,
    errorMessage,
    pendingCount,
    now
  );
}

export async function countPendingSync(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM sync_outbox'
  );

  return row?.count ?? 0;
}
