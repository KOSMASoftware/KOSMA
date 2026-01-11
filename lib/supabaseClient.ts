import { createClient } from '@supabase/supabase-js';

/**
 * Safe environment variable access for Vite.
 * We use optional chaining and a fallback object to prevent "Cannot read properties of undefined" errors
 * at runtime, while still allowing Vite to perform static replacement during the build process.
 */
const env = (import.meta as any).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

export const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'kosma-auth-token',
    flowType: 'pkce' 
  },
  global: {
    headers: { 'x-application-name': 'kosma-saas' }
  }
});

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 50;
};
