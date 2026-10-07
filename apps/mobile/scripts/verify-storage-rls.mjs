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

function makeClient(url, key) {
  return createClient(url, key, {
    auth: {
      storage: memoryStorage(),
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function signIn(client, label) {
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      `${label}_AUTH_FAILED: ${error?.message ?? 'sin usuario'}`
    );
  }
  return data.user;
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan URL/publishable key.');
}

const a = makeClient(url, key);
const b = makeClient(url, key);
const userA = await signIn(a, 'A');
const userB = await signIn(b, 'B');

const memoryId = crypto.randomUUID();
const objectPath = `${userA.id}/memories/${memoryId}/original.png`;

// PNG 1x1 transparente.
const payload = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

try {
  const { error: uploadError } = await a.storage
    .from(BUCKET)
    .upload(objectPath, payload, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`A_UPLOAD_FAILED: ${uploadError.message}`);
  }

  const { data: ownDownload, error: ownDownloadError } = await a.storage
    .from(BUCKET)
    .download(objectPath);

  if (ownDownloadError || !ownDownload) {
    throw new Error(
      `A_DOWNLOAD_FAILED: ${ownDownloadError?.message ?? 'sin archivo'}`
    );
  }

  const ownBytes = Buffer.from(await ownDownload.arrayBuffer());
  if (!ownBytes.equals(payload)) {
    throw new Error('A_DOWNLOAD_MISMATCH');
  }

  const { data: foreignDownload, error: foreignDownloadError } = await b.storage
    .from(BUCKET)
    .download(objectPath);

  if (!foreignDownloadError && foreignDownload) {
    throw new Error('STORAGE_RLS_BROKEN: B pudo descargar el archivo de A.');
  }

  const foreignPath = `${userA.id}/memories/${crypto.randomUUID()}/hack.png`;
  const { error: foreignUploadError } = await b.storage
    .from(BUCKET)
    .upload(foreignPath, payload, {
      contentType: 'image/png',
      upsert: false,
    });

  if (!foreignUploadError) {
    throw new Error('STORAGE_RLS_BROKEN: B pudo escribir en la carpeta de A.');
  }

  const { data: foreignList, error: foreignListError } = await b.storage
    .from(BUCKET)
    .list(`${userA.id}/memories/${memoryId}`);

  if (foreignListError) {
    throw new Error(`B_LIST_QUERY_FAILED: ${foreignListError.message}`);
  }

  if ((foreignList ?? []).length !== 0) {
    throw new Error('STORAGE_RLS_BROKEN: B pudo listar archivos de A.');
  }

  const publicUrl =
    `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`;
  const publicResponse = await fetch(publicUrl);

  if (publicResponse.ok) {
    throw new Error('STORAGE_PRIVACY_BROKEN: el objeto responde como público.');
  }

  const { data: signedData, error: signedError } = await a.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, 30);

  if (signedError || !signedData?.signedUrl) {
    throw new Error(
      `A_SIGNED_URL_FAILED: ${signedError?.message ?? 'sin URL'}`
    );
  }

  const signedResponse = await fetch(signedData.signedUrl);
  if (!signedResponse.ok) {
    throw new Error(
      `A_SIGNED_URL_FETCH_FAILED: HTTP ${signedResponse.status}`
    );
  }

  console.log('OK_A_UPLOAD_OWN: true');
  console.log('OK_A_DOWNLOAD_OWN: true');
  console.log('OK_B_CANNOT_DOWNLOAD_A: true');
  console.log('OK_B_CANNOT_UPLOAD_TO_A: true');
  console.log('OK_B_CANNOT_LIST_A: true');
  console.log('OK_DIRECT_PUBLIC_URL_BLOCKED: true');
  console.log('OK_TEMP_SIGNED_URL: true');
  console.log('STORAGE_RLS_ISOLATION: PASS');
} finally {
  await a.storage.from(BUCKET).remove([objectPath]);
  await a.auth.signOut();
  await b.auth.signOut();
}
