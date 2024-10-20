import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcddtfjutcweujoqwtlu.supabase.co'; // Dapatkan dari Supabase dashboard
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZGR0Zmp1dGN3ZXVqb3F3dGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5NTk3ODEsImV4cCI6MjA0NDUzNTc4MX0.wKIM-BdqL2ykUG9mFvOsQmRbOT9sUXMgjleoZysmyYQ'; // Dapatkan dari Supabase dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);