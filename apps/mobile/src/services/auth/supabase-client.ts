import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseConfig } from '@/config/supabase';

import { secureAuthStorage } from './secure-auth-storage';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfig.isConfigured) {
    return null;
  }

  if (!client) {
    client = createClient(
      supabaseConfig.url,
      supabaseConfig.publishableKey,
      {
        auth: {
          storage: secureAuthStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return client;
}
