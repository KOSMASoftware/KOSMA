
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl || !serviceKey || !stripeKey) throw new Error("Config Error");

    // 1. AUTH CHECK (Admin only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Token");
    
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    
    if (profile?.role !== 'admin') throw new Error("Forbidden: Admin access only");

    // 2. PARSE REQUEST
    const { action, userId, payload } = await req.json();

    if (action === 'update_license') {
        const { plan_tier, status, admin_override_date } = payload;
        
        // Fetch current license to check for Stripe connection
        const { data: license } = await supabaseAdmin.from('licenses').select('*').eq('user_id', userId).single();
        
        // STRIPE SYNC LOGIC
        if (license?.stripe_subscription_id) {
            const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });
            
            // If admin changes status to 'active' from 'canceled', we might need to reactivate in Stripe
            // For now, we only implement the 'cancel_at_period_end' sync if status is toggled
            if (status === 'canceled' && license.status === 'active') {
                await stripe.subscriptions.update(license.stripe_subscription_id, { cancel_at_period_end: true });
            } else if (status === 'active' && license.cancel_at_period_end) {
                await stripe.subscriptions.update(license.stripe_subscription_id, { cancel_at_period_end: false });
            }

            // Note: Changing Plan Tier via Admin for Stripe Subscriptions is complex (proration, prices).
            // In this prototype, we update the DB mostly, assuming Admin knows what they are doing 
            // or is fixing a sync issue. If we wanted to change the actual Stripe Price, we'd need to lookup Price IDs again.
        }

        // DB UPDATE
        const updateData: any = {};
        if (plan_tier) updateData.plan_tier = plan_tier;
        if (status) updateData.status = status;
        if (admin_override_date !== undefined) updateData.admin_valid_until_override = admin_override_date; // can be null to clear

        const { error } = await supabaseAdmin.from('licenses').update(updateData).eq('user_id', userId);
        if (error) throw error;

        // Audit Log handled by SQL Trigger "log_admin_license_update" (already set up by user)
        
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error("Unknown Action");

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
