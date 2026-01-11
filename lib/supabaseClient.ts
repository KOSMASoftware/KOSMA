import { createClient } from '@supabase/supabase-js';

// Fallback-Werte für den Prototyp
let SUPABASE_URL = 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

try {
  // Wir nutzen die expliziten Literale, damit Vite sie beim Build finden und ersetzen kann.
  // Das try-catch verhindert den Absturz, falls import.meta.env zur Laufzeit fehlt.
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) {
    // @ts-ignore
    SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    // @ts-ignore
    SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
} catch (e) {
  console.warn("Supabase Config: Using fallback environment values.");
}

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