
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

// 1. STRICT CORS SETUP
const allowedOrigins = new Set([
  "https://kosma.io",
  "https://www.kosma.io",
  "https://kosma-lake.vercel.app",
  "http://localhost:5173", // Vite Local
  "http://localhost:3000"  // Alternative Local
]);

function cors(origin: string | null) {
  const o = origin && allowedOrigins.has(origin) ? origin : "https://kosma.io";
  return {
    "Access-Control-Allow-Origin": o,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, hx-request, hx-current-url",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  // 2. Preflight Request (Browser Check)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin) });
  }

  try {
    // 3. AUTH CHECK
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), { 
        status: 401, 
        headers: { ...cors(origin), "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!; 

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), { 
        status: 401, 
        headers: { ...cors(origin), "Content-Type": "application/json" } 
      });
    }

    const { tier, cycle } = await req.json();
    console.log(`[SECURE LOG] User ${user.id} returned from checkout for ${tier}/${cycle}. Waiting for webhook.`);

    // SECURITY FIX: 
    // We do NOT write 'active' status or create invoices here anymore.
    // This endpoint only acknowledges the return. The Webhook is the single source of truth.
    
    return new Response(JSON.stringify({ success: true, message: "Return acknowledged. Syncing..." }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
