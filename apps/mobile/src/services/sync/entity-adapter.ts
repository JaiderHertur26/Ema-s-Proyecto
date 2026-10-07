import type { SQLiteDatabase } from 'expo-sqlite';

export const supportedSyncTables = [
  'loved_ones',
  'grief_journeys',
  'emotional_checkins',
  'memories',
  'letters',
  'prayer_logs',
] as const;

export type SupportedSyncTable = (typeof supportedSyncTables)[number];

export function isSupportedSyncTable(value: string): value is SupportedSyncTable {
  return (supportedSyncTables as readonly string[]).includes(value);
}

type JsonRecord = Record<string, unknown>;

function isoOrNull(value: unknown) {
  return typeof value === 'string' && value ? value : null;
}

function nullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function nullableNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function buildRemoteEntity(
  db: SQLiteDatabase,
  table: SupportedSyncTable,
  entityId: string,
  remoteUserId: string
): Promise<JsonRecord | null> {
  switch (table) {
    case 'loved_ones': {
      const row = await db.getFirstAsync<{
        id: string;
        name: string | null;
        relationship: string;
        birth_date: string | null;
        death_date: string | null;
        death_date_precision: string;
        approximate_age: number | null;
        circumstance: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, name, relationship, birth_date, death_date,
                death_date_precision, approximate_age, circumstance,
                notes, created_at, updated_at, deleted_at
           FROM loved_ones WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        name: row.name,
        relationship: row.relationship,
        birth_date: row.birth_date,
        death_date: row.death_date,
        death_date_precision: row.death_date_precision,
        approximate_age: row.approximate_age,
        circumstance: row.circumstance,
        notes: row.notes,
        created_at: row.created_at,
        client_updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      };
    }

    case 'grief_journeys': {
      const row = await db.getFirstAsync<{
        id: string;
        loved_one_id: string;
        started_at: string;
        active: number;
        last_checkin_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, loved_one_id, started_at, active, last_checkin_at,
                created_at, updated_at, deleted_at
           FROM grief_journeys WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        loved_one_id: row.loved_one_id,
        started_at: row.started_at,
        active: row.active === 1,
        last_checkin_at: row.last_checkin_at,
        created_at: row.created_at,
        client_updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      };
    }

    case 'emotional_checkins': {
      const row = await db.getFirstAsync<{
        id: string;
        journey_id: string;
        emotion: string;
        intensity: string;
        trigger: string | null;
        note: string | null;
        context: string;
        created_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, journey_id, emotion, intensity, trigger, note,
                context, created_at, deleted_at
           FROM emotional_checkins WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        journey_id: row.journey_id,
        emotion: row.emotion,
        intensity: row.intensity,
        trigger_text: row.trigger,
        note: row.note,
        context: row.context,
        created_at: row.created_at,
        client_updated_at: row.created_at,
        deleted_at: row.deleted_at,
      };
    }

    case 'memories': {
      const row = await db.getFirstAsync<{
        id: string;
        loved_one_id: string;
        type: string;
        title: string | null;
        content: string | null;
        media_object_path: string | null;
        media_mime_type: string | null;
        media_size_bytes: number | null;
        memory_date: string | null;
        category: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, loved_one_id, type, title, content,
                media_object_path, media_mime_type, media_size_bytes,
                memory_date, category, created_at, updated_at, deleted_at
           FROM memories WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        loved_one_id: row.loved_one_id,
        type: row.type,
        title: row.title,
        content: row.content,
        media_object_path: row.media_object_path,
        media_mime_type: row.media_mime_type,
        media_size_bytes: row.media_size_bytes,
        memory_date: row.memory_date,
        category: row.category,
        created_at: row.created_at,
        client_updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      };
    }

    case 'letters': {
      const row = await db.getFirstAsync<{
        id: string;
        loved_one_id: string;
        body: string;
        prayer_body: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, loved_one_id, body, prayer_body,
                created_at, updated_at, deleted_at
           FROM letters WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        loved_one_id: row.loved_one_id,
        body: row.body,
        prayer_body: row.prayer_body,
        created_at: row.created_at,
        client_updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      };
    }

    case 'prayer_logs': {
      const row = await db.getFirstAsync<{
        id: string;
        loved_one_id: string | null;
        prayer_type: string;
        note: string | null;
        offered_at: string;
        created_at: string;
        deleted_at: string | null;
      }>(
        `SELECT id, loved_one_id, prayer_type, note,
                offered_at, created_at, deleted_at
           FROM prayer_logs WHERE id = ?`,
        entityId
      );

      if (!row) return null;

      return {
        id: row.id,
        user_id: remoteUserId,
        loved_one_id: row.loved_one_id,
        prayer_type: row.prayer_type,
        note: row.note,
        offered_at: row.offered_at,
        created_at: row.created_at,
        client_updated_at: row.created_at,
        deleted_at: row.deleted_at,
      };
    }
  }
}

