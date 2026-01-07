# KOSMA - SaaS Production Management Prototype

Ein SaaS-Prototyp für Filmproduktionsmanagement.
**Aktuelle Domain:** `kosma.io`

---

# 🧠 ENTWICKLER-MANIFEST & GESCHÄFTSLOGIK

Diese Sektion definiert verbindlich das Produktmodell und die Architektur.

## 1. Produkt- und Lizenzmodell
Wir haben genau **EIN Produkt**: `KOSMA`.
User kaufen niemals mehrere Produkte, sondern eine Lizenz für dieses Produkt.

### Varianten
*   **Kostenlos:**
    *   `Free` (Zeitlich unbegrenzt, Fallback-Status)
*   **Kostenpflichtig (3 Pläne × 2 Laufzeiten):**
    *   `Budget` (Monthly / Yearly)
    *   `Cost Control` (Monthly / Yearly)
    *   `Production` (Monthly / Yearly)

➡️ **Regel:** Pro User gibt es maximal **eine** aktive Lizenz in der Tabelle `licenses`.

## 2. Trial-Logik (14 Tage)
Beim Signup gilt folgende Regel (ohne Stripe-Interaktion):
1.  Jeder neue User erhält automatisch den höchsten Plan (`Production`).
2.  Status: `trial`.
3.  Laufzeit: exakt 14 Tage ab Signup.
4.  **Nach Ablauf:** Automatische Rückstufung auf `Free` (Status-Check in der DB).
5.  Die Datenbank ist hier die alleinige "Source of Truth".

## 3. Architektur: Supabase = Source of Truth
Das Frontend darf niemals "raten" oder Status aus LocalStorage/Stripe ableiten.

*   **auth.users**: Authentifizierung.
*   **profiles**: User-Stammdaten + Billing Address.
*   **licenses**: Der *einzige* Ort, der bestimmt, was ein User darf (Plan, Status, Valid Until).
*   **invoices**: Historie für das UI.

**Stripe-Rolle:**
Stripe ist nur der Zahlungsabwickler. Statusänderungen (Kauf, Kündigung) gelangen ausschließlich über **Webhooks** in die Supabase-Datenbank. Das Frontend liest nur Supabase.

## 4. Auth & Recovery Flow (WICHTIG)
Um Deadlocks ("Infinite Spinner") zu vermeiden:
1.  **Niemals** `getSession()` während des Password-Recovery-Flows oder auf der Route `/update-password` aufrufen.
2.  Der AuthProvider muss erkennen, ob ein Recovery-Flow aktiv ist, und das Session-Fetching überspringen.

## 5. Code Guidelines: Type Definitions
Um Inkonsistenzen zu vermeiden:
*   Es gibt **eine einzige** Datei für Typen: `src/types.ts` (oder `index.ts` im types ordner).
*   Enums wie `UserRole`, `PlanTier`, `SubscriptionStatus` dürfen im gesamten Projekt nur ein einziges Mal definiert sein.
*   Keine lokalen Interface-Duplikate in Komponenten.

---

# 🔄 WORKFLOWS

### Kauf (Purchase Flow)
1.  User klickt Stripe Payment Link.
2.  Stripe Checkout (extern).
3.  Redirect zur App (`/dashboard/subscription`).
4.  **Backend/Webhook:** Empfängt `checkout.session.completed` -> Schreibt in `licenses` & `invoices`.
5.  **Frontend:** Zeigt Daten aus `licenses` an.

### Manuelle Verlängerung (Admin)
*   Admin darf `valid_until` in der Tabelle `licenses` manuell in die Zukunft setzen.
*   Dies geschieht **ohne** Interaktion mit Stripe.
*   Anwendungsfall: Kulanz, VIP-User, Support-Fälle.

---

# 🛠️ DATENBANK SETUP (SQL)

Führe dies im Supabase SQL Editor aus, damit das Frontend funktioniert.

```sql
-- 1. Profiles (mit billing_address!)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'customer',
  stripe_customer_id text,
  billing_address jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Licenses
create table public.licenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  product_name text default 'KOSMA',
  plan_tier text,
  billing_cycle text,
  status text,
  valid_until timestamp with time zone,
  license_key text,
  billing_project_name text,
  stripe_subscription_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Invoices
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount numeric,
  currency text default 'EUR',
  status text,
  invoice_pdf_url text,
  project_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Sicherheit)
alter table public.profiles enable row level security;
create policy "Read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Update own profile" on public.profiles for update using (auth.uid() = id);

alter table public.licenses enable row level security;
create policy "Read own license" on public.licenses for select using (auth.uid() = user_id);

alter table public.invoices enable row level security;
create policy "Read own invoices" on public.invoices for select using (auth.uid() = user_id);
```

---

# 🕵️‍♂️ DEBUGGING (Browser Konsole)

Wenn der Login hängt oder Daten fehlen, führe diese Befehle in der Browser-Konsole (F12) aus.

**1. Session Check (Hängt getSession?)**
```javascript
(async () => {
  const t = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej("TIMEOUT"), ms))]);
  console.log(await t(window.supabase.auth.getSession(), 5000, "getSession"));
})();
```

**2. User & Lizenz prüfen (Source of Truth Check)**
```javascript
(async () => {
  const { data: { user } } = await window.supabase.auth.getUser();
  if(!user) return console.log("No User Logged In");
  
  console.log("User ID:", user.id);
  
  const lic = await window.supabase.from("licenses").select("*").eq("user_id", user.id);
  console.log("License in DB:", lic.data);
})();
```

---

# 🌍 GO-LIVE CHECKLIST

1.  **Vercel:** Domain `kosma.io` hinzufügen.
2.  **Supabase Auth:** Site URL auf `https://kosma.io` ändern.
3.  **Redirect URLs:** `https://kosma.io/update-password` muss in der Whitelist stehen (zwingend für Reset Flow).
4.  **Stripe:** Payment Links bleiben gleich, Redirects zeigen auf Production URL.
