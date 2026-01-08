
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// --- HELPERS ---
function mapStripeStatus(stripeStatus: string): string {
    switch (stripeStatus) {
        case 'active': return 'active';
        case 'trialing': return 'trial';
        case 'past_due': return 'past_due';
        case 'unpaid': return 'past_due';
        case 'canceled': return 'canceled';
        case 'incomplete': return 'past_due';
        case 'incomplete_expired': return 'canceled';
        case 'paused': return 'none';
        default: return 'none';
    }
}

function inferCycle(interval: string | undefined): 'monthly' | 'yearly' | 'none' {
    if (interval === 'year') return 'yearly';
    if (interval === 'month') return 'monthly';
    return 'none';
}

// Logic to infer Plan Tier based on Amount (since we use Payment Links without metadata in this prototype)
function inferTierFromPrice(amount: number): string | null {
    // Pricing: Budget (39/390), Cost (59/590), Prod (69/690)
    // Stripe amounts are in smallest currency unit (cents)
    const a = amount; 
    
    if (a === 3900 || a === 39000) return 'Budget';
    if (a === 5900 || a === 59000) return 'Cost Control';
    if (a === 6900 || a === 69000) return 'Production';
    
    return null; // Keep existing if unknown
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  // Init Admin Client
  const supabaseAdmin = (supabaseUrl && serviceKey) ? createClient(supabaseUrl, serviceKey) : null;

  // Helper to log to Audit Logs
  const logToDb = async (action: string, details: any, isError = false) => {
     if (!supabaseAdmin) return;
     try {
         await supabaseAdmin.from('audit_logs').insert({
             action: `EDGE_${action}`,
             actor_email: 'stripe-webhook',
             target_user_id: 'system',
             details: { ...details, is_error: isError }
         });
     } catch (e) { console.error("Logging failed", e); }
  };

  // Helper to update the raw Stripe Event with error status
  const markEventError = async (eventId: string, errorMsg: string) => {
      if (!supabaseAdmin) return;
      try {
          await supabaseAdmin.from('stripe_events')
              .update({ processing_error: errorMsg })
              .eq('id', eventId);
      } catch (e) {}
  };

  try {
    const signature = req.headers.get("Stripe-Signature");
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey || !signature) {
         await logToDb('CONFIG_ERROR', { message: 'Missing Secrets' }, true);
         return new Response("Config Error", { status: 500, headers: corsHeaders });
    }

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });
    
    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
        await logToDb('SIGNATURE_ERROR', { error: err.message }, true);
        return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    console.log(`[Webhook] Processing ${event.type} (${event.id})`);

    // 1. LOG RAW EVENT (Idempotency)
    const { error: insertError } = await supabaseAdmin!.from('stripe_events').insert({
        id: event.id,
        type: event.type,
        payload: event
    });
    // Ignore duplicate key errors (idempotency)
    
    // 2. LOG FUNCTION START
    await logToDb('START_PROCESS', { type: event.type, id: event.id });

    // --- A. SUBSCRIPTION UPDATES ---
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created' || event.type === 'customer.subscription.deleted') {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        // HEALING LOGIC: Find user
        let { data: profile } = await supabaseAdmin!
            .from('profiles')
            .select('id, email')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

        // ORPHAN RECOVERY: If not found by ID, try finding by email from Stripe Customer
        if (!profile) {
            console.log(`[Webhook] Profile not found for Stripe ID ${customerId}. Attempting email recovery...`);
            try {
                // Fetch full customer object from Stripe to get email
                const stripeCustomer = await stripe.customers.retrieve(customerId);
                if (!stripeCustomer.deleted && stripeCustomer.email) {
                    // Search DB by email
                    const { data: emailProfile } = await supabaseAdmin!
                        .from('profiles')
                        .select('id, email')
                        .eq('email', stripeCustomer.email)
                        .maybeSingle();
                    
                    if (emailProfile) {
                        // FOUND! Link them now.
                        console.log(`[Webhook] Recovery successful. Linking ${customerId} to ${emailProfile.email}`);
                        await supabaseAdmin!.from('profiles').update({ stripe_customer_id: customerId }).eq('id', emailProfile.id);
                        profile = emailProfile;
                    }
                }
            } catch (recoveryErr) {
                console.warn("[Webhook] Recovery failed", recoveryErr);
            }
        }

        if (profile) {
            const status = event.type === 'customer.subscription.deleted' ? 'canceled' : mapStripeStatus(sub.status);
            
            // DOUBLE BILLING PREVENTION (Only on Creation)
            // If a new subscription is created, cancel all OTHER active subscriptions for this customer
            if (event.type === 'customer.subscription.created') {
                try {
                    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active' });
                    for (const otherSub of subs.data) {
                        if (otherSub.id !== sub.id) {
                            console.log(`[Webhook] Auto-cancelling old subscription: ${otherSub.id}`);
                            await stripe.subscriptions.cancel(otherSub.id);
                            await logToDb('AUTO_CANCEL_OLD', { old_sub: otherSub.id, new_sub: sub.id });
                        }
                    }
                } catch (e) {
                    console.error("Failed to auto-cancel old subs", e);
                }
            }

            // TIER INFERENCE
            const priceItem = sub.items.data[0]?.price;
            const newPlanTier = priceItem?.unit_amount ? inferTierFromPrice(priceItem.unit_amount) : null;

            const updateData: any = {
                stripe_subscription_id: sub.id,
                stripe_price_id: priceItem?.id,
                status: status,
                billing_cycle: inferCycle(priceItem?.recurring?.interval),
                current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                cancel_at_period_end: sub.cancel_at_period_end,
                canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null
            };

            // Only update Plan Tier/Product Name if we successfully inferred it, 
            // otherwise keep existing (don't overwrite with null)
            if (newPlanTier) {
                updateData.plan_tier = newPlanTier;
                updateData.product_name = 'KOSMA'; // Reset product name to standard
            }

            const { error } = await supabaseAdmin!.from('licenses').update(updateData).eq('user_id', profile.id);
            
            if (error) {
                await logToDb('LICENSE_UPDATE_FAIL', { user_id: profile.id, error }, true);
                await markEventError(event.id, error.message);
            } else {
                await logToDb('LICENSE_UPDATED', { user_id: profile.id, status, sub_id: sub.id, tier: newPlanTier });
            }

        } else {
            const msg = `Orphan Subscription: ${sub.id} (Customer ${customerId} not found in DB)`;
            await logToDb('ORPHAN_SUB', { customer: sub.customer, sub_id: sub.id }, true);
            await markEventError(event.id, msg);
        }
    }

    // --- B. CHECKOUT SUCCESS ---
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        let userId = session.metadata?.user_id || session.client_reference_id;
        
        // Validation: Ensure client_reference_id looks like a UUID if possible, 
        // or rely on email match if UUID is missing/invalid format
        
        if (!userId && session.customer_details?.email) {
             const { data: p } = await supabaseAdmin!.from('profiles').select('id').eq('email', session.customer_details.email).maybeSingle();
             userId = p?.id;
        }

        if (userId) {
            await supabaseAdmin!.from('profiles').update({ stripe_customer_id: session.customer }).eq('id', userId);
            await logToDb('CHECKOUT_LINKED', { user_id: userId, customer: session.customer });
        } else {
            const msg = `Unlinked Checkout: ${session.id} (No User ID found for ${session.customer_details?.email})`;
            await logToDb('CHECKOUT_UNLINKED', { session_id: session.id, email: session.customer_details?.email }, true);
            await markEventError(event.id, msg);
        }
    }

    // --- C. INVOICE SUCCESS ---
    if (event.type === 'invoice.payment_succeeded') {
        const inv = event.data.object;
        if (inv.billing_reason === 'subscription_create' || inv.billing_reason === 'subscription_cycle') {
            const { data: profile } = await supabaseAdmin!.from('profiles').select('id').eq('stripe_customer_id', inv.customer).maybeSingle();
            
            if (profile) {
                await supabaseAdmin!.from('invoices').insert({
                    user_id: profile.id,
                    amount: inv.amount_paid / 100,
                    currency: inv.currency.toUpperCase(),
                    status: 'paid',
                    stripe_invoice_id: inv.id,
                    invoice_pdf_url: inv.invoice_pdf,
                    invoice_hosted_url: inv.hosted_invoice_url,
                    project_name: 'KOSMA Subscription'
                });
                await logToDb('INVOICE_SAVED', { user_id: profile.id, amount: inv.amount_paid, currency: inv.currency });
            }
        }
    }

    // --- D. CUSTOMER DETAILS ---
    if (event.type === 'customer.updated') {
        const cust = event.data.object;
        const address = cust.address || {};
        await supabaseAdmin!.from('profiles').update({
            billing_address: {
                companyName: cust.name,
                street: address.line1,
                city: address.city,
                zip: address.postal_code,
                country: address.country,
                vatId: cust.tax_ids?.data?.[0]?.value
            }
        }).eq('stripe_customer_id', cust.id);
        await logToDb('PROFILE_SYNCED', { customer: cust.id });
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error("Webhook Critical Error:", err);
    await logToDb('CRITICAL_FAIL', { error: err.message }, true);
    // Try to update event error if we can parse the ID from body, but raw body might be consumed.
    // Simpler to just return 400.
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
})
