
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing credentials");
    }

    const { user_id } = await req.json();

    if (!user_id) {
        throw new Error("Missing user_id");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // LOGIC FIX:
    // 1. Fetch current state first to check if first_login_at is already set.
    // 2. Prepare update object.
    // 3. Execute update once.
    
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('first_login_at')
        .eq('id', user_id)
        .single();
    
    const now = new Date().toISOString();
    
    const updates: any = {
        last_login_at: now
    };

    // Only set first_login_at if it is currently null (first time user logs in)
    if (!profile?.first_login_at) {
        updates.first_login_at = now;
    }

    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', user_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, message: "Login tracked" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})