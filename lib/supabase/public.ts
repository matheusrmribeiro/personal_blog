import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { getSupabaseConfig } from './config';

export function createPublicClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createSupabaseClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
