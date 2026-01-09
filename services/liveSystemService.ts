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
   * Pings the Supabase Database by running a lightweight query.
   */
  checkDatabaseConnection: async (): Promise<SystemCheckResult> => {
    if (!isSupabaseConfigured()) {
        return { 
            service: 'PostgreSQL DB', 
            status: 'configuring', 
            latency: 0, 
            message: 'Missing Credentials',
            details: 'SUPABASE_URL or Key is missing in lib/supabaseClient.ts.',
            actionLink: 'https://supabase.com/dashboard/project/_/settings/api'
        };
    }

    const start = performance.now();
    try {
      // Robust health check query
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1);
      const end = performance.now();
      
      if (error) {
         if (error.code === '42P01') {
             return { 
                 service: 'PostgreSQL DB', 
                 status: 'degraded', 
                 latency: Math.round(end - start), 
                 message: 'Profiles table missing',
                 details: 'Connection works, but "profiles" table is missing or RLS prevents access.\nRun the SQL setup script.',
                 actionLink: 'https://supabase.com/dashboard/project/_/editor'
             };
         }
         throw error;
      }

      return { 
          service: 'PostgreSQL DB', 
          status: 'operational', 
          latency: Math.round(end - start), 
          details: 'Authenticated Connection: OK\nQuery: SELECT count from profiles'
      };
    } catch (err: any) {
      return { service: 'PostgreSQL DB', status: 'down', latency: 0, message: 'Connection Failed', details: err.message };
    }
  },

  /**
   * Checks Supabase Auth
   */
  checkAuthService: async (): Promise<SystemCheckResult> => {
    if (!isSupabaseConfigured()) return { service: 'Supabase Auth', status: 'configuring', latency: 0, message: 'Not Configured' };

    const start = performance.now();
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return { 
          service: 'Supabase Auth', 
          status: 'operational', 
          latency: Math.round(performance.now() - start),
          details: `Auth Session: ${session ? 'Active' : 'No Session'}\nJWT Validation: OK`
      };
    } catch (err: any) {
      return { service: 'Supabase Auth', status: 'down', latency: 0, message: 'Unreachable', details: err.message };
    }
  },

  /**
   * Checks Realtime
   */
  checkRealtime: async (): Promise<SystemCheckResult> => {
    if (!isSupabaseConfigured()) return { service: 'Realtime Layer', status: 'configuring', latency: 0 };

    return new Promise((resolve) => {
        const start = performance.now();
        const channel = supabase.channel('system_health_check');

        const timeoutId = setTimeout(() => {
            supabase.removeChannel(channel);
            resolve({ service: 'Realtime Layer', status: 'down', latency: 5000, message: 'Timeout' });
        }, 5000);

        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                clearTimeout(timeoutId);
                supabase.removeChannel(channel);
                resolve({ 
                    service: 'Realtime Layer', 
                    status: 'operational', 
                    latency: Math.round(performance.now() - start),
                    details: 'WebSocket Handshake: OK'
                });
            }
        });
    });
  },

  /**
   * GENERIC EDGE FUNCTION CHECK
   */
  checkEdgeFunctionService: async (serviceName: 'Stripe API' | 'Elastic Email', target: 'stripe' | 'email'): Promise<SystemCheckResult> => {
      const start = performance.now();
      
      try {
          // Pointed to correct endpoint name from your list: swift-service
          const { data, error } = await supabase.functions.invoke('swift-service', {
              body: { check: target }
          });

          const latency = Math.round(performance.now() - start);

          if (data && data.success === false) {
              return {
                  service: serviceName,
                  status: 'down',
                  latency: latency,
                  message: 'Configuration Error',
                  details: `Edge Function connected, but reported error:\n"${data.error}"\n\nCheck your Secrets in Supabase.`
              };
          }

          if (error) {
              const isJwtIssue = error.message && (error.message.includes('401') || error.message.includes('404') || error.message.includes('Failed to fetch'));
              if (isJwtIssue) {
                  return {
                      service: serviceName,
                      status: 'deployment-needed',
                      latency: 0,
                      message: 'Access Denied (401/404)',
                      details: `The function 'swift-service' exists but rejected the connection.\n\nFIX: Go to Supabase Dashboard > Edge Functions > swift-service\nUNCHECK "Enforce JWT Verification".`,
                      actionLink: 'https://supabase.com/dashboard/project/_/functions/swift-service'
                  };
              }
              return { service: serviceName, status: 'down', latency: 0, message: 'Connection Failed', details: error.message };
          }

          return {
              service: serviceName,
              status: 'operational',
              latency: latency + (data.apiLatency || 0),
              details: `✅ LIVE: Authenticated & Connected\nMessage: ${data.message}`
          };

      } catch (err: any) {
           return { service: serviceName, status: 'down', latency: 0, message: 'Client Error', details: err.message };
      }
  },

  checkStripe: async (): Promise<SystemCheckResult> => {
      return liveSystemService.checkEdgeFunctionService('Stripe API', 'stripe');
  },

  checkEmail: async (): Promise<SystemCheckResult> => {
      return liveSystemService.checkEdgeFunctionService('Elastic Email', 'email');
  }
};