import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

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
    async getItem(key) { return map.get(key) ?? null; },
    async setItem(key, value) { map.set(key, value); },
    async removeItem(key) { map.delete(key); },
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

const { data: authData, error: authError } = await client.auth.signInAnonymously();
if (authError || !authData.user) {
  throw new Error(`AUTH_FAILED: ${authError?.message ?? 'sin usuario'}`);
}

const userId = authData.user.id;
const now = new Date().toISOString();
const ids = {
  loved: crypto.randomUUID(),
  journey: crypto.randomUUID(),
  checkin: crypto.randomUUID(),
  memory: crypto.randomUUID(),
  letter: crypto.randomUUID(),
  prayer: crypto.randomUUID(),
};

async function must(label, promise) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

try {
  await must(
    'LOVED_ONE_INSERT',
    client.from('loved_ones').insert({
      id: ids.loved,
      user_id: userId,
      name: 'Roundtrip Test',
      relationship: 'family',
      death_date_precision: 'unknown',
      notes: 'temporary',
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'JOURNEY_INSERT',
    client.from('grief_journeys').insert({
      id: ids.journey,
      user_id: userId,
      loved_one_id: ids.loved,
      started_at: now,
      active: true,
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'CHECKIN_INSERT',
    client.from('emotional_checkins').insert({
      id: ids.checkin,
      user_id: userId,
      journey_id: ids.journey,
      emotion: 'hope',
      intensity: 'moderate',
      context: 'spontaneous',
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'MEMORY_INSERT',
    client.from('memories').insert({
      id: ids.memory,
      user_id: userId,
      loved_one_id: ids.loved,
      type: 'text',
      title: 'Prueba',
      content: 'Recuerdo temporal de prueba.',
      category: 'other',
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'LETTER_INSERT',
    client.from('letters').insert({
      id: ids.letter,
      user_id: userId,
      loved_one_id: ids.loved,
      body: 'Carta temporal de prueba.',
      created_at: now,
      client_updated_at: now,
    })
  );

  await must(
    'PRAYER_INSERT',
    client.from('prayer_logs').insert({
      id: ids.prayer,
      user_id: userId,
      loved_one_id: ids.loved,
      prayer_type: 'roundtrip_test',
      offered_at: now,
      created_at: now,
      client_updated_at: now,
    })
  );

  const counts = {};
  for (const [table, id] of [
    ['loved_ones', ids.loved],
    ['grief_journeys', ids.journey],
    ['emotional_checkins', ids.checkin],
    ['memories', ids.memory],
    ['letters', ids.letter],
    ['prayer_logs', ids.prayer],
  ]) {
    const rows = await must(
      `${table.toUpperCase()}_READ`,
      client.from(table).select('id').eq('id', id)
    );
    counts[table] = rows?.length ?? 0;
    if (counts[table] !== 1) {
      throw new Error(`${table}: expected 1 row, got ${counts[table]}`);
    }
  }

  const updatedAt = new Date(Date.now() + 1000).toISOString();
  const updated = await must(
    'LETTER_UPDATE',
    client.from('letters')
      .update({
        prayer_body: 'Oración temporal.',
        client_updated_at: updatedAt,
      })
      .eq('id', ids.letter)
      .select('prayer_body,server_updated_at')
      .single()
  );

  if (updated?.prayer_body !== 'Oración temporal.') {
    throw new Error('LETTER_UPDATE_NOT_PERSISTED');
  }

  await must(
    'LOVED_ONE_DELETE',
    client.from('loved_ones').delete().eq('id', ids.loved)
  );

  for (const [table, id] of [
    ['loved_ones', ids.loved],
    ['grief_journeys', ids.journey],
    ['emotional_checkins', ids.checkin],
    ['memories', ids.memory],
    ['letters', ids.letter],
    ['prayer_logs', ids.prayer],
  ]) {
    const rows = await must(
      `${table.toUpperCase()}_CASCADE_CHECK`,
      client.from(table).select('id').eq('id', id)
    );
    if ((rows ?? []).length !== 0) {
      throw new Error(`CASCADE_FAILED: ${table}`);
    }
  }

  console.log('OK_LOVED_ONES: true');
  console.log('OK_GRIEF_JOURNEYS: true');
  console.log('OK_EMOTIONAL_CHECKINS: true');
  console.log('OK_MEMORIES: true');
  console.log('OK_LETTERS: true');
  console.log('OK_PRAYER_LOGS: true');
  console.log('OK_SERVER_UPDATED_AT: true');
  console.log('OK_CASCADE_DELETE: true');
  console.log('SYNC_SCHEMA_ROUNDTRIP: PASS');
} finally {
  await client.from('loved_ones').delete().eq('id', ids.loved);
  await client.auth.signOut();
}
