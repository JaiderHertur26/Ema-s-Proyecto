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

function storage() {
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
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan URL/publishable key.');
}

const owner = createClient(url, key, {
  auth: {
    storage: storage(),
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const guest = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const { data: authData, error: authError } =
  await owner.auth.signInAnonymously();

if (authError || !authData.user) {
  throw new Error(
    `OWNER_AUTH_FAILED: ${authError?.message ?? 'sin usuario'}`
  );
}

const userId = authData.user.id;
const lovedOneId = crypto.randomUUID();
const objectPath =
  `${userId}/security/${crypto.randomUUID()}/private.png`;
const now = new Date().toISOString();

const payload = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

try {
  const { error: insertError } = await owner.from('loved_ones').insert({
    id: lovedOneId,
    user_id: userId,
    name: 'Security Test',
    relationship: 'friend',
    death_date_precision: 'unknown',
    created_at: now,
    client_updated_at: now,
  });

  if (insertError) {
    throw new Error(`OWNER_INSERT_FAILED: ${insertError.message}`);
  }

  const { error: uploadError } = await owner.storage
    .from(BUCKET)
    .upload(objectPath, payload, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`OWNER_UPLOAD_FAILED: ${uploadError.message}`);
  }

  const { data: guestRows, error: guestReadError } = await guest
    .from('loved_ones')
    .select('id,user_id')
    .eq('id', lovedOneId);

  if (guestReadError) {
    throw new Error(`GUEST_READ_QUERY_FAILED: ${guestReadError.message}`);
  }

  if ((guestRows ?? []).length !== 0) {
    throw new Error('PUBLIC_RLS_BROKEN: un cliente sin sesión pudo leer datos.');
  }

  const { error: guestInsertError } = await guest
    .from('loved_ones')
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name: 'Public attack',
      relationship: 'friend',
      death_date_precision: 'unknown',
      created_at: now,
      client_updated_at: now,
    });

  if (!guestInsertError) {
    throw new Error(
      'PUBLIC_RLS_BROKEN: un cliente sin sesión pudo insertar datos.'
    );
  }

  const { data: guestObject, error: guestDownloadError } = await guest.storage
    .from(BUCKET)
    .download(objectPath);

  if (!guestDownloadError && guestObject) {
    throw new Error(
      'PUBLIC_STORAGE_BROKEN: un cliente sin sesión pudo descargar un archivo.'
    );
  }

  const publicUrl =
    `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`;
  const publicResponse = await fetch(publicUrl);

  if (publicResponse.ok) {
    throw new Error('PUBLIC_STORAGE_BROKEN: la URL pública directa respondió OK.');
  }

  console.log('OK_UNAUTH_CANNOT_READ_DB: true');
  console.log('OK_UNAUTH_CANNOT_WRITE_DB: true');
  console.log('OK_UNAUTH_CANNOT_DOWNLOAD_STORAGE: true');
  console.log('OK_PUBLIC_STORAGE_URL_BLOCKED: true');
  console.log('UNAUTHENTICATED_ACCESS: DENIED');
} finally {
  await owner.storage.from(BUCKET).remove([objectPath]);
  await owner.from('loved_ones').delete().eq('id', lovedOneId);
  await owner.auth.signOut();
}
