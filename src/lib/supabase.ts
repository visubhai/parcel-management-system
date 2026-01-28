
import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase Environment Variables. Check .env.local');
}

// Create and export the Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
