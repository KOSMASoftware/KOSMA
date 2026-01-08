
# KOSMA – SaaS Production Management Prototype

KOSMA ist ein SaaS-Prototyp für Film- und Produktionsmanagement mit rollenbasiertem Zugriff, Lizenzmodell, Zahlungsabwicklung über Stripe und einem sicherheitsgehärteten Auth-Flow über Supabase.

**Aktueller Betrieb:**
*   **Deployment:** `https://kosma-lake.vercel.app`
*   **Produktiv-Domain (geplant):** `kosma.io`

---

# 🚨 NOTFALL-SETUP: LOGIN GEHT NICHT?

Wenn der Login fehlschlägt oder Daten nicht laden, liegt es meist an fehlenden Datenbank-Rechten (RLS).

1.  Öffne Datei: `supabase/setup.sql` in diesem Repo.
2.  Kopiere den gesamten Inhalt.
3.  Gehe zum **Supabase Dashboard > SQL Editor**.
4.  Füge den Inhalt ein und klicke **RUN**.

Damit werden alle Policies, Trigger und Views repariert.

---

# 🛑 WICHTIGE TO-DOS IM SUPABASE DASHBOARD (PFLICHT)

Damit die Stripe-Events korrekt ankommen und verarbeitet werden, müssen diese **3 Schritte** im Dashboard durchgeführt werden (da wir keine lokale Config nutzen):

### 1. Secrets korrekt setzen (Test-Mode)
*   Gehe zu **Edge Functions > Secrets**.
*   **`STRIPE_SECRET_KEY`**: Setze hier **exakt diesen Test-Key** (Verbindlich für den Prototyp):
    `sk_test_51NkjczHdGtVVCQC4OBcNq1h0inYrbJAC8tbGW9Ylm7lhLlVffjYnIEosgmHbGW1mFE9ucZJrmOxMNTyetNBrY8Er005nswaVjs`
*   **`STRIPE_WEBHOOK_SECRET`**: Muss mit **`whsec_...`** beginnen (Stripe Dashboard > Developers > Webhooks > Endpoint > Signing Secret).

### 2. JWT Verification deaktivieren
*   Gehe zu **Edge Functions**.
*   Klicke auf die Funktion **`stripe-webhook`**.
*   Stelle den Schalter **"Enforce JWT Verification"** auf **OFF** (damit Stripe ohne Auth-Header zugreifen kann).

### 3. Redeploy
*   Sobald die Secrets geändert wurden, **Redeploy** auslösen (via CLI oder GitHub Action), damit die neuen Keys geladen werden.

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

# 14. DEPLOYMENT MAPPING (DATEINAMEN VS. FUNCTION SLUGS)

Achtung: Die Namen der deployten Functions im Supabase Dashboard unterscheiden sich aus Obfuskierungsgründen von den lokalen Ordnernamen.

**Damit das Frontend funktioniert, MÜSSEN die Functions im Dashboard exakt so heißen wie in der linken Spalte!**

| Function Name (Dashboard) | Lokaler Ordner (Repository) | Beschreibung |
| :--- | :--- | :--- |
| **`dynamic-endpoint`** | `supabase/functions/webhook-handler/` | Verarbeitet erfolgreiche Zahlungen (Checkout Return). |
| **`rapid-handler`** | `supabase/functions/create-billing-portal-session/` | Erstellt Stripe Customer Portal Session. |
| **`swift-action`** | `supabase/functions/cancel-subscription/` | **WICHTIG:** Kündigungs-Logik. Muss im Dashboard `swift-action` heißen. |
| **`swift-service`** | `supabase/functions/system-health/` | System Health Monitoring. |
