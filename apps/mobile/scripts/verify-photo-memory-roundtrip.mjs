import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'emaus-private';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      })
  );
}

function memoryStorage() {
  const map = new Map();
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

const env = loadEnv();
const client = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: memoryStorage(),
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

const { data: authData, error: authError } =
  await client.auth.signInAnonymously();

if (authError || !authData.user) {
  throw new Error(
    `AUTH_FAILED: ${authError?.message ?? 'sin usuario'}`
  );
}

const userId = authData.user.id;
const lovedOneId = crypto.randomUUID();
const memoryId = crypto.randomUUID();
const now = new Date().toISOString();
const objectPath =
  `${userId}/memories/${memoryId}/original.png`;

const payload = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

async function must(label, promise) {
  const { data, error } = await promise;
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
  return data;
}

try {
  await must(
    'LOVED_ONE_INSERT',
    client.from('loved_ones').insert({
      id: lovedOneId,
      user_id: userId,
      name: 'Storage Roundtrip',
      relationship: 'family',
      death_date_precision: 'unknown',
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'PHOTO_UPLOAD',
    client.storage.from(BUCKET).upload(objectPath, payload, {
      contentType: 'image/png',
      upsert: true,
    })
  );

  await must(
    'MEMORY_INSERT',
    client.from('memories').insert({
      id: memoryId,
      user_id: userId,
      loved_one_id: lovedOneId,
      type: 'photo',
      title: 'Foto de prueba',
      content: 'Roundtrip Storage + DB',
      media_object_path: objectPath,
      media_mime_type: 'image/png',
      media_size_bytes: payload.length,
      category: 'photo',
      created_at: now,
      client_updated_at: now,
    })
  );

  const memory = await must(
    'MEMORY_READ',
    client.from('memories')
      .select(
        'id,type,media_object_path,media_mime_type,media_size_bytes,user_id'
      )
      .eq('id', memoryId)
      .single()
  );

  if (memory.id !== memoryId) {
    throw new Error('MEMORY_ID_MISMATCH');
  }

  if (memory.user_id !== userId) {
    throw new Error('MEMORY_OWNER_MISMATCH');
  }

  if (memory.media_object_path !== objectPath) {
    throw new Error('MEDIA_OBJECT_PATH_MISMATCH');
  }

  if (memory.media_mime_type !== 'image/png') {
    throw new Error('MEDIA_MIME_TYPE_MISMATCH');
  }

  if (Number(memory.media_size_bytes) !== payload.length) {
    throw new Error('MEDIA_SIZE_MISMATCH');
  }

  const { data: downloaded, error: downloadError } =
    await client.storage.from(BUCKET).download(memory.media_object_path);

  if (downloadError || !downloaded) {
    throw new Error(
      `PHOTO_DOWNLOAD_FAILED: ${downloadError?.message ?? 'sin archivo'}`
    );
  }

  const bytes = Buffer.from(await downloaded.arrayBuffer());

  if (!bytes.equals(payload)) {
    throw new Error('PHOTO_BYTES_MISMATCH');
  }

  console.log('OK_MEMORY_ROW: true');
  console.log('OK_MEDIA_OBJECT_PATH: true');
  console.log('OK_MEDIA_MIME_TYPE: true');
  console.log('OK_MEDIA_SIZE_BYTES: true');
  console.log('OK_PRIVATE_OBJECT_DOWNLOAD: true');
  console.log('OK_PHOTO_BYTES_MATCH: true');
  console.log('PHOTO_MEMORY_ROUNDTRIP: PASS');
} finally {
  await client.storage.from(BUCKET).remove([objectPath]);
  await client.from('memories').delete().eq('id', memoryId);
  await client.from('loved_ones').delete().eq('id', lovedOneId);
  await client.auth.signOut();
}
