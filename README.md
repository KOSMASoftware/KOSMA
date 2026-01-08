# KOSMA – SaaS Production Management Prototype

KOSMA ist ein SaaS-Prototyp für Film- und Produktionsmanagement mit rollenbasiertem Zugriff, Lizenzmodell, Zahlungsabwicklung über Stripe und einem sicherheitsgehärteten Auth-Flow über Supabase.

**Aktueller Betrieb:**
*   **Deployment:** `https://kosma-lake.vercel.app`
*   **Produktiv-Domain (geplant):** `kosma.io`

---

# 1. SYSTEMÜBERBLICK (HIGH LEVEL)

### 🧠 ONE-LINE SUMMARY
Frontend reads. Edge Functions write.
Supabase Auth is the source of truth for Identity.
**Stripe is the source of truth for Billing & Address Data.**

### Technologie-Stack
*   **Frontend:** React + Vite
*   **Auth & DB:** Supabase
*   **Payments:** Stripe (Payment Links & Customer Portal)
*   **Backend-Logic:** Supabase Edge Functions
*   **Hosting:** Vercel
*   **Routing:** Hybrid (HashRouter + BrowserRouter)

### Grundprinzip
*   Frontend ist **read-only** für sensible Daten (Lizenzen, Rechnungsadresse).
*   Adressänderungen passieren **ausschließlich** im Stripe Customer Portal.
*   Sync erfolgt via Webhook (`stripe-webhook`) zurück in die DB.

### 🧩 ARCHITEKTURÜBERSICHT
```text
┌──────────────────────────────────────────────────────────┐
│                       USER (Browser)                     │
└───────────────┬───────────────────────────┬─────────────┘
                │                           │
                │                           │
                ▼                           ▼
┌──────────────────────────┐     ┌──────────────────────────┐
│   Frontend (React SPA)   │     │        Stripe             │
│  Vite + React + Router   │     │ - Payment Links (Buy)     │
│  Deployment: Vercel      │     │ - Customer Portal (Edit)  │
│  Domain:                 │     │                          │
│  kosma-lake.vercel.app   │     └────┬───────────┬─────────┘
└───────────────┬──────────┘          │           │
                │                     │           │ 1. Async
                │ Read / Auth         │           │ Webhooks
                ▼                     │           ▼
┌─────────────────────────────────────┼────────────────────┐
│                    Supabase Auth    │   Edge Function    │
│  - Login / Signup                   │   "stripe-webhook" │
│  - JWT Issuance                     │   (Background)     │
└───────────────┬─────────────────────┼────────────────────┘
                │                     │
                │ 2. Sync Calls       │ Writes Data
                │ (Purchase Return)   │ (Address, Inv, Sub)
                ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│            Supabase Edge Function                         │
│              "dynamic-endpoint"                           │
│                                                          │
│  - Verifies JWT manually                                  │
│  - Validates tier / cycle                                 │
│  - Applies business logic (Immediate Access)              │
└───────────────┬──────────────────────────────────────────┘
                │
                │ Admin DB Access
                ▼
┌──────────────────────────────────────────────────────────┐
│                Supabase Postgres                          │
│                                                          │
│  Tables:                                                 │
│  - profiles (billing_address via Webhook)                │
│  - licenses (Status, ValidUntil)                         │
│  - invoices (History)                                    │
└──────────────────────────────────────────────────────────┘
```

---

# 2. PRODUKT- & LIZENZMODELL

### 2.1 Produkt
*   Produkt: **KOSMA**
*   Es gibt kein Multi-Product-Setup.
*   Alle Lizenzen beziehen sich immer auf KOSMA.

### 2.2 Lizenz-Tiers

| Tier | Beschreibung |
| :--- | :--- |
| **Free** | Kein aktiver Vertrag |
| **Budget** | Einstieg, Budgetierung, Unlimited Projects |
| **Cost Control** | Erweiterte Kostenkontrolle |
| **Production** | Voller Funktionsumfang (Finanzierung & Cashflow) |

### 2.3 Billing Cycles
*   `monthly`
*   `yearly`

### 2.4 Lizenz-Status

| Status | Bedeutung |
| :--- | :--- |
| `none` | Keine aktive Lizenz |
| `trial` | Testphase |
| `active` | Bezahlt & aktiv |
| `past_due` | Zahlung überfällig |
| `canceled` | Gekündigt / Abgelaufen |

### 2.5 Zentrale Regel

**Ein User hat immer genau eine Lizenzzeile.**

Das wird erzwingend sichergestellt durch:
*   Unique Constraint auf `licenses.user_id`
*   `upsert`-Logik in der Edge Function

---

# 3. DATENMODELL (SUPABASE)

### 3.1 Tabellen & Schreibhoheit

| Tabelle | Feld | Source of Truth | Schreibweg |
| :--- | :--- | :--- | :--- |
| `profiles` | `billing_address` | **Stripe** | Webhook (`customer.updated`) |
| `licenses` | `plan_tier` | **App Logic** | `dynamic-endpoint` (Kauf) |
| `licenses` | `status` | **Stripe** | Webhook (`customer.subscription.updated`) |
| `invoices` | `pdf_url` | **Stripe** | Webhook (`invoice.payment_succeeded`) |

### 3.2 Constraint (ESSENTIELL)

```sql
ALTER TABLE licenses
ADD CONSTRAINT licenses_user_id_key UNIQUE (user_id);
```

---

# 4. AUTHENTIFIZIERUNG & SESSION-LOGIK

### 4.1 Auth-Flows
*   Login
*   Signup
*   Password Reset
*   Recovery (Magic Link)

### 4.2 Zentrales Problem (historisch)

Nach Redirects (z. B. aus E-Mails oder von Stripe) ist:
`supabase.auth.getSession() === null`
für einige hundert Millisekunden bis Sekunden.

