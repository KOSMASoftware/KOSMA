
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

// 1. STRICT CORS SETUP
// Erlaube Produktion und Localhost für Entwicklung
const allowedOrigins = new Set([
  "https://kosma.io",
  "https://www.kosma.io",
  "https://kosma-lake.vercel.app",
  "http://localhost:5173", // Vite Local
  "http://localhost:3000"  // Alternative Local
]);

function cors(origin: string | null) {
  // Wenn Origin erlaubt ist, nimm ihn. Sonst Fallback auf Hauptdomain (Sicherheit).
  const o = origin && allowedOrigins.has(origin) ? origin : "https://kosma.io";
  return {
    "Access-Control-Allow-Origin": o,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // HINWEIS: Header erweitert um Client-spezifische Keys
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, hx-request, hx-current-url",
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");

  // 2. Preflight Request (Browser Check)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin) });
  }

  try {
    // 3. AUTHENTIFIZIERUNG PRÜFEN (JWT)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), { 
        status: 401, 
        headers: { ...cors(origin), "Content-Type": "application/json" } 
      });
    }

    // Environment Variablen holen (werden von Supabase injected)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!; 
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client mit dem User-Token erstellen, um Identität zu prüfen
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), { 
        status: 401, 
        headers: { ...cors(origin), "Content-Type": "application/json" } 
      });
    }

    // User ID kommt jetzt sicher aus dem Token, nicht mehr aus dem Body!
    const userId = user.id;

    // 4. INPUT VALIDATION
    const { tier, cycle, projectName } = await req.json();

    const allowedTiers = new Set(["Budget", "Cost Control", "Production"]);
    const allowedCycles = new Set(["monthly", "yearly"]);

    if (!allowedTiers.has(tier)) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    if (!allowedCycles.has(cycle)) {
      throw new Error(`Invalid cycle: ${cycle}`);
    }

    // 5. BUSINESS LOGIC (Preis & Datum)
    const validUntil = new Date();
    if (cycle === 'yearly') validUntil.setFullYear(validUntil.getFullYear() + 1);
    else validUntil.setMonth(validUntil.getMonth() + 1);

    let amount = 0;
    if (tier === 'Budget') amount = cycle === 'yearly' ? 390 : 39;
    if (tier === 'Cost Control') amount = cycle === 'yearly' ? 590 : 59;
    if (tier === 'Production') amount = cycle === 'yearly' ? 690 : 69;

    // 6. DB UPDATES (Mit Service Role / Admin Rechten)
    // Wir nutzen hier einen NEUEN Client mit Admin-Rechten für den Schreibzugriff
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // A) Lizenz Update
    // WICHTIG: Hier wird KEINE stripe_subscription_id gesetzt, da diese erst über den Webhook kommt.
    const { error: licError } = await supabaseAdmin
      .from('licenses')
      .upsert({
        user_id: userId,
        plan_tier: tier,
        status: 'active',
        billing_cycle: cycle,
        valid_until: validUntil.toISOString(),
        product_name: 'KOSMA',
        billing_project_name: projectName,
        license_key: `KOS-${tier.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      }, { onConflict: 'user_id' });

    if (licError) throw licError;

    // B) Rechnung erstellen
    const { error: invError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userId,
        amount: amount,
        status: 'paid',
        project_name: projectName
      });

    if (invError) throw invError;

    // 7. ERFOLG
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...cors(origin), 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
