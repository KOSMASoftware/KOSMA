
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: any;

const allowedOrigins = [
  "https://kosma.io", "https://www.kosma.io", "https://kosma-lake.vercel.app",
  "http://localhost:5173", "http://localhost:3000"
];

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name, stripe-signature',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method === 'POST') {
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text().catch(() => "");
      if (bodyText.includes('"action":"ping"')) {
          return new Response(JSON.stringify({ success: true, message: "stripe-webhook operational" }), { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
      }
  }
  // ... rest of stripe logic ...
  return new Response(JSON.stringify({ received: true }), { headers: corsHeaders });
})
