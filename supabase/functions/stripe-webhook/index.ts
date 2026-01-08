
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
        case 'past_due':
        case 'unpaid':
        case 'incomplete':
            return 'past_due';
        case 'canceled':
        case 'incomplete_expired':
            return 'canceled';
        case 'paused':
            return 'none';
        default:
            return 'none';
    }
}

function inferCycle(interval: string | undefined): 'monthly' | 'yearly' | 'none' {
    if (interval === 'year') return 'yearly';
    if (interval === 'month') return 'monthly';
    return 'none';
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: any): boolean {
    return typeof id === 'string' && uuidRegex.test(id);
}

console.log("Stripe Webhook Function Loaded (v2 - Hardened)");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("Stripe-Signature");
    
    // 1. BASIC CONFIG CHECK
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
         console.error("CRITICAL: Missing Environment Variables");
         return new Response("Configuration Error: Missing Envs", { status: 500, headers: corsHeaders });
    }

    if (!signature) {
         return new Response("Missing Stripe-Signature", { status: 400, headers: corsHeaders });
    }

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });

    // 2. VERIFY SIGNATURE
    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    // 3. LIVE MODE MISMATCH GUARD
    // If the event is live but our key is test (starts with sk_test), or vice versa, log and abort.
    const isKeyLive = stripeKey.startsWith('sk_live');
    if (event.livemode !== isKeyLive) {
        const msg = `Mode Mismatch: Event is ${event.livemode ? 'Live' : 'Test'}, but Key is ${isKeyLive ? 'Live' : 'Test'}. Ignored.`;
        console.error(msg);
        return new Response(msg, { status: 200, headers: corsHeaders }); // Return 200 to satisfy Stripe retry
    }

    console.log(`Processing Event: ${event.type} [${event.id}]`);
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // 4. IDEMPOTENCY CHECK
    const { error: insertError } = await supabaseAdmin.from('stripe_events').insert({
        id: event.id,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event))
    });

    if (insertError) {
        // If row exists, we assume processed or processing.
        const { data: existing } = await supabaseAdmin.from('stripe_events').select('id').eq('id', event.id).maybeSingle();
        if (existing) {
             return new Response(JSON.stringify({ received: true, status: 'already_processed' }), { 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            });
        }
    }

    try {
        // --- HANDLER: CHECKOUT COMPLETED ---
        if (event.type === 'checkout.session.completed') {
             const session = event.data.object;
             let stripeCustomerId = session.customer;

             // A. Recover Customer ID (if missing in session)
             if (!stripeCustomerId) {
                 if (session.payment_intent) {
                     try {
                         const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                         if (pi.customer) stripeCustomerId = pi.customer;
                     } catch (e) { console.error("PI fetch failed", e); }
                 }
                 // Try email lookup for existing customer (One-Time payments)
                 if (!stripeCustomerId && session.customer_details?.email) {
                     const email = session.customer_details.email;
                     const existing = await stripe.customers.list({ email, limit: 1 });
                     if (existing.data.length > 0) {
                         stripeCustomerId = existing.data[0].id;
                     }
                 }
             }

             if (stripeCustomerId) {
                 // B. Resolve User ID (Priority: Metadata > ClientRef > Email)
                 let userId = session.metadata?.user_id; // Metadata is most reliable source if set

                 if (!isValidUUID(userId)) {
                     userId = session.client_reference_id; // Check Client Ref
                 }

                 // If still not valid UUID, try Email Fallback
                 if (!isValidUUID(userId) && (session.customer_details?.email || session.customer_email)) {
                     const email = session.customer_details?.email || session.customer_email;
                     
                     // Strict check: Only map if exactly ONE user exists
                     const { data: profiles } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('email', email);
                     
                     if (profiles && profiles.length === 1) {
                         userId = profiles[0].id;
                         console.log(`[INFO] Recovered UserID ${userId} via Email ${email}`);
                     } else if (profiles && profiles.length > 1) {
                         console.warn(`[WARN] Ambiguous email ${email} (Multiple users). Skipping auto-map.`);
                         userId = null; 
                     }
                 }

                 if (isValidUUID(userId)) {
                     // 1. Link Profile
                     await supabaseAdmin.from('profiles').update({
                         stripe_customer_id: stripeCustomerId
                     }).eq('id', userId);

                     // 2. Fetch Subscription Data (if present)
                     let subData: any = null;
                     let priceId = null;
                     let cycle = 'none';

                     if (session.subscription) {
                         subData = await stripe.subscriptions.retrieve(session.subscription as string);
                         priceId = subData.items.data[0]?.price?.id;
                         cycle = inferCycle(subData.items.data[0]?.price?.recurring?.interval);
                     }

                     // 3. Upsert License
                     // We do NOT treat checkout as the absolute truth for status if we have subData, 
                     // but we do set the initial state.
                     const { error: upsertError } = await supabaseAdmin.from('licenses').upsert({
                         user_id: userId,
                         stripe_customer_id: stripeCustomerId,
                         stripe_subscription_id: session.subscription || null,
                         stripe_price_id: priceId,
                         status: subData ? mapStripeStatus(subData.status) : 'active', // One-time is active
                         billing_cycle: cycle,
                         current_period_end: subData ? new Date(subData.current_period_end * 1000).toISOString() : null,
                         cancel_at_period_end: subData?.cancel_at_period_end || false,
                     }, { onConflict: 'user_id' });

                     if (upsertError) throw upsertError;
                 } else {
                     console.warn(`[SKIP] Could not resolve valid UUID for Session ${session.id}`);
                 }
             }
        }

        // --- HANDLER: SUBSCRIPTION CREATED / UPDATED ---
        // Combined handler to ensure we catch everything, even if checkout webhook fails/delays
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
            const sub = event.data.object;
            const priceId = sub.items.data[0]?.price?.id;
            const cycle = inferCycle(sub.items.data[0]?.price?.recurring?.interval);
            const stripeCustomerId = sub.customer;

            // 1. Resolve User ID via Profile (Source of Truth for Customer ID link)
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', stripeCustomerId)
                .maybeSingle();
            
            let userId = profile?.id;

            // Fallback: If no profile link yet, check metadata on subscription
            if (!userId && sub.metadata?.user_id && isValidUUID(sub.metadata.user_id)) {
                userId = sub.metadata.user_id;
                // Auto-repair profile link
                await supabaseAdmin.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId);
            }

            if (userId) {
                // 2. UPSERT License (Safest approach for race conditions)
                await supabaseAdmin.from('licenses').upsert({
                    user_id: userId,
                    stripe_customer_id: stripeCustomerId,
                    stripe_subscription_id: sub.id,
                    stripe_price_id: priceId,
                    status: mapStripeStatus(sub.status),
                    billing_cycle: cycle,
                    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: sub.cancel_at_period_end,
                    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null
                }, { onConflict: 'user_id' });
                
                console.log(`[SUCCESS] Synced Subscription for User ${userId}`);
            } else {
                console.log(`[INFO] Subscription ${sub.id} orphan (No User linked to Customer ${stripeCustomerId}). Waiting for Checkout event.`);
            }
        }

        // --- HANDLER: SUBSCRIPTION DELETED ---
        if (event.type === 'customer.subscription.deleted') {
            const sub = event.data.object;
            // Find user by subscription ID
            const { data: license } = await supabaseAdmin
                .from('licenses')
                .select('user_id')
                .eq('stripe_subscription_id', sub.id)
                .maybeSingle();

            if (license) {
                await supabaseAdmin.from('licenses').update({
                    status: 'canceled',
                    cancel_at_period_end: false,
                    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : new Date().toISOString()
                }).eq('user_id', license.user_id);
            }
        }

        // --- HANDLER: INVOICE PAYMENT SUCCEEDED ---
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            if (invoice.billing_reason && invoice.billing_reason.startsWith('subscription')) {
                 const { data: license } = await supabaseAdmin
                    .from('licenses')
                    .select('user_id')
                    .eq('stripe_customer_id', invoice.customer) 
                    .maybeSingle();

                 if (license) {
                     // Check if invoice exists to avoid duplicates
                     const { data: existingInv } = await supabaseAdmin
                        .from('invoices')
                        .select('id')
                        .eq('stripe_invoice_id', invoice.id)
                        .maybeSingle();

                     if (!existingInv) {
                        await supabaseAdmin.from('invoices').insert({
                            user_id: license.user_id,
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency.toUpperCase(),
                            status: 'paid',
                            project_name: 'Subscription Payment',
                            stripe_invoice_id: invoice.id,
                            invoice_pdf_url: invoice.invoice_pdf,
                            invoice_hosted_url: invoice.hosted_invoice_url
                        });
                     }
                 }
            }
        }

        // --- HANDLER: INVOICE PAYMENT FAILED ---
        if (event.type === 'invoice.payment_failed') {
            const invoice = event.data.object;
             const { data: license } = await supabaseAdmin
                .from('licenses')
                .select('user_id')
                .eq('stripe_customer_id', invoice.customer)
                .maybeSingle();

             if (license) {
                 await supabaseAdmin.from('invoices').insert({
                    user_id: license.user_id,
                    amount: invoice.amount_due / 100,
                    currency: invoice.currency.toUpperCase(),
                    status: 'open',
                    project_name: 'Failed Payment',
                    stripe_invoice_id: invoice.id,
                    invoice_pdf_url: invoice.invoice_pdf,
                    invoice_hosted_url: invoice.hosted_invoice_url
                 });
                 
                 // Update status to past_due immediately
                 await supabaseAdmin.from('licenses').update({
                     status: 'past_due'
                 }).eq('user_id', license.user_id);
             }
        }

        // --- HANDLER: CUSTOMER UPDATED (Billing Address) ---
        if (event.type === 'customer.updated') {
             const customer = event.data.object;
             if (customer.address || customer.name) {
                const billingAddress = {
                    street: customer.address?.line1 || '',
                    city: customer.address?.city || '',
                    zip: customer.address?.postal_code || '',
                    country: customer.address?.country || '',
                    companyName: customer.name || '',
                    vatId: customer.tax_ids?.data?.[0]?.value || ''
                };
                // Only update if we can find the profile
                await supabaseAdmin
                    .from('profiles')
                    .update({ billing_address: billingAddress })
                    .eq('stripe_customer_id', customer.id);
             }
        }

        // Mark event as processed
        await supabaseAdmin.from('stripe_events').update({ processed_at: new Date().toISOString() }).eq('id', event.id);

    } catch (err: any) {
        console.error(`Logic Error for Event ${event.id}:`, err);
        await supabaseAdmin.from('stripe_events').update({ processing_error: err.message }).eq('id', event.id);
        // We still return 200 to Stripe so it doesn't retry indefinitely for logic errors
        return new Response(JSON.stringify({ error: "Processing logic failed", detail: err.message }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Critical Webhook Error:", err.message);
    return new Response(err.message, { status: 500, headers: corsHeaders });
  }
})
