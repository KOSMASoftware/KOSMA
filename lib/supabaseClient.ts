import { createClient } from '@supabase/supabase-js';

// WICHTIG: Vite benötigt die exakte Schreibweise 'import.meta.env.VARIABLE', 
// um diese beim Build-Prozess statisch durch den Wert zu ersetzen.
// Wir nutzen 'fallback'-Strings für den Fall, dass die Variablen in Vercel nicht gesetzt sind.

// Fix: Silence TypeScript error for env property on ImportMeta to keep Vite's static replacement working
// @ts-ignore
const SUPABASE_URL = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) 
// @ts-ignore
  ? import.meta.env.VITE_SUPABASE_URL 
  : 'https://zpnbnjvhklgxfhsoczbp.supabase.co';

// Fix: Silence TypeScript error for env property on ImportMeta to keep Vite's static replacement working
// @ts-ignore
const SUPABASE_ANON_KEY = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
// @ts-ignore
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

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
