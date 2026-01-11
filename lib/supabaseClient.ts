import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * We use the exact 'import.meta.env.VITE_...' string to allow Vite's static replacement.
 * The optional chaining and null-coalescing provide a safe fallback for the prototype
 * if the environment variables are not injected into the production bundle.
 */

// @ts-ignore
const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || 'https://zpnbnjvhklgxfhsoczbp.supabase.co').trim();

// @ts-ignore
const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8').trim();

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