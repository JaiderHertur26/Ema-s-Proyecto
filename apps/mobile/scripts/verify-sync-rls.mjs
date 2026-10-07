import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local no existe.');
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [
          line.slice(0, index).trim(),
          line.slice(index + 1).trim(),
        ];
      })
  );
}

function memoryStorage() {
  const storage = new Map();
  return {
    async getItem(key) {
      return storage.get(key) ?? null;
    },
    async setItem(key, value) {
      storage.set(key, value);
    },
    async removeItem(key) {
      storage.delete(key);
    },
  };
}

function clientFor(url, key) {
  return createClient(url, key, {
    auth: {
      storage: memoryStorage(),
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function anonymous(client, label) {
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      `${label}: no se pudo crear usuario anónimo: ${error?.message ?? 'sin usuario'}`
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

const a = clientFor(url, key);
const b = clientFor(url, key);

const userA = await anonymous(a, 'A');
const userB = await anonymous(b, 'B');

const lovedOneId = crypto.randomUUID();
const journeyId = crypto.randomUUID();
const now = new Date().toISOString();

try {
  const { error: insertError } = await a.from('loved_ones').insert({
    id: lovedOneId,
    user_id: userA.id,
    name: 'RLS TEST A',
    relationship: 'friend',
    death_date_precision: 'unknown',
    created_at: now,
    client_updated_at: now,
  });

  if (insertError) {
    throw new Error(`A_INSERT_FAILED: ${insertError.message}`);
  }

  const { data: ownRows, error: ownReadError } = await a
    .from('loved_ones')
    .select('id,name,user_id')
    .eq('id', lovedOneId);

  if (ownReadError || ownRows?.length !== 1) {
    throw new Error(
      `A_READ_FAILED: ${ownReadError?.message ?? 'fila propia no visible'}`
    );
  }

  const { data: foreignRows, error: foreignReadError } = await b
    .from('loved_ones')
    .select('id,name,user_id')
    .eq('id', lovedOneId);

  if (foreignReadError) {
    throw new Error(`B_READ_QUERY_FAILED: ${foreignReadError.message}`);
  }

  if ((foreignRows ?? []).length !== 0) {
    throw new Error('RLS_BROKEN: B pudo leer un registro de A.');
  }

  const { data: updateRows, error: updateError } = await b
    .from('loved_ones')
    .update({
      name: 'RLS TEST HACK',
      client_updated_at: new Date().toISOString(),
    })
    .eq('id', lovedOneId)
    .select('id');

  if (updateError) {
    throw new Error(`B_UPDATE_QUERY_FAILED: ${updateError.message}`);
  }

  if ((updateRows ?? []).length !== 0) {
    throw new Error('RLS_BROKEN: B pudo modificar un registro de A.');
  }

  const { data: afterUpdate, error: verifyUpdateError } = await a
    .from('loved_ones')
    .select('name')
    .eq('id', lovedOneId)
    .single();

  if (verifyUpdateError || afterUpdate.name !== 'RLS TEST A') {
    throw new Error('RLS_BROKEN: el registro de A cambió desde B.');
  }

  const { error: crossLinkError } = await b.from('grief_journeys').insert({
    id: journeyId,
    user_id: userB.id,
    loved_one_id: lovedOneId,
    started_at: now,
    active: true,
    created_at: now,
    client_updated_at: now,
  });

  if (!crossLinkError) {
    throw new Error(
      'OWNERSHIP_BROKEN: B pudo enlazar su duelo al ser querido de A.'
    );
  }

  console.log('OK_SCHEMA_REACHABLE: true');
  console.log('OK_A_CAN_READ_OWN_DATA: true');
  console.log('OK_B_CANNOT_READ_A: true');
  console.log('OK_B_CANNOT_UPDATE_A: true');
  console.log('OK_B_CANNOT_CROSS_LINK_A: true');
  console.log('RLS_ISOLATION: PASS');
} finally {
  await a.from('loved_ones').delete().eq('id', lovedOneId);
  await a.auth.signOut();
  await b.auth.signOut();
}
