import { createClient } from '@supabase/supabase-js'

// Server-side only Supabase client using secret key
// This should ONLY be used in server actions and API routes
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!
  
  return createClient(supabaseUrl, supabaseSecretKey)
}

