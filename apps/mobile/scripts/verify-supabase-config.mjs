import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('FAIL: .env.local no existe.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return index === -1
        ? [line.trim(), '']
        : [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const url = env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

if (!/^https:\/\/.+\.supabase\.co$/i.test(url)) {
  console.error('FAIL: URL de Supabase inválida.');
  process.exit(1);
}

if (!key.startsWith('sb_publishable_')) {
  console.error('WAITING: falta EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(2);
}

const response = await fetch(`${url}/auth/v1/settings`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!response.ok) {
  console.error(`FAIL: Auth settings respondió HTTP ${response.status}.`);
  process.exit(1);
}

const settings = await response.json();

console.log('OK: proyecto Supabase accesible con publishable key.');
console.log(`URL: ${url}`);
console.log(`SIGNUPS_DISABLED: ${Boolean(settings.disable_signup)}`);
console.log('READY_FOR_APP_TEST: true');