export function getRemoteClientUpdatedAt(row: JsonRecord) {
  return isoOrNull(row.client_updated_at);
}

export function getRemoteServerUpdatedAt(row: JsonRecord) {
  return isoOrNull(row.server_updated_at);
}

export async function applyRemoteEntity(
  db: SQLiteDatabase,
  table: SupportedSyncTable,
  row: JsonRecord,
  localOwnerId: string
) {
  switch (table) {
    case 'loved_ones':
      await db.runAsync(
        `INSERT INTO loved_ones (
           id, owner_id, name, relationship, birth_date, death_date,
           death_date_precision, approximate_age, circumstance, notes,
           created_at, updated_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           relationship = excluded.relationship,
           birth_date = excluded.birth_date,
           death_date = excluded.death_date,
           death_date_precision = excluded.death_date_precision,
           approximate_age = excluded.approximate_age,
           circumstance = excluded.circumstance,
           notes = excluded.notes,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        nullableString(row.name),
        String(row.relationship),
        nullableString(row.birth_date),
        nullableString(row.death_date),
        String(row.death_date_precision ?? 'unknown'),
        nullableNumber(row.approximate_age),
        nullableString(row.circumstance),
        nullableString(row.notes),
        String(row.created_at),
        String(row.client_updated_at),
        nullableString(row.deleted_at)
      );
      return;

    case 'grief_journeys':
      await db.runAsync(
        `INSERT INTO grief_journeys (
           id, owner_id, loved_one_id, started_at, active,
           last_checkin_at, created_at, updated_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           loved_one_id = excluded.loved_one_id,
           started_at = excluded.started_at,
           active = excluded.active,
           last_checkin_at = excluded.last_checkin_at,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        String(row.loved_one_id),
        String(row.started_at),
        row.active === true ? 1 : 0,
        nullableString(row.last_checkin_at),
        String(row.created_at),
        String(row.client_updated_at),
        nullableString(row.deleted_at)
      );
      return;

    case 'emotional_checkins':
      await db.runAsync(
        `INSERT INTO emotional_checkins (
           id, owner_id, journey_id, emotion, intensity,
           trigger, note, context, created_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           emotion = excluded.emotion,
           intensity = excluded.intensity,
           trigger = excluded.trigger,
           note = excluded.note,
           context = excluded.context,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        String(row.journey_id),
        String(row.emotion),
        String(row.intensity),
        nullableString(row.trigger_text),
        nullableString(row.note),
        String(row.context),
        String(row.created_at),
        nullableString(row.deleted_at)
      );
      return;

    case 'memories':
      await db.runAsync(
        `INSERT INTO memories (
           id, owner_id, loved_one_id, type, title, content,
           media_uri, media_object_path, media_mime_type, media_size_bytes,
           memory_date, category, created_at, updated_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           loved_one_id = excluded.loved_one_id,
           type = excluded.type,
           title = excluded.title,
           content = excluded.content,
           media_uri = COALESCE(memories.media_uri, excluded.media_uri),
           media_object_path = excluded.media_object_path,
           media_mime_type = excluded.media_mime_type,
           media_size_bytes = excluded.media_size_bytes,
           memory_date = excluded.memory_date,
           category = excluded.category,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        String(row.loved_one_id),
        String(row.type),
        nullableString(row.title),
        nullableString(row.content),
        nullableString(row.media_object_path),
        nullableString(row.media_mime_type),
        nullableNumber(row.media_size_bytes),
        nullableString(row.memory_date),
        nullableString(row.category),
        String(row.created_at),
        String(row.client_updated_at),
        nullableString(row.deleted_at)
      );
      return;

    case 'letters':
      await db.runAsync(
        `INSERT INTO letters (
           id, owner_id, loved_one_id, body, prayer_body,
           created_at, updated_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           loved_one_id = excluded.loved_one_id,
           body = excluded.body,
           prayer_body = excluded.prayer_body,
           updated_at = excluded.updated_at,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        String(row.loved_one_id),
        String(row.body),
        nullableString(row.prayer_body),
        String(row.created_at),
        String(row.client_updated_at),
        nullableString(row.deleted_at)
      );
      return;

    case 'prayer_logs':
      await db.runAsync(
        `INSERT INTO prayer_logs (
           id, owner_id, loved_one_id, prayer_type, note,
           offered_at, created_at, deleted_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           loved_one_id = excluded.loved_one_id,
           prayer_type = excluded.prayer_type,
           note = excluded.note,
           offered_at = excluded.offered_at,
           deleted_at = excluded.deleted_at`,
        String(row.id),
        localOwnerId,
        nullableString(row.loved_one_id),
        String(row.prayer_type),
        nullableString(row.note),
        String(row.offered_at),
        String(row.created_at),
        nullableString(row.deleted_at)
      );
      return;
  }
}
