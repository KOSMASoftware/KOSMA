
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const allowedOrigins = [
  "https://kosma.io", "https://www.kosma.io", "https://kosma-lake.vercel.app",
  "http://localhost:5173", "http://localhost:3000"
];

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !anonKey) throw new Error("Cloud Config Missing");

    const body = await req.json().catch(() => ({}));
    
    if (body.action === 'ping') {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        let authStatus = "none";
        let userEmail = null;

        if (token) {
            const supabaseAuth = createClient(supabaseUrl, anonKey);
            const { data } = await supabaseAuth.auth.getUser(token);
            if (data?.user) {
                authStatus = "valid";
                userEmail = data.user.email;
            } else {
                authStatus = "invalid";
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: "system-health operational",
            authStatus,
            user: userEmail,
            timestamp: new Date().toISOString()
        }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
