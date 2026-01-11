import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};

const SUPABASE_URL =
  env.VITE_SUPABASE_URL || 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYX' +
  'QiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 20;
};