import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan variables Supabase.');
}

const storage = new Map();

const storageAdapter = {
  async getItem(keyName) {
    return storage.get(keyName) ?? null;
  },
  async setItem(keyName, value) {
    storage.set(keyName, value);
  },
  async removeItem(keyName) {
    storage.delete(keyName);
  },
};

function makeClient() {
  return createClient(url, key, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

const clientA = makeClient();

const { data: signInData, error: signInError } =
  await clientA.auth.signInAnonymously();

if (signInError) {
  console.error('FAIL_SIGN_IN:', signInError.message);
  process.exit(1);
}

if (!signInData.user || !signInData.session) {
  console.error('FAIL_SIGN_IN: no se recibió user/session.');
  process.exit(1);
}

if (signInData.user.is_anonymous !== true) {
  console.error('FAIL_SIGN_IN: el usuario creado no figura como anónimo.');
  process.exit(1);
}

const firstUserId = signInData.user.id;

const clientB = makeClient();
const {
  data: { session: restoredSession },
  error: restoreError,
} = await clientB.auth.getSession();

if (restoreError) {
  console.error('FAIL_RESTORE:', restoreError.message);
  process.exit(1);
}

if (!restoredSession?.user) {
  console.error('FAIL_RESTORE: no se restauró la sesión.');
  process.exit(1);
}

if (restoredSession.user.id !== firstUserId) {
  console.error('FAIL_RESTORE: cambió el auth.users.id.');
  process.exit(1);
}

const { data: verifiedUser, error: userError } =
  await clientB.auth.getUser();

if (userError || !verifiedUser.user) {
  console.error('FAIL_GET_USER:', userError?.message ?? 'sin usuario');
  process.exit(1);
}

if (verifiedUser.user.id !== firstUserId) {
  console.error('FAIL_GET_USER: el usuario remoto no coincide.');
  process.exit(1);
}

console.log('OK_ANONYMOUS_SIGN_IN: true');
console.log('OK_SESSION_RESTORE: true');
console.log('OK_SAME_REMOTE_USER: true');
console.log('IS_ANONYMOUS: true');
console.log('USER_ID:', firstUserId);
