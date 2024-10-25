import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL; // Ambil dari environment variable
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY; // Ambil dari environment variable

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
