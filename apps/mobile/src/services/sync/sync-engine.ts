import type { SQLiteDatabase } from 'expo-sqlite';

import { supabaseConfig } from '@/config/supabase';
import { getLocalIdentityProfile } from '@/data/repositories/profile-repository';
import { saveSyncConflict } from '@/data/repositories/sync-conflict-repository';
import {
  countPendingSync,
  markSyncAttempt,
  markSyncFailure,
  markSyncSuccess,
} from '@/data/repositories/sync-runtime-repository';
import {
  enqueueSync,
  hasPendingEntity,
  listPendingSync,
  markOutboxFailure,
  removeOutboxItem,
  upsertSyncMetadata,
} from '@/data/repositories/sync-repository';
import { getSupabaseClient } from '@/services/auth/supabase-client';

import {
  applyRemoteEntity,
  buildRemoteEntity,
  getRemoteClientUpdatedAt,
  getRemoteServerUpdatedAt,
  isSupportedSyncTable,
  supportedSyncTables,
  type SupportedSyncTable,
} from './entity-adapter';

type JsonRecord = Record<string, unknown>;

export type SyncRunResult = {
  status:
    | 'disabled'
    | 'no_session'
    | 'success'
    | 'partial'
    | 'failed';
  pushed: number;
  pulled: number;
  conflicts: number;
  pending: number;
  message: string | null;
};

function asTimestamp(value: string | null) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function pushOutbox(
  db: SQLiteDatabase,
  remoteUserId: string
): Promise<{ pushed: number; conflicts: number }> {
  const items = await listPendingSync(db, 100);
  let pushed = 0;
  let conflicts = 0;

  for (const item of items) {
    if (!isSupportedSyncTable(item.entityTable)) {
      const message = `Entidad no soportada todavía: ${item.entityTable}`;
      await markOutboxFailure(db, item.id, message);
      throw new Error(message);
    }

    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase no está configurado.');

    const localEntity = await buildRemoteEntity(
      db,
      item.entityTable,
      item.entityId,
      remoteUserId
    );

    if (!localEntity) {
      const message = `No existe localmente ${item.entityTable}/${item.entityId}`;
      await markOutboxFailure(db, item.id, message);
      throw new Error(message);
    }

    const { data: remoteExisting, error: readError } = await client
      .from(item.entityTable)
      .select('*')
      .eq('id', item.entityId)
      .maybeSingle();

    if (readError) {
      await markOutboxFailure(db, item.id, readError.message);
      throw readError;
    }

    const localUpdatedAt = getRemoteClientUpdatedAt(localEntity);

    if (remoteExisting) {
      const remoteRow = remoteExisting as JsonRecord;
      const remoteUpdatedAt = getRemoteClientUpdatedAt(remoteRow);

      if (
        asTimestamp(remoteUpdatedAt) > asTimestamp(localUpdatedAt)
      ) {
        await saveSyncConflict(db, {
          entityTable: item.entityTable,
          entityId: item.entityId,
          localPayload: localEntity,
          remotePayload: remoteRow,
        });

        await upsertSyncMetadata(db, {
          entityTable: item.entityTable,
          entityId: item.entityId,
          localUpdatedAt,
          remoteUpdatedAt: getRemoteServerUpdatedAt(remoteRow),
          syncState: 'conflict',
        });

        await removeOutboxItem(db, item.id);
        conflicts += 1;
        continue;
      }
    }

    const { data: remoteSaved, error: saveError } = await client
      .from(item.entityTable)
      .upsert(localEntity, { onConflict: 'id' })
      .select('client_updated_at, server_updated_at')
      .single();

    if (saveError) {
      await markOutboxFailure(db, item.id, saveError.message);
      throw saveError;
    }

    const savedRow = remoteSaved as JsonRecord;

    await upsertSyncMetadata(db, {
      entityTable: item.entityTable,
      entityId: item.entityId,
      localUpdatedAt,
      remoteUpdatedAt: getRemoteServerUpdatedAt(savedRow),
      syncState: 'synced',
    });

    await removeOutboxItem(db, item.id);
    pushed += 1;
  }

  return { pushed, conflicts };
}

async function pullTable(
  db: SQLiteDatabase,
  table: SupportedSyncTable,
  localOwnerId: string,
  remoteUserId: string
) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado.');

  const { data, error } = await client
    .from(table)
    .select('*')
    .eq('user_id', remoteUserId);

  if (error) throw error;

  let pulled = 0;

  for (const raw of data ?? []) {
    const remoteRow = raw as JsonRecord;
    const entityId = String(remoteRow.id);

    if (await hasPendingEntity(db, table, entityId)) {
      continue;
    }

    const localEntity = await buildRemoteEntity(
      db,
      table,
      entityId,
      remoteUserId
    );

    const remoteClientUpdatedAt = getRemoteClientUpdatedAt(remoteRow);
    const localClientUpdatedAt = localEntity
      ? getRemoteClientUpdatedAt(localEntity)
      : null;

    if (
      localEntity &&
      asTimestamp(localClientUpdatedAt) > asTimestamp(remoteClientUpdatedAt)
    ) {
      await enqueueSync(
        db,
        localOwnerId,
        table,
        entityId,
        'update',
        localEntity
      );
      continue;
    }

    await applyRemoteEntity(db, table, remoteRow, localOwnerId);

    await upsertSyncMetadata(db, {
      entityTable: table,
      entityId,
      localUpdatedAt: remoteClientUpdatedAt,
      remoteUpdatedAt: getRemoteServerUpdatedAt(remoteRow),
      syncState: 'synced',
    });

    pulled += 1;
  }

  return pulled;
}

async function pullRemote(
  db: SQLiteDatabase,
  localOwnerId: string,
  remoteUserId: string
) {
  let pulled = 0;

  for (const table of supportedSyncTables) {
    pulled += await pullTable(
      db,
      table,
      localOwnerId,
      remoteUserId
    );
  }

  return pulled;
}

export async function syncNow(db: SQLiteDatabase): Promise<SyncRunResult> {
  if (!supabaseConfig.syncEnabled) {
    return {
      status: 'disabled',
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      pending: await countPendingSync(db),
      message: 'La sincronización remota todavía no está habilitada.',
    };
  }

  const client = getSupabaseClient();

  if (!client) {
    return {
      status: 'failed',
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      pending: await countPendingSync(db),
      message: 'Supabase no está configurado.',
    };
  }

  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError || !session?.user) {
    return {
      status: 'no_session',
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      pending: await countPendingSync(db),
      message: sessionError?.message ?? 'No hay una sesión remota disponible.',
    };
  }

  const localProfile = await getLocalIdentityProfile(db);
  const pendingBefore = await countPendingSync(db);
  await markSyncAttempt(db, pendingBefore);

  try {
    const push = await pushOutbox(db, session.user.id);
    const pulled = await pullRemote(
      db,
      localProfile.id,
      session.user.id
    );
    const pendingAfter = await countPendingSync(db);

    await markSyncSuccess(db, pendingAfter);

    return {
      status: pendingAfter === 0 ? 'success' : 'partial',
      pushed: push.pushed,
      pulled,
      conflicts: push.conflicts,
      pending: pendingAfter,
      message:
        push.conflicts > 0
          ? 'Se preservaron cambios en conflicto para revisión.'
          : null,
    };
  } catch (error) {
    const pendingAfter = await countPendingSync(db);
    const message =
      error instanceof Error
        ? error.message
        : 'Falló la sincronización remota.';

    await markSyncFailure(db, message, pendingAfter);

    return {
      status: 'failed',
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      pending: pendingAfter,
      message,
    };
  }
}
