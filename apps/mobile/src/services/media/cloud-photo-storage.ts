import { Directory, File, Paths } from 'expo-file-system';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  getMemoryById,
  type MemoryRecord,
  updateMemoryLocalMediaUri,
  updateMemoryMediaRemotePath,
} from '@/data/repositories/memory-repository';
import { getSupabaseClient } from '@/services/auth/supabase-client';

export const MEMORY_MEDIA_BUCKET = 'emaus-private';
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

function extensionFromMime(mimeType: string | null) {
  switch (mimeType?.toLowerCase()) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'jpg';
  }
}

function mimeFromExtension(extension: string) {
  switch (extension.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    default:
      return 'image/jpeg';
  }
}

function extensionFromPath(path: string) {
  const match = path.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

function assertOwnedPath(path: string, remoteUserId: string) {
  if (!path.startsWith(`${remoteUserId}/`)) {
    throw new Error('La ruta remota de la fotografía no pertenece al usuario activo.');
  }
}

function objectPathFor(
  remoteUserId: string,
  memoryId: string,
  mimeType: string | null
) {
  const extension = extensionFromMime(mimeType);
  return `${remoteUserId}/memories/${memoryId}/original.${extension}`;
}

export async function uploadMemoryPhoto(
  db: SQLiteDatabase,
  memoryId: string,
  remoteUserId: string
) {
  const memory = await getMemoryById(db, memoryId);

  if (!memory || memory.type !== 'photo') {
    return null;
  }

  if (memory.mediaObjectPath) {
    assertOwnedPath(memory.mediaObjectPath, remoteUserId);
    return memory.mediaObjectPath;
  }

  if (!memory.mediaUri) {
    throw new Error('La fotografía no tiene una copia local disponible.');
  }

  const file = new File(memory.mediaUri);

  if (!file.exists) {
    throw new Error('La copia local de la fotografía ya no existe.');
  }

  const size = memory.mediaSizeBytes ?? file.size;

  if (size > MAX_PHOTO_BYTES) {
    throw new Error('La fotografía supera el límite privado de 15 MB.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado.');
  }

  const objectPath = objectPathFor(
    remoteUserId,
    memory.id,
    memory.mediaMimeType
  );
  const arrayBuffer = await file.arrayBuffer();
  const contentType =
    memory.mediaMimeType ?? mimeFromExtension(file.extension.replace('.', ''));

  const { error } = await client.storage
    .from(MEMORY_MEDIA_BUCKET)
    .upload(objectPath, arrayBuffer, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`No se pudo respaldar la fotografía: ${error.message}`);
  }

  await updateMemoryMediaRemotePath(
    db,
    memory.id,
    objectPath,
    contentType,
    size
  );

  return objectPath;
}

export async function ensureMemoryPhotoCached(
  db: SQLiteDatabase,
  memory: MemoryRecord,
  remoteUserId: string
) {
  if (memory.type !== 'photo') {
    return null;
  }

  if (memory.mediaUri) {
    const existing = new File(memory.mediaUri);
    if (existing.exists) return existing.uri;
  }

  if (!memory.mediaObjectPath) {
    return null;
  }

  assertOwnedPath(memory.mediaObjectPath, remoteUserId);

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase no está configurado.');
  }

  const { data, error } = await client.storage
    .from(MEMORY_MEDIA_BUCKET)
    .download(memory.mediaObjectPath);

  if (error || !data) {
    throw new Error(
      `No se pudo recuperar la fotografía: ${error?.message ?? 'sin archivo'}`
    );
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  const extension = extensionFromPath(memory.mediaObjectPath);
  const directory = new Directory(Paths.document, 'emaus-media', 'photos');

  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }

  const file = new File(directory, `${memory.id}.${extension}`);
  file.create({ intermediates: true, overwrite: true });
  file.write(bytes);

  await updateMemoryLocalMediaUri(db, memory.id, file.uri);

  return file.uri;
}
