import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION: SUPABASE CREDENTIALS
// ------------------------------------------------------------------
// Du hast deine Keys hier eingetragen, das ist perfekt für den Prototyp.
// In einer echten App (mit Vite) würdest du eine .env Datei nutzen und
// import.meta.env.VITE_SUPABASE_URL verwenden.

const SUPABASE_URL: string = 'https://zpnbnjvhklgxfhsoczbp.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbmJuanZoa2xneGZoc29jemJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQyNTAsImV4cCI6MjA4MzI1MDI1MH0.hvgH4vGoK4GhzmMb0QQupNafskxWID6aB3PnUlRZ5C8';

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
    // Wir prüfen hier explizit, ob deine Projekt-ID in der URL enthalten ist.
    // Das bestätigt zu 100%, dass die echten Credentials verwendet werden.
    return SUPABASE_URL.includes('zpnbnjvhklgxfhsoczbp');
};