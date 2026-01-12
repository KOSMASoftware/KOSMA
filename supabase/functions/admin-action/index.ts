
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const allowedOrigins = [
  "https://kosma.io", "https://www.kosma.io", "https://kosma-lake.vercel.app",
  "http://localhost:5173", "http://localhost:3000"
];

const OWNER_EMAIL = 'mail@joachimknaf.de';

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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceKey) throw new Error("Cloud Config Missing");

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    // 1. JWT Manuell verifizieren (Bypass Gateway Check)
    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token || "");
    
    if (authError || !user) {
        // Ping-Check erlauben wir auch ohne Auth für die System-Health Übersicht
        const body = await req.json().catch(() => ({}));
        if (body.action === 'ping') {
            return new Response(JSON.stringify({ success: true, message: "admin-action operational (unauthenticated)" }), { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }
        throw new Error("Unauthorized: Invalid Token");
    }

    // 2. Admin Check (Owner Email oder DB Role)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const isOwner = user.email?.toLowerCase().trim() === OWNER_EMAIL;
    
    let isAdmin = isOwner;
    if (!isAdmin) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') isAdmin = true;
    }

    if (!isAdmin) throw new Error("Forbidden: Admin privileges required");

    const body = await req.json().catch(() => ({}));

    // 3. Actions implementieren
    if (body.action === 'ping') {
        return new Response(JSON.stringify({ success: true, message: "admin-action operational", user: user.email, isAdmin }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    if (body.action === 'update_license') {
        const { userId, payload } = body;
        const { error } = await supabaseAdmin
            .from('licenses')
            .update({
                plan_tier: payload.plan_tier,
                status: payload.status,
                admin_valid_until_override: payload.admin_override_date,
                admin_override_at: new Date().toISOString(),
                admin_override_by: user.email
            })
            .eq('user_id', userId);
        
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (body.action === 'delete_user') {
        const { userId } = body;
        // Auth User permanent löschen
        const { error: authDelError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authDelError) throw authDelError;

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: false, error: "Unknown action" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[AdminAction Error]", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: error.message.includes("Unauthorized") ? 401 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
