
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

// Regex for UUID v4 validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

console.log("Stripe Webhook Function Loaded");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("Stripe-Signature");
    
    if (!signature) {
         console.error("No Stripe-Signature header found");
         return new Response("Missing Stripe-Signature", { status: 400, headers: corsHeaders });
    }

    const body = await req.text();
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
         console.error("Missing Environment Variables");
         return new Response("Configuration Error", { status: 500, headers: corsHeaders });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-08-16', httpClient: Stripe.createFetchHttpClient() });

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    console.log(`Processing Event: ${event.type} [${event.id}]`);

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Idempotency
    const { error: insertError } = await supabaseAdmin.from('stripe_events').insert({
        id: event.id,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event))
    });

    if (insertError) {
        const { data: existing } = await supabaseAdmin.from('stripe_events').select('id').eq('id', event.id).maybeSingle();
        if (existing) {
             return new Response(JSON.stringify({ received: true, status: 'already_processed' }), { 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            });
        }
        return new Response("Database Insert Error", { status: 500, headers: corsHeaders });
    }

    try {
        
        // --- A. CHECKOUT SESSION COMPLETED (MAPPING ONLY) ---
        if (event.type === 'checkout.session.completed') {
             const session = event.data.object;
             
             // 1. RECOVER STRIPE CUSTOMER ID
             let stripeCustomerId = session.customer;

             if (!stripeCustomerId) {
                 console.log(`[WARN] Session ${session.id} has no customer.`);
                 
                 // Strategy A: Via Payment Intent
                 if (session.payment_intent) {
                     try {
                         const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                         if (pi.customer) {
                             stripeCustomerId = pi.customer;
                             console.log(`[INFO] Recovered customer ${stripeCustomerId} via PaymentIntent.`);
                         }
                     } catch (e) { console.error("PI fetch failed", e); }
                 }

                 // Strategy B: Via Email (Only for One-Time Payments)
                 if (!stripeCustomerId) {
                     const email = session.customer_details?.email || session.customer_email;
                     
                     if (email) {
                         // Only create new customer if NOT subscription mode
                         if (session.mode !== 'subscription') {
                             const existing = await stripe.customers.list({ email, limit: 1 });
                             if (existing.data.length > 0) {
                                 stripeCustomerId = existing.data[0].id;
                                 console.log(`[INFO] Recovered customer ${stripeCustomerId} via Email lookup.`);
                             } else {
                                 const newCus = await stripe.customers.create({
                                     email,
                                     name: session.customer_details?.name || 'Customer',
                                     metadata: { source: 'webhook_recovery' }
                                 });
                                 stripeCustomerId = newCus.id;
                                 console.log(`[INFO] Created new customer ${stripeCustomerId} fallback (One-Time Mode).`);
                             }
                         } else {
                             console.warn(`[SKIP] Subscription mode detected. Skipping fallback customer creation for ${email} to avoid duplicates.`);
                         }
                     }
                 }
             }

             if (stripeCustomerId) {
                 let userId = session.client_reference_id 
                            || session.metadata?.user_id 
                            || session.subscription_details?.metadata?.user_id;

                 // Email Fallback (Only if userId is missing or invalid UUID)
                 if ((!userId || !uuidRegex.test(userId)) && (session.customer_details?.email || session.customer_email)) {
                     const email = session.customer_details?.email || session.customer_email;
                     const { data: userProfile } = await supabaseAdmin
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .maybeSingle();
                     
                     if (userProfile) userId = userProfile.id;
                 }

                 // STRICT UUID CHECK BEFORE DB OPS
                 if (userId && uuidRegex.test(userId)) {
                     let subscription: any = null;
                     let priceId = null;
                     let cycle = 'none';

                     if (session.subscription) {
                         subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                         priceId = subscription.items.data[0]?.price?.id;
                         cycle = inferCycle(subscription.items.data[0]?.price?.recurring?.interval);
                     } else {
                         // One-time payment logic
                         cycle = 'none'; 
                     }

                     // Update Profile with verified Stripe ID
                     await supabaseAdmin.from('profiles').update({
                         stripe_customer_id: stripeCustomerId
                     }).eq('id', userId);

                     // UPDATE LICENSE
                     const { error: upsertError } = await supabaseAdmin.from('licenses').upsert({
                         user_id: userId,
                         stripe_customer_id: stripeCustomerId,
                         stripe_subscription_id: session.subscription || null,
                         stripe_price_id: priceId,
                         status: subscription ? mapStripeStatus(subscription.status) : 'active',
                         billing_cycle: cycle,
                         current_period_end: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                         cancel_at_period_end: subscription?.cancel_at_period_end || false,
                     }, { onConflict: 'user_id' });

                     if (upsertError) throw upsertError;
                     console.log(`[SUCCESS] License updated for User ${userId}`);

                 } else {
                     console.warn(`[Webhook] SKIPPED DB SYNC. Invalid or missing UUID for session ${session.id}. Value: ${userId}`);
                 }
             }
        }

        // --- B. CUSTOMER UPDATED ---
        if (event.type === 'customer.updated') {
            const customer = event.data.object;
            // Only update if we have meaningful data
            if (customer.address || customer.name) {
                const billingAddress = {
                    street: customer.address?.line1 || '',
                    city: customer.address?.city || '',
                    zip: customer.address?.postal_code || '',
                    country: customer.address?.country || '',
                    companyName: customer.name || '',
                    vatId: customer.tax_ids?.data?.[0]?.value || ''
                };

                await supabaseAdmin
                    .from('profiles')
                    .update({ billing_address: billingAddress })
                    .eq('stripe_customer_id', customer.id);
            }
        }

        // --- C. SUBSCRIPTION UPDATED / CREATED ---
        if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
            const sub = event.data.object;
            const priceId = sub.items.data[0]?.price?.id;

            const { data: license } = await supabaseAdmin
                .from('licenses')
                .select('user_id')
                .eq('stripe_subscription_id', sub.id)
                .maybeSingle();
            
            if (license) {
                await supabaseAdmin.from('licenses').update({
                    status: mapStripeStatus(sub.status),
                    cancel_at_period_end: sub.cancel_at_period_end,
                    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
                    stripe_price_id: priceId
                }).eq('user_id', license.user_id);
            }
        }

        // --- D. SUBSCRIPTION DELETED ---
        if (event.type === 'customer.subscription.deleted') {
            const sub = event.data.object;
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

        // --- E. INVOICE PAYMENT SUCCEEDED (SINGLE SOURCE OF TRUTH FOR INVOICES) ---
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            // Check reasons: subscription_create, subscription_cycle, subscription_update
            if (invoice.billing_reason && invoice.billing_reason.startsWith('subscription')) {
                 const { data: license } = await supabaseAdmin
                    .from('licenses')
                    .select('user_id')
                    .eq('stripe_customer_id', invoice.customer) 
                    .maybeSingle();

                 if (license) {
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
        
        // --- F. INVOICE PAYMENT FAILED ---
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
                 
                 await supabaseAdmin.from('licenses').update({
                     status: 'past_due'
                 }).eq('user_id', license.user_id);
             }
        }

        await supabaseAdmin.from('stripe_events').update({ processed_at: new Date().toISOString() }).eq('id', event.id);

    } catch (err: any) {
        console.error(`Logic Error for Event ${event.id}:`, err);
        await supabaseAdmin.from('stripe_events').update({ processing_error: err.message }).eq('id', event.id);
        return new Response(JSON.stringify({ error: "Processing logic failed", detail: err.message }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Critical Webhook Error:", err.message);
    return new Response(err.message, { status: 500, headers: corsHeaders });
  }
})
