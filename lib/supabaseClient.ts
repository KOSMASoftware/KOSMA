import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION: SUPABASE CREDENTIALS
// ------------------------------------------------------------------

const env = (import.meta as any).env || {};

// Wir prüfen erst import.meta.env (Vite Standard), fallback auf Hardcoded (nur für dev)
const SUPABASE_URL: string = env.VITE_SUPABASE_URL || 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
const SUPABASE_ANON_KEY: string = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

// DEBUG: Zeige in der Konsole an, ob die Keys da sind (nur die ersten paar Zeichen)
console.log('--- KOSMA CONFIG CHECK ---');
console.log('URL provided by Env?', !!env.VITE_SUPABASE_URL);
console.log('URL used:', SUPABASE_URL);
console.log('Key provided by Env?', !!env.VITE_SUPABASE_ANON_KEY);
console.log('--------------------------');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConfigured = () => {
    return SUPABASE_URL.includes('supabase.co') && SUPABASE_ANON_KEY.length > 20;
};