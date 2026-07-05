import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase server environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file'
  );
}

// Server-side Supabase client with service role key.
// This bypasses RLS and should ONLY be used in trusted server contexts (API routes).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
