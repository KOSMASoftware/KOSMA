import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Wir greifen sicher auf import.meta.env zu. Falls der Code ungebündelt im Browser läuft
 * (z.B. bei Fehlkonfiguration von Vercel), fangen wir den Fehler ab und nutzen Fallbacks.
 */

let envUrl: string | undefined;
let envKey: string | undefined;

try {
  // @ts-ignore
  envUrl = import.meta.env?.VITE_SUPABASE_URL;
  // @ts-ignore
  envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
} catch (e) {
  console.warn("Umgebungsvariablen konnten nicht gelesen werden. Nutze Prototyp-Fallbacks.");
}

const SUPABASE_URL = envUrl || 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
const SUPABASE_ANON_KEY = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

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

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

export const isSupabaseConfigured = () => {
  return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 50;
};