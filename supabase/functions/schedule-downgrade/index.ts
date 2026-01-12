
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from "https://esm.sh/stripe@14.21.0"

declare const Deno: any;

const allowedOrigins = [
  "https://kosma.io", "https://www.kosma.io", "https://kosma-lake.vercel.app",
  "http://localhost:5173", "http://localhost:3000"
];

const planRank: Record<string, number> = {
  "Budget": 1,
  "Cost Control": 2,
  "Production": 3
};

const priceMap: Record<string, { plan: string; cycle: 'monthly' | 'yearly' }> = {
  "price_1NkjgTHdGtVVCQC4e1MOxpn9": { plan: "Budget", cycle: "monthly" },
  "price_1Nkji1HdGtVVCQC4NdxwLhTv": { plan: "Budget", cycle: "yearly" },
  "price_1Nkjj0HdGtVVCQC4QCtAKinT": { plan: "Cost Control", cycle: "monthly" },
  "price_1NkjkZHdGtVVCQC4PpOt4PCM": { plan: "Cost Control", cycle: "yearly" },
  "price_1NkjlMHdGtVVCQC4AhhfH1SM": { plan: "Production", cycle: "monthly" },
  "price_1ODWDvHdGtVVCQC4uThFHNv3": { plan: "Production", cycle: "yearly" }
};

const planCycleToPrice: Record<string, string> = Object.entries(priceMap)
  .reduce((acc, [priceId, meta]) => {
    acc[`${meta.plan}:${meta.cycle}`] = priceId;
    return acc;
  }, {} as Record<string, string>);

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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!supabaseUrl || !anonKey || !serviceKey || !stripeKey) throw new Error("Cloud Config Missing");

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized: No token");

    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized: Invalid Token");

    const body = await req.json().catch(() => ({}));
    if (body.action === 'ping') {
      return new Response(JSON.stringify({ success: true, message: "schedule-downgrade operational", user: user.email }),
{
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const targetPlan = typeof body.planTier === 'string' ? body.planTier : null;
    const targetCycle = body.billingCycle === 'yearly' ? 'yearly' : (body.billingCycle === 'monthly' ? 'monthly' : null);
    if (!targetPlan || !targetCycle) throw new Error("Missing target plan or billingCycle");

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: license } = await admin
      .from('licenses')
      .select('stripe_subscription_id, plan_tier, billing_cycle')
      .eq('user_id', user.id)
      .maybeSingle();

    const subscriptionId = license?.stripe_subscription_id;
    if (!subscriptionId) throw new Error("No Stripe subscription found for user");

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const currentItem = subscription.items.data[0];
    const currentPriceId = currentItem?.price?.id || '';
    const currentMeta = priceMap[currentPriceId] || {
      plan: license?.plan_tier || 'Production',
      cycle: (license?.billing_cycle === 'yearly' ? 'yearly' : 'monthly')
    };

    const targetPriceId = planCycleToPrice[`${targetPlan}:${targetCycle}`];
    if (!targetPriceId) throw new Error("Unknown target plan/cycle mapping");
    if (currentPriceId === targetPriceId) throw new Error("Already on target plan");

    const currentRank = planRank[currentMeta.plan] || 0;
    const targetRank = planRank[targetPlan] || 0;
    const isSamePlan = currentMeta.plan === targetPlan;
    const isDowngrade = targetRank < currentRank || (isSamePlan && currentMeta.cycle === 'yearly' && targetCycle ===
'monthly');
    if (!isDowngrade) throw new Error("Downgrade only. Upgrades must use the billing portal.");

    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;
    if (!currentPeriodStart || !currentPeriodEnd) throw new Error("Missing subscription period boundaries");

    const items = subscription.items.data.map((item) => ({
      price: item.price.id,
      quantity: item.quantity ?? 1
    }));

    let scheduleId = typeof subscription.schedule === 'string' ? subscription.schedule : null;
    if (!scheduleId) {
      const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subscription.id });
      scheduleId = schedule.id;
    }

    await stripe.subscriptionSchedules.update(scheduleId, {
      end_behavior: "release",
      phases: [
        {
          items,
          start_date: currentPeriodStart,
          end_date: currentPeriodEnd,
          proration_behavior: "none"
        },
        {
          items: [{ price: targetPriceId, quantity: 1 }],
          start_date: currentPeriodEnd,
          proration_behavior: "none"
        }
      ]
    });

    const effectiveAt = new Date(currentPeriodEnd * 1000).toISOString();
    return new Response(JSON.stringify({ success: true, effectiveAt, targetPlan, targetCycle }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
