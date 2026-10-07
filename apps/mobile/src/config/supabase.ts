const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';
const supabaseSyncEnabled =
  process.env.EXPO_PUBLIC_SUPABASE_SYNC_ENABLED?.trim().toLowerCase() === 'true';

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
  syncEnabled: supabaseSyncEnabled,
  isConfigured:
    /^https:\/\/.+\.supabase\.co$/i.test(supabaseUrl) &&
    supabasePublishableKey.startsWith('sb_publishable_'),
} as const;
