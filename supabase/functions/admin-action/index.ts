
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

    // --- ACTION: UPDATE LICENSE ---
    if (action === 'update_license') {
        const { plan_tier, status, admin_override_date } = payload;
        
        // Date Validation
        if (admin_override_date && isNaN(Date.parse(admin_override_date))) {
            throw new Error("Invalid date format for admin_override_date");
        }

        // Fetch current license to check for Stripe connection
        const { data: license } = await supabaseAdmin.from('licenses').select('*').eq('user_id', userId).maybeSingle();
        
        let stripeSyncInfo = "No Stripe Subscription linked.";

        // STRIPE SYNC LOGIC
        if (license?.stripe_subscription_id && license.stripe_subscription_id.startsWith('sub_')) {
            const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });
            
            try {
                // A. Status Toggle Sync (Cancel/Reactivate)
                if (status === 'canceled' && license.status === 'active') {
                    await stripe.subscriptions.update(license.stripe_subscription_id, { cancel_at_period_end: true });
                    stripeSyncInfo = "Stripe set to cancel at period end.";
                } else if (status === 'active' && license.cancel_at_period_end) {
                    await stripe.subscriptions.update(license.stripe_subscription_id, { cancel_at_period_end: false });
                    stripeSyncInfo = "Stripe cancellation removed.";
                }

                // B. Date/Extension Sync
                if (admin_override_date) {
                    const newAnchor = Math.floor(new Date(admin_override_date).getTime() / 1000);
                    
                    await stripe.subscriptions.update(license.stripe_subscription_id, {
                        billing_cycle_anchor: newAnchor,
                        proration_behavior: 'none'
                    });
                    stripeSyncInfo = `Stripe billing cycle shifted to ${admin_override_date}`;
                }
            } catch (stripeErr: any) {
                console.error("Stripe Sync Failed:", stripeErr);
                throw new Error(`Stripe Sync Failed: ${stripeErr.message}. Database was NOT updated.`);
            }
        }

        // DB UPSERT (Fix: Use Upsert instead of Update to handle missing rows)
        const upsertData: any = {
            user_id: userId,
            // Default fields if creating new
            billing_cycle: license?.billing_cycle || 'none',
            product_name: license?.product_name || 'KOSMA',
        };

        if (plan_tier) upsertData.plan_tier = plan_tier;
        if (status) upsertData.status = status;
        
        // Always update override date (even if null to clear it)
        upsertData.admin_valid_until_override = admin_override_date === '' ? null : admin_override_date;

        const { error } = await supabaseAdmin.from('licenses').upsert(upsertData, { onConflict: 'user_id' });
        
        if (error) {
            console.error("DB Upsert Error:", error);
            throw error;
        }

        return new Response(JSON.stringify({ success: true, message: stripeSyncInfo }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ACTION: DELETE USER ---
    if (action === 'delete_user') {
        if (!userId) throw new Error("Missing userId");

        // 1. Check Constraint: Stripe Customer ID must be NULL
        const { data: targetProfile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', userId)
            .single();
        
        // Allow deletion if profile is missing (cleanup orphan auth user)
        if (!fetchError && targetProfile?.stripe_customer_id) {
            throw new Error("Cannot delete user: Active Stripe Customer ID found. Please manage via Stripe Dashboard.");
        }

        // 2. Perform Clean-up
        await supabaseAdmin.from('licenses').delete().eq('user_id', userId);
        await supabaseAdmin.from('profiles').delete().eq('id', userId);
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ success: true, message: "User deleted successfully" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error(`Unknown Action: ${action}`);

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})