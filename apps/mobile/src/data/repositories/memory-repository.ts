import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { MemoryType } from '@/domain/types';

import { enqueueSync } from './sync-repository';

export type MemoryCategory =
  | 'story'
  | 'legacy'
  | 'special_moment'
  | 'gratitude'
  | 'photo'
  | 'other';

export type MemoryRecord = {
  id: string;
  lovedOneId: string;
  type: MemoryType;
  title: string | null;
  content: string | null;
  mediaUri: string | null;
  mediaObjectPath: string | null;
  mediaMimeType: string | null;
  mediaSizeBytes: number | null;
  memoryDate: string | null;
  category: MemoryCategory | null;
  createdAt: string;
  updatedAt: string;
};

type MemoryRow = {
  id: string;
  loved_one_id: string;
  type: MemoryType;
  title: string | null;
  content: string | null;
  media_uri: string | null;
  media_object_path: string | null;
  media_mime_type: string | null;
  media_size_bytes: number | null;
  memory_date: string | null;
  category: MemoryCategory | null;
  created_at: string;
  updated_at: string;
};

function mapMemory(row: MemoryRow): MemoryRecord {
  return {
    id: row.id,
    lovedOneId: row.loved_one_id,
    type: row.type,
    title: row.title,
    content: row.content,
    mediaUri: row.media_uri,
    mediaObjectPath: row.media_object_path,
    mediaMimeType: row.media_mime_type,
    mediaSizeBytes: row.media_size_bytes,
    memoryDate: row.memory_date,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createTextMemory(
  db: SQLiteDatabase,
  input: {
    lovedOneId: string;
    title?: string | null;
    content: string;
    category: MemoryCategory;
    memoryDate?: string | null;
  }
): Promise<string> {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles LIMIT 1');
  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const title = input.title?.trim() || null;
  const content = input.content.trim();

  if (!content) {
    throw new Error('El recuerdo no puede estar vacío.');
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO memories (
        id, owner_id, loved_one_id, type, title, content,
        memory_date, category, created_at, updated_at
      ) VALUES (?, ?, ?, 'text', ?, ?, ?, ?, ?, ?)`,
      id,
      profile.id,
      input.lovedOneId,
      title,
      content,
      input.memoryDate ?? null,
      input.category,
      now,
      now
    );

    await enqueueSync(txn, profile.id, 'memories', id, 'insert', {
      id,
      lovedOneId: input.lovedOneId,
      type: 'text',
      title,
      content,
      memoryDate: input.memoryDate ?? null,
      category: input.category,
      createdAt: now,
      updatedAt: now,
    });
  });

  return id;
}

export async function listMemories(
  db: SQLiteDatabase,
  lovedOneId: string
): Promise<MemoryRecord[]> {
  const rows = await db.getAllAsync<MemoryRow>(
    `SELECT
       id, loved_one_id, type, title, content, media_uri,
       media_object_path, media_mime_type, media_size_bytes,
       memory_date, category, created_at, updated_at
     FROM memories
     WHERE loved_one_id = ?
       AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    lovedOneId
  );

  return rows.map(mapMemory);
}

export async function listMemoriesByCategory(
  db: SQLiteDatabase,
  lovedOneId: string,
  category: MemoryCategory
): Promise<MemoryRecord[]> {
  const rows = await db.getAllAsync<MemoryRow>(
    `SELECT
       id, loved_one_id, type, title, content, media_uri,
       media_object_path, media_mime_type, media_size_bytes,
       memory_date, category, created_at, updated_at
     FROM memories
     WHERE loved_one_id = ?
       AND category = ?
       AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    lovedOneId,
    category
  );

  return rows.map(mapMemory);
}


export async function createPhotoMemory(
  db: SQLiteDatabase,
  input: {
    lovedOneId: string;
    mediaUri: string;
    mediaMimeType?: string | null;
    mediaSizeBytes?: number | null;
    title?: string | null;
    note?: string | null;
  }
): Promise<string> {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles LIMIT 1');
  if (!profile) {
    throw new Error('No existe un perfil local.');
  }

  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const title = input.title?.trim() || null;
  const note = input.note?.trim() || null;

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO memories (
        id, owner_id, loved_one_id, type, title, content,
        media_uri, media_mime_type, media_size_bytes,
        category, created_at, updated_at
      ) VALUES (?, ?, ?, 'photo', ?, ?, ?, ?, ?, 'photo', ?, ?)`,
      id,
      profile.id,
      input.lovedOneId,
      title,
      note,
      input.mediaUri,
      input.mediaMimeType ?? null,
      input.mediaSizeBytes ?? null,
      now,
      now
    );

    await enqueueSync(txn, profile.id, 'memories', id, 'insert', {
      id,
      lovedOneId: input.lovedOneId,
      type: 'photo',
      title,
      content: note,
      mediaUri: input.mediaUri,
      mediaMimeType: input.mediaMimeType ?? null,
      mediaSizeBytes: input.mediaSizeBytes ?? null,
      category: 'photo',
      createdAt: now,
      updatedAt: now,
    });
  });

  return id;
}


export async function getMemoryById(
  db: SQLiteDatabase,
  id: string
): Promise<MemoryRecord | null> {
  const row = await db.getFirstAsync<MemoryRow>(
    `SELECT
       id, loved_one_id, type, title, content, media_uri,
       media_object_path, media_mime_type, media_size_bytes,
       memory_date, category, created_at, updated_at
     FROM memories
     WHERE id = ? AND deleted_at IS NULL`,
    id
  );

  return row ? mapMemory(row) : null;
}

export async function updateMemoryMediaRemotePath(
  db: SQLiteDatabase,
  id: string,
  mediaObjectPath: string,
  mediaMimeType: string | null,
  mediaSizeBytes: number | null
) {
  await db.runAsync(
    `UPDATE memories
        SET media_object_path = ?,
            media_mime_type = COALESCE(media_mime_type, ?),
            media_size_bytes = COALESCE(media_size_bytes, ?)
      WHERE id = ?`,
    mediaObjectPath,
    mediaMimeType,
    mediaSizeBytes,
    id
  );
}

export async function updateMemoryLocalMediaUri(
  db: SQLiteDatabase,
  id: string,
  mediaUri: string
) {
  await db.runAsync(
    'UPDATE memories SET media_uri = ? WHERE id = ?',
    mediaUri,
    id
  );
}
