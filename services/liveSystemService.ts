
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface SystemCheckResult {
  service: string;
  status: 'operational' | 'degraded' | 'down' | 'configuring' | 'deployment-needed';
  latency: number;
  message?: string;
  details?: string;
  actionLink?: string;
}

export const liveSystemService = {
  /**
   * Deep DB Check: Prüft Lese- UND Schreibrechte (RLS).
   */
  checkDatabaseConnection: async (): Promise<SystemCheckResult> => {
    if (!isSupabaseConfigured()) {
        return { service: 'PostgreSQL DB', status: 'configuring', latency: 0 };
    }

    const start = performance.now();
    try {
      // 1. Lese-Test
      const { error: readError } = await supabase.from('profiles').select('id').limit(1);
      if (readError) throw new Error(`RLS Lese-Fehler: ${readError.message}`);

      // 2. Schreib-Test (Wir versuchen ein Feld zu aktualisieren, falls eingeloggt)
      const { data: { user } } = await supabase.auth.getUser();
      let writeStatus = "Schreib-Check übersprungen (nicht eingeloggt)";
      
      if (user) {
          const { error: writeError } = await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
          
          if (writeError) {
              return {
                  service: 'PostgreSQL DB',
                  status: 'degraded',
                  latency: Math.round(performance.now() - start),
                  message: 'Eingeschränkt',
                  details: `LESEN ok, aber SCHREIBEN verboten: ${writeError.message}. Prüfe deine RLS Policies!`
              };
          }
          writeStatus = "Lesen & Schreiben erfolgreich.";
      }

      return { 
          service: 'PostgreSQL DB', 
          status: 'operational', 
          latency: Math.round(performance.now() - start), 
          details: writeStatus
      };
    } catch (err: any) {
      return { service: 'PostgreSQL DB', status: 'down', latency: 0, details: err.message };
    }
  },

  checkAuthService: async (): Promise<SystemCheckResult> => {
    const start = performance.now();
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { 
          service: 'Supabase Auth', 
          status: 'operational', 
          latency: Math.round(performance.now() - start),
          details: session ? 'Session aktiv & validiert' : 'Service erreichbar (kein User)'
      };
    } catch (err: any) {
      return { service: 'Supabase Auth', status: 'down', latency: 0, details: err.message };
    }
  },

  /**
   * Prüft Edge Functions über das system-health Modul.
   */
  checkEdgeFunctionService: async (serviceName: string, target: 'stripe' | 'email'): Promise<SystemCheckResult> => {
      const start = performance.now();
      try {
          const { data, error } = await supabase.functions.invoke('system-health', {
              body: { check: target }
          });

          if (error) {
              const details = error.message?.includes('404') 
                ? "Funktion 'system-health' wurde nicht in Supabase gefunden. Bitte 'supabase functions deploy system-health' ausführen."
                : error.message;
              return { service: serviceName, status: 'deployment-needed', latency: 0, message: 'Nicht erreichbar', details };
          }

          if (data && data.success === false) {
              return { service: serviceName, status: 'down', latency: 0, message: 'Backend Fehler', details: data.error };
          }

          return { 
            service: serviceName, 
            status: 'operational', 
            latency: Math.round(performance.now() - start), 
            details: data.message 
          };
      } catch (err: any) {
          return { service: serviceName, status: 'down', latency: 0, details: err.message };
      }
  }
};
