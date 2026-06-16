import { createClient } from '@supabase/supabase-js';

// We use the Service Role key here because API routes are server-side 
// and we need permissions to insert data, bypassing Row Level Security (RLS) if enabled.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);