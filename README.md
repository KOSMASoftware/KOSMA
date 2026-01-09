# KOSMA – SaaS Production Management Prototype

**Status:** Production Candidate  
**Live Domain:** `https://kosma.io`  
**Dev/Fallback:** `https://kosma-lake.vercel.app`

---

# 🚨 NOTFALL-SETUP (SQL)

Wenn Login, Lizenzen oder DB-Rechte kaputt sind:
1.  Öffne `supabase/setup.sql`.
2.  Copy & Paste in den **Supabase SQL Editor**.
3.  **Run**.

---

# 1. BUSINESS LOGIC & LIZENZ-MODELL

### 🏷️ Die 4 Lizenz-Stufen (Plans)

| Tier | Zielgruppe | Preis (J/M) | Features |
| :--- | :--- | :--- | :--- |
| **Free** | Trial / Student | 0 € | 14 Tage Trial, Read-Only, Keine Exports |
| **Budget** | Produktionsleiter | 390 € / 39 € | Kalkulation, Unlimited Projects |
| **Cost Control** | Controller | 590 € / 59 € | Budget + Kostenüberwachung (Soll/Ist) |
| **Production** | Produzenten | 690 € / 69 € | Budget + Kosten + Finanzierung + Cashflow |

### ⏳ Die "Effective Access" Formel
Wie entscheidet das System, ob ein User Zugriff hat? Es gibt **drei Ebenen der Wahrheit**, die in dieser Reihenfolge geprüft werden:

1.  **Admin Override:** Hat ein Admin ein manuelles Datum gesetzt? (Kulanz, Banküberweisung) -> **WINNER**.
2.  **Stripe Period:** Läuft das Abo laut Stripe noch? (`current_period_end`) -> **STANDARD**.
3.  **Legacy Date:** Steht ein statisches Datum in `valid_until`? -> **FALLBACK**.

**SQL Logik:**
```sql
effective_valid_until = COALESCE(admin_valid_until_override, current_period_end, valid_until)
```
*Zugriff ist gewährt, wenn `effective_valid_until > now()`.*

### 🚦 Status-Definitionen

| Status | Bedeutung | Auswirkung |
| :--- | :--- | :--- |
| `active` | Zahlung OK, Abo läuft. | **Voller Zugriff**. |
| `trial` | Testphase (14 Tage). | **Voller Zugriff**. |
| `past_due` | Zahlung fehlgeschlagen (Kreditkarte abgelehnt). | **Zugriff eingeschränkt** (Grace Period Logik möglich). |
| `canceled` | Gekündigt & Laufzeit vorbei. | **Kein Zugriff** (Login geht, Dashboard Read-Only/Upsell). |
| `none` | Kein Abo vorhanden. | **Kein Zugriff**. |

---

# 2. USER STORIES & ABLÄUFE

### 👤 Customer Stories
1.  **Upgrade:** "Ich will von Free auf Production upgraden."
    *   Klick auf Preis-Button -> Stripe Checkout -> Rückkehr zur App -> Webhook setzt Status `active`.
2.  **Kündigen:** "Ich brauche das Abo nicht mehr."
    *   Dashboard -> "Cancel Subscription".
    *   **Logik:** Abo wird **nicht** sofort beendet. Flag `cancel_at_period_end = true` wird gesetzt. Zugriff bleibt bis zum Ende des bezahlten Zeitraums.
3.  **Rechnung:** "Ich brauche meine Rechnung für die Steuer."
    *   Dashboard -> Subscription -> Liste der PDFs (Direktlink zu Stripe Hosted Invoice).

### 🛡️ Admin Stories
1.  **Manueller Fix:** "Kunde hat per Überweisung gezahlt, Stripe ging nicht."
    *   Admin öffnet User -> Setzt "Admin Override" on Datum in 1 Jahr.
    *   Stripe wird ignoriert, User hat Zugriff.
2.  **Audit:** "Wer hat dem User Zugriff gegeben?"
    *   Tabelle `audit_logs` prüfen: Wer hat wann welchen Override gesetzt?
3.  **Support:** "Warum geht mein Login nicht?"
    *   Admin prüft `stripe_events` Tabelle auf Fehler (`processing_error`) beim Webhook.

---

# 3. ARCHITEKTUR & DATA FLOW

