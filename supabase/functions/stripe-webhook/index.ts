import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from 'https://esm.sh/stripe@14.21.0';

declare const Deno: any;

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

serve(async (req) => {
  try {
    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text();
    
    // SECRETS
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
         console.error("Missing Environment Variables");
         return new Response("Configuration Error", { status: 500 });
    }

    if (!signature) {
         return new Response("Missing signature", { status: 400 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });

    // 1. VERIFY SIGNATURE
    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // 2. IDEMPOTENCY CHECK (Pattern: Optimistic Insert -> Check Conflict)
    const { error: insertError } = await supabaseAdmin.from('stripe_events').insert({
        id: event.id,
        type: event.type,
        payload: JSON.parse(JSON.stringify(event))
    });

    if (insertError) {
        // Falls Insert fehlschlägt, prüfen wir, ob das Event wirklich schon existiert.
        const { data: existing } = await supabaseAdmin
            .from('stripe_events')
            .select('id')
            .eq('id', event.id)
            .maybeSingle();

        if (existing) {
             return new Response(JSON.stringify({ received: true, status: 'already_processed' }), { 
                headers: { "Content-Type": "application/json" } 
            });
        }
        
        // Echter DB Fehler (z.B. Connection lost) -> 500 für Retry
        console.error("DB Insert Error:", insertError);
        return new Response("Database Insert Error", { status: 500 });
    }

    // 3. PROCESS EVENT
    try {
        
        // --- A. CHECKOUT SESSION COMPLETED ---
        if (event.type === 'checkout.session.completed') {
             const session = event.data.object;
             
             // USER MAPPING
             let userId = session.client_reference_id || session.metadata?.user_id;

             // EMAIL FALLBACK (Nur wenn profiles.email sicher existiert)
             if (!userId && (session.customer_details?.email || session.customer_email)) {
                 const email = session.customer_details?.email || session.customer_email;
                 console.log(`Fallback: Lookup user by email: ${email}`);
                 const { data: userProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();
                 
                 if (userProfile) userId = userProfile.id;
             }

             if (userId) {
                 let subscription: any = null;
                 let priceId = null;
                 let cycle = 'none';

                 // Fetch 'fresh' subscription data
                 if (session.subscription) {
                     subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                     priceId = subscription.items.data[0]?.price?.id;
                     cycle = inferCycle(subscription.items.data[0]?.price?.recurring?.interval);
                 }

                 // Upsert License
                 const { error: upsertError } = await supabaseAdmin.from('licenses').upsert({
                     user_id: userId,
                     stripe_customer_id: session.customer,
                     stripe_subscription_id: session.subscription,
                     stripe_price_id: priceId,
                     status: subscription ? mapStripeStatus(subscription.status) : 'active',
                     billing_cycle: cycle,
                     current_period_end: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null,
                     cancel_at_period_end: subscription?.cancel_at_period_end || false,
                 }, { onConflict: 'user_id' });

                 if (upsertError) throw upsertError;

                 // Create Invoice Record
                 await supabaseAdmin.from('invoices').insert({
                    user_id: userId,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency ? session.currency.toUpperCase() : 'EUR',
                    status: 'paid',
                    project_name: 'Subscription Payment',
                    stripe_invoice_id: session.invoice || `sess_${session.id}`, // Fallback ID
                    invoice_hosted_url: null 
                 });
             } else {
                 console.warn(`[Webhook] Unmapped User for Session ${session.id}. Ignoring.`);
                 // WICHTIG: Return 200, um Retries bei Logikfehlern zu stoppen.
                 return new Response(JSON.stringify({ received: true, status: 'ignored_no_user' }), { headers: { "Content-Type": "application/json" } });
             }
        }

        // --- B. SUBSCRIPTION UPDATED ---
        if (event.type === 'customer.subscription.updated') {
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

        // --- C. SUBSCRIPTION DELETED ---
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

        // --- D. INVOICE PAYMENT SUCCEEDED ---
        if (event.type === 'invoice.payment_succeeded') {
            const invoice = event.data.object;
            if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
                 
                 const { data: license } = await supabaseAdmin
                    .from('licenses')
                    .select('user_id')
                    .eq('stripe_customer_id', invoice.customer) 
                    .maybeSingle();

                 if (license) {
                     // Check Duplicate Invoice via ID
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
                            project_name: 'Subscription Renewal',
                            stripe_invoice_id: invoice.id,
                            invoice_pdf_url: invoice.invoice_pdf,
                            invoice_hosted_url: invoice.hosted_invoice_url
                        });
                     }
                 }
            }
        }
        
        // --- E. INVOICE PAYMENT FAILED ---
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
                    project_name: 'Failed Renewal',
                    stripe_invoice_id: invoice.id,
                    invoice_pdf_url: invoice.invoice_pdf,
                    invoice_hosted_url: invoice.hosted_invoice_url
                 });
                 
                 await supabaseAdmin.from('licenses').update({
                     status: 'past_due'
                 }).eq('user_id', license.user_id);
             }
        }

        // Mark as processed
        await supabaseAdmin.from('stripe_events').update({ processed_at: new Date().toISOString() }).eq('id', event.id);

    } catch (err: any) {
        console.error(`Processing Logic Error for Event ${event.id}:`, err);
        await supabaseAdmin.from('stripe_events').update({ processing_error: err.message }).eq('id', event.id);
        
        // Strategie: Echte Processing Errors (z.B. Syntaxfehler im Code) -> 500 Return, damit Stripe es fixen kann wenn wir deployen.
        return new Response(JSON.stringify({ error: "Processing failed, requesting retry." }), { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Critical Webhook Error:", err.message);
    const status = err.message.includes("signature") ? 400 : 500;
    return new Response(err.message, { status: status });
  }
})