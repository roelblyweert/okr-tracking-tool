import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// PASTE YOUR SUPABASE VALUES HERE (one-time, via the GitHub web editor).
//
// Find them in your Supabase project: Settings -> API
//   - SUPABASE_URL      = "Project URL"
//   - SUPABASE_ANON_KEY = "anon public" key
//
// The anon key is SAFE to commit and expose publicly — it only grants the
// access your Row-Level Security policies allow. NEVER paste the
// "service_role" key here or anywhere in the repo. See CLAUDE.md.
// ---------------------------------------------------------------------------
export const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_PROJECT_URL_HERE';
export const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE';

export const isSupabaseConfigured =
  !SUPABASE_URL.startsWith('PASTE_') && !SUPABASE_ANON_KEY.startsWith('PASTE_');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
