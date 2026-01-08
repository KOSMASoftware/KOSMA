
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: any;

const allowedOrigins = new Set([
  "https://kosma.io",
  "https://www.kosma.io",
  "https://kosma-lake.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
]);

function cors(origin: string | null) {
  const o = origin && allowedOrigins.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  // 1. STRICT CORS & PREFLIGHT
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin) });
  }

  // Echter Block mit CORS Header
  if (origin && !allowedOrigins.has(origin)) {
      return new Response(JSON.stringify({ error: "Forbidden origin" }), { 
          status: 403,
          headers: { ...cors(origin), "Content-Type": "application/json" }
      });
  }

  if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { 
          status: 405, 
          headers: { ...cors(origin), 'Content-Type': 'application/json' } 
      });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        return new Response(JSON.stringify({ error: "Missing auth token" }), { 
            status: 401, 
            headers: { ...cors(origin), 'Content-Type': 'application/json' } 
        });
    }
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY");

    const supabaseAuth = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401, 
            headers: { ...cors(origin), 'Content-Type': 'application/json' } 
        });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: license, error: licError } = await supabaseAdmin
        .from('licenses')
        .select('stripe_subscription_id, cancel_at_period_end')
        .eq('user_id', user.id)
        .single();

    if (licError || !license || !license.stripe_subscription_id) {
        return new Response(JSON.stringify({ error: "No active subscription found or sync pending." }), { 
            status: 404, 
            headers: { ...cors(origin), 'Content-Type': 'application/json' } 
        });
    }

    if (license.cancel_at_period_end) {
        return new Response(JSON.stringify({ success: true, message: "Subscription is already scheduled for cancellation." }), {
            status: 200,
            headers: { ...cors(origin), 'Content-Type': 'application/json' }
        });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });
    
    const updatedSub = await stripe.subscriptions.update(license.stripe_subscription_id, {
        cancel_at_period_end: true
    });

    const { error: updateError } = await supabaseAdmin.from('licenses').update({
        cancel_at_period_end: true,
        current_period_end: new Date(updatedSub.current_period_end * 1000).toISOString()
    }).eq('user_id', user.id);

    if (updateError) throw updateError;

    await supabaseAdmin.from('audit_logs').insert({
        actor_user_id: user.id,
        actor_email: user.email,
        action: 'CUSTOMER_CANCEL',
        target_user_id: user.id,
        details: { 
            stripe_subscription_id: license.stripe_subscription_id,
            previous_cancel_state: false,
            new_cancel_state: true,
            period_end: new Date(updatedSub.current_period_end * 1000).toISOString()
        }
    });

    return new Response(JSON.stringify({ success: true }), {
        headers: { ...cors(origin), 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Cancel Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { ...cors(origin), 'Content-Type': 'application/json' }
    });
  }
})
