
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!supabaseUrl || !anonKey) throw new Error("Cloud Config Missing");

    const body = await req.json().catch(() => ({}));
    
    // STRIPE CONNECTIVITY CHECK
    if (body.action === 'check_stripe') {
        if (!stripeKey) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: "STRIPE_SECRET_KEY is not set in Supabase Vault." 
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        try {
            const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
            const account = await stripe.accounts.retrieve();
            return new Response(JSON.stringify({ 
                success: true, 
                mode: stripeKey.startsWith('sk_test') ? 'test' : 'live',
                accountName: account.settings?.dashboard.display_name || account.id,
                details: "Stripe API Connection Successful"
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e: any) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: `Stripe API Error: ${e.message}` 
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
    }

    // DEFAULT PING / AUTH DIAGNOSE
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
            hasStripeKey: !!stripeKey,
            stripeMode: stripeKey?.startsWith('sk_test') ? 'test' : 'live',
            timestamp: new Date().toISOString()
        }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    return new Response(JSON.stringify({ success: true, message: "Use action: ping or check_stripe" }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