### 🧠 Core Principle
*   **Identity:** Supabase Auth ist die Single Source of Truth für "Wer bist du?".
*   **Billing:** Stripe ist die Single Source of Truth für "Hast du bezahlt?".
*   **Access:** Supabase DB (`licenses`) entscheidet über Zugriff (basierend auf Stripe-Daten).

### 📐 Flow 1: Checkout & Activation (Async)
Der User kehrt zum Frontend zurück, aber die *echte* Datenverarbeitung passiert im Hintergrund via Webhook.

```text
       [USER]                          [STRIPE]                       [SUPABASE]
          │                               │                               │
          │ 1. Start Checkout             │                               │
          ├──────────────────────────────►│                               │
          │                               │                               │
          │                               │ 2. Webhook (Async)            │
          │ 3. Return to App (Waiting)    │──────────────────────────────►│ Edge Fn: [stripe-webhook]
          │◄──────────────────────────────┤                               │       │
          │ (Frontend polls DB)           │                               │       ▼
          │                               │                               │   [Table: stripe_events]
          │                               │                               │       │
          │                               │                               │       ▼
          │                               │                               │   [Table: licenses]
          │                               │                               │   (Status -> active)
```

### 📐 Flow 2: Cancellation (Safety First)
Kündigungen werden nicht sofort gelöscht, sondern markiert (`cancel_at_period_end`).

```text
       [USER]                          [SUPABASE]                      [STRIPE]
          │                               │                               │
          │ 1. Click "Cancel"             │                               │
          ├──────────────────────────────►│ Edge Fn: [cancel-subscription]│
          │                               │       │                       │
          │                               │       │ 2. API Call           │
          │                               │       │ (cancel_at_period_end)│
          │                               │       │──────────────────────►│
          │                               │       │                       │
          │                               │       ▼                       │
          │                               │   [Table: audit_logs]         │
          │                               │   (Action logged)             │
```

---

# 4. EDGE FUNCTIONS & DEPLOYMENT MAPPING

Die Namen im Supabase Dashboard unterscheiden sich teilweise von den Dateinamen.
**WICHTIG:** `stripe-webhook` muss JWT Verification **OFF** haben. Alle anderen **ON** (oder manuelle Prüfung).

| Lokaler Ordner | Function Name (Dashboard) | JWT Verify | Beschreibung |
| :--- | :--- | :--- | :--- |
| `supabase/functions/webhook-handler/` | **`dynamic-endpoint`** | OFF* | Verarbeitet den Checkout-Return (nur Frontend-Ack). *Prüft Token manuell.* |
| `supabase/functions/stripe-webhook/` | **`stripe-webhook`** | **OFF** | **Haupt-Logik.** Empfängt Events von Stripe Servern. Schreibt in DB. |
| `supabase/functions/cancel-subscription/` | **`cancel-subscription`** | OFF* | Führt Kündigung in Stripe API aus. *Prüft Token manuell.* |
| `supabase/functions/create-billing-portal-session/` | **`rapid-handler`** | OFF* | Erzeugt Link zum Stripe Portal. *Prüft Token manuell.* |
| `supabase/functions/system-health/` | **`system-health`** | OFF | Health-Checks für Dashboard. |

---

# 5. DATENBANK STRUKTUR (SYSTEM CRITICAL)

### A. Tabelle `licenses` (Access Layer)
Verbindet User mit Stripe.
*   `user_id` (Unique)
*   `stripe_customer_id`, `stripe_subscription_id`
*   `status`: 'active', 'past_due', 'canceled', 'trial'
*   `valid_until`: Das Datum, das das Frontend anzeigt.
*   `cancel_at_period_end`: Boolean (für UI Anzeige "läuft aus").
*   `admin_valid_until_override`: Datum, das Stripe überschreibt (für manuellen Support).

### B. Tabelle `stripe_events` (Idempotency)
Speichert JEDEN Webhook-Call, um doppelte Verarbeitung zu verhindern und Debugging zu ermöglichen.
*   `id`: Stripe Event ID (`evt_...`)
*   `type`: z.B. `invoice.payment_succeeded`
*   `payload`: Das volle JSON.
*   `processing_error`: Falls beim Parsen etwas schiefging.