### 4.3 Lösung
*   **Retry-Logik:** Das Frontend wartet bis zu 3 Sekunden auf die Session.
*   **Re-Mounting:** Der `AuthProvider` wird durch Key-Change neu geladen.

---

# 5. ROUTING-ARCHITEKTUR (KRITISCH)

### 5.1 Warum Hybrid Routing?
*   **Normalbetrieb:** `HashRouter` (`/#/dashboard`)
*   **Recovery & Reset:** `BrowserRouter` (`/update-password`)

### 5.2 Grund
*   Supabase E-Mail-Links funktionieren nicht zuverlässig mit Hash-URLs (Token Parsing).
*   Vercel braucht SPA-Fallbacks bei direkten URL-Aufrufen.

---

# 6. STRIPE-INTEGRATION (HYBRID MODEL)

Wir nutzen eine **Hybrid-Strategie**, um UX (Geschwindigkeit) und Datenkonsistenz (Zuverlässigkeit) zu vereinen.

### 6.1 Der Kauf (Immediate Access)
Da Webhooks asynchron sind und Sekunden dauern können, nutzen wir für den **ersten Kauf** einen synchronen Return-Flow.

1.  User kauft via Stripe Payment Link.
2.  Redirect zurück zur App (`/dashboard/subscription?success=true`).
3.  Frontend ruft **`dynamic-endpoint`** auf.
4.  Function schreibt sofort die Lizenz ("Optimistic Write").
5.  User kann sofort arbeiten.

### 6.2 Die Datenhaltung (Async Consistency)
Für alles andere verlassen wir uns auf **Stripe Webhooks** (`stripe-webhook`).

*   **Adressänderung:** User ändert Adresse im Stripe Portal → Webhook `customer.updated` → Update `profiles.billing_address`.
*   **Verlängerung (Renewal):** Webhook `invoice.payment_succeeded` → Insert `invoices` + Update `licenses.valid_until`.
*   **Kündigung:** Webhook `customer.subscription.deleted` → Update `licenses.status`.

### 6.3 Rechnungsdaten & Portal Flow
Das Frontend hat **keine Formulare** für Adressen oder Kreditkarten.

**Ablauf Adressänderung:**
1.  Frontend: Klick auf „Rechnungsdaten ändern“.
2.  Frontend: Ruft `rapid-handler` auf → erhält URL zum Stripe Billing Portal.
3.  User: Ändert Adresse bei Stripe.
4.  User: Klickt „Zurück zu KOSMA“.
5.  Frontend: Erkennt Rückkehr (`?portal_return=1`) und lädt Profildaten neu (die der Webhook im Hintergrund bereits aktualisiert hat).

### 🔁 DATA FLOW DIAGRAM
```text
       [USER ACTION]                     [STRIPE]                    [SUPABASE DB]
             │                              │                              │
    1. Click "Upgrade" ────────────────► Checkout ─────────────────────────┤
             │                              │                              │
             │◄────── Redirect ─────────────┘                              │
             │                              │                              │
    2. Invoke "dynamic-endpoint" ───────────────────────────────────────► [INSERT LICENSE]
             │                              │                              │
             │                      3. Async Webhook                       │
             │                      (invoice.payment_succeeded) ────────► [INSERT INVOICE]
             │                              │                              │
    4. Click "Edit Address" ───────────► Portal ───────────────────────────┤
             │                              │                              │
             │                      5. Async Webhook                       │
             │                      (customer.updated) ─────────────────► [UPDATE PROFILE]
             │                              │                              │
             │◄────── Return ───────────────┘                              │
             │                              │                              │
    6. Reload Data ◄───────────────────────────────────────────────────────┘
```

---

# 7. EDGE FUNCTION (dynamic-endpoint)

### 7.1 Aufgabe
Einziger Schreibzugang für:
*   Lizenzänderungen (Initialer Kauf)
*   Rechnungen (Initial)

### 7.2 Sicherheitsmodell
*   Läuft mit **Service Role** (Admin-Rechte).
*   **Supabase JWT Verification:** DEAKTIVIERT (Enforce JWT Verification = OFF).

---

# 8. INCIDENT REPORT – PASSWORD RESET „SUPER-GAU“

*(Siehe Sektion in alter Dokumentation - behalten für History)*

---

# 14. DEPLOYMENT MAPPING (DATEINAMEN VS. FUNCTION SLUGS)

Achtung: Die Namen der deployten Functions im Supabase Dashboard unterscheiden sich aus Obfuskierungsgründen von den lokalen Ordnernamen.

Hier ist die **verbindliche Zuordnung** (Source of Truth):

| Function Name (Dashboard) | Lokaler Ordner (Repository) | Beschreibung |
| :--- | :--- | :--- |
| **`dynamic-endpoint`** | `supabase/functions/webhook-handler/` | Verarbeitet erfolgreiche Zahlungen (Checkout Return). |
| **`rapid-handler`** | `supabase/functions/create-billing-portal-session/` | Erstellt Stripe Customer Portal Session. |
| **`swift-action`** | `supabase/functions/cancel-subscription/` | Kündigungs-Logik (Cancel Subscription). |
| **`system-health`** | `supabase/functions/system-health/` | System Health Monitoring. |

**Hintergrund-Funktion (nicht im Dashboard Screenshot sichtbar):**
*   **`stripe-webhook`**: Liegt in `supabase/functions/stripe-webhook/`.
    *   Diese Funktion wird **nicht** vom Frontend aufgerufen.
    *   Sie muss als Webhook-URL in Stripe hinterlegt werden (`https://[PROJECT].supabase.co/functions/v1/stripe-webhook`).
    *   **Events:** `checkout.session.completed`, `customer.updated`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`.
