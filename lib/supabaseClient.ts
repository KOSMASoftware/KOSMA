import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * We use the exact 'import.meta.env.VITE_...' string to allow Vite's static replacement.
 * The fallback strings are intentional to ensure the frontend remains functional 
 * even if environment variables are missing during build.
 */

const SUPABASE_URL =
  // Fix: Adding @ts-ignore to silences the TS error for Vite's import.meta.env while ensuring static replacement still works at build time.
  // @ts-ignore
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://zpnbnjvhklgxfhsoczbp.supabase.co';

const SUPABASE_ANON_KEY =
  // Fix: Adding @ts-ignore to silences the TS error for Vite's import.meta.env while ensuring static replacement still works at build time.
  // @ts-ignore
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

// For console debugging in prototype mode
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 50;
};