### C. Tabelle `audit_logs` (Compliance)
Protokolliert kritische Aktionen (Admin Overrides, Kündigungen).
*   `actor_user_id`: Wer hat es getan?
*   `action`: z.B. `ADMIN_OVERRIDE`, `CUSTOMER_CANCEL`
*   `details`: JSON snapshot.

---

# 6. GO-LIVE CHECKLISTE (DOMAIN SWITCH)

Diese Schritte müssen beim Wechsel von `vercel.app` auf `kosma.io` durchgeführt werden.

### Phase 1: Vercel & Domains
1.  [ ] **Vercel Settings:** `kosma.io` als Production Domain hinzufügen.
2.  [ ] **DNS:** A-Record / CNAME gemäß Vercel Anleitung setzen.
3.  [ ] **WWW:** Redirect von `www.kosma.io` auf `kosma.io` einrichten.
4.  [ ] **WICHTIG:** Die `vercel.json` Rewrites müssen aktiv bleiben (für `/update-password`).

### Phase 2: Supabase Auth (Kritisch für Login/Reset)
Gehe zu **Supabase > Authentication > URL Configuration**.
1.  [ ] **Site URL:** Ändern auf `https://kosma.io`
2.  [ ] **Redirect URLs:** Liste muss enthalten:
    *   `https://kosma.io/*`
    *   `https://kosma-lake.vercel.app/*` (als Fallback behalten)
    *   `http://localhost:3000/*`

### Phase 3: Email Templates
Gehe zu **Supabase > Authentication > Email Templates**.
1.  [ ] **Reset Password Link:** Muss `{{ .SiteURL }}/update-password` lauten.

### Phase 4: Edge Functions & CORS
In `supabase/functions/.../index.ts` (allen Dateien mit CORS):
1.  [ ] **Allowed Origins:** Liste erweitern um `https://kosma.io`.

### Phase 5: Stripe (Payment)
1.  [ ] **Webhook Endpoint:** In Stripe Dashboard auf `https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook` setzen.
2.  [ ] **Events:** Mindestens auswählen:
    *   `checkout.session.completed`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
    *   `invoice.payment_succeeded`
    *   `invoice.payment_failed`
3.  [ ] **Secrets:** `STRIPE_WEBHOOK_SECRET` in Supabase Secrets aktualisieren.
4.  [ ] **Live Mode:** `VITE_STRIPE_MODE` auf `live` setzen und Links in `config/stripe.ts` prüfen.

---

# 🛠 DEBUGGING: DEEP INSPECTION

Kopiere diesen Block in den **Supabase SQL Editor** und klicke RUN, um den vollen Systemzustand zu sehen (inklusive Source Code der Funktionen & Policies):

```sql
-- =====================================================================
-- KOSMA DEEP INSPECTION: TABLES, POLICIES, TRIGGERS & FUNCTIONS
-- =====================================================================

-- 1. TABELLEN (Zeigt ob RLS aktiv ist)
SELECT 
  '1. TABLE' as category, 
  relname as object_name, 
  CASE WHEN relrowsecurity THEN '🔒 RLS ENABLED' ELSE '⚠️ RLS DISABLED' END as summary, 
  'Owner: ' || pg_catalog.pg_get_userbyid(relowner) as details
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'

UNION ALL

-- 2. POLICIES (Zeigt die exakte Logik: Wer darf was?)
SELECT 
  '2. POLICY', 
  tablename || ' -> ' || policyname, 
  'CMD: ' || cmd || ' | ROLES: ' || array_to_string(roles, ', '),
  'USING: (' || coalesce(qual, 'ALL') || ')  |  CHECK: (' || coalesce(with_check, 'ALL') || ')'
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

-- 3. TRIGGERS (Zeigt welche Automatismen laufen)
SELECT 
  '3. TRIGGER', 
  event_object_table || ' -> ' || trigger_name, 
  'EVENT: ' || event_manipulation || ' (' || action_timing || ')',
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'

UNION ALL

-- 4. FUNKTIONEN (Zeigt den kompletten Quellcode!)
SELECT 
  '4. FUNCTION', 
  p.proname || '()', 
  'SECURITY: ' || CASE WHEN p.prosecdef THEN 'DEFINER (Root)' ELSE 'INVOKER (User)' END,
  pg_get_functiondef(p.oid) -- DAS HIER LIEFERT DEN CODE
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'

ORDER BY category, object_name;
```