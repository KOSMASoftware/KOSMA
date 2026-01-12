
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

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized: No token");
    
    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized: Invalid Token");

    const body = await req.json().catch(() => ({}));
    if (body.action === 'ping') {
        return new Response(JSON.stringify({ success: true, message: "mark-login operational", user: user.email }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (serviceKey) {
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from('profiles').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
