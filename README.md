# KOSMA – SaaS Production Management Prototype

KOSMA ist ein SaaS-Prototyp für Film- und Produktionsmanagement mit rollenbasiertem Zugriff, Lizenzmodell, Zahlungsabwicklung über Stripe und einem sicherheitsgehärteten Auth-Flow über Supabase.

**Aktueller Betrieb:**
*   **Deployment:** `https://kosma-lake.vercel.app`
*   **Produktiv-Domain (geplant):** `kosma.io`

---

# 1. SYSTEMÜBERBLICK (HIGH LEVEL)

### 🧠 ONE-LINE SUMMARY
Frontend reads. Edge Functions write.
Supabase Auth is the source of truth.
Stripe only handles payment – never business logic.

### Technologie-Stack
*   **Frontend:** React + Vite
*   **Auth & DB:** Supabase
*   **Payments:** Stripe (Payment Links)
*   **Backend-Logic:** Supabase Edge Functions
*   **Hosting:** Vercel
*   **Routing:** Hybrid (HashRouter + BrowserRouter)

### Grundprinzip
*   Frontend ist **read-only** für sensible Daten.
*   Alle kritischen Schreibvorgänge laufen über eine abgesicherte **Edge Function**.
*   Auth-Flows sind explizit gegen Race Conditions gehärtet.

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
│  Vite + React + Router   │     │     Payment Links         │
│  Deployment: Vercel      │     │  (No Webhooks used)       │
│  Domain:                 │     │                          │
│  kosma-lake.vercel.app   │     └─────────────┬────────────┘
└───────────────┬──────────┘                   │
                │                              │ Redirect
                │ Read / Auth                  │ back
                ▼                              ▼
┌──────────────────────────────────────────────────────────┐
│                    Supabase Auth                          │
│  - Login / Signup                                         │
│  - Password Reset / Recovery                              │
│  - JWT Issuance                                           │
│                                                          │
│  ⚠ Session may be NULL after redirects                   │
│  → Frontend MUST retry getSession()                      │
└───────────────┬──────────────────────────────────────────┘
                │
                │ JWT (Authorization: Bearer …)
                ▼
┌──────────────────────────────────────────────────────────┐
│            Supabase Edge Function                         │
│              "dynamic-endpoint"                           │
│                                                          │
│  - Verifies JWT manually                                  │
│  - Validates tier / cycle                                 │
│  - Applies business logic                                 │
│  - Writes to DB using Service Role                        │
│                                                          │
│  ⚠ ONLY place where writes are allowed                    │
└───────────────┬──────────────────────────────────────────┘
                │
                │ Admin DB Access
                ▼
┌──────────────────────────────────────────────────────────┐
│                Supabase Postgres                          │
│                                                          │
│  Tables:                                                 │
│  - profiles                                              │
│  - licenses   (UNIQUE user_id)                            │
│  - invoices                                              │
│                                                          │
│  RLS:                                                    │
│  - Frontend: READ ONLY                                   │
│  - Edge Fn: ADMIN WRITE                                  │
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

### 3.1 Tabellen
*   `profiles`
*   `licenses`
*   `invoices`

### 3.2 Schreibrechte

| Tabelle | Frontend | Edge Function |
| :--- | :---: | :---: |
| `profiles` | eingeschränkt | ✅ |
| `licenses` | ❌ | ✅ |
| `invoices` | ❌ | ✅ |

### 3.3 Constraint (ESSENTIELL)

```sql
ALTER TABLE licenses
ADD CONSTRAINT licenses_user_id_key UNIQUE (user_id);
```

Ohne diesen Constraint:
*   entstehen doppelte Lizenzen
*   brechen Upgrade-Flows
*   ist das System inkonsistent

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
*   **Trennung:** Normalbetrieb vs. Recovery-Routing.

---

# 5. ROUTING-ARCHITEKTUR (KRITISCH)

### 5.1 Warum Hybrid Routing?
*   **Normalbetrieb:** `HashRouter` (`/#/dashboard`)
*   **Recovery & Reset:** `BrowserRouter` (`/update-password`)

### 5.2 Grund
*   Supabase E-Mail-Links funktionieren nicht zuverlässig mit Hash-URLs (Token Parsing).
*   Vercel braucht SPA-Fallbacks bei direkten URL-Aufrufen.

### 5.3 Vercel Pflicht-Rewrite

Alle Routen müssen auf `index.html` zeigen.

### 🔐 PASSWORD RESET FLOW
```text
User requests password reset
        │
        ▼
Supabase sends email with link:
https://kosma-lake.vercel.app/update-password
        │
        ▼
Vercel rewrite → index.html
        │
        ▼
App.tsx detects recovery route
        │
        ▼
Switch Router:
BrowserRouter (NOT HashRouter)
        │
        ▼
AuthProvider re-mounted (key change)
        │
        ▼
supabase.auth.getSession() retry loop
        │
        ▼
Session becomes valid
        │
        ▼
User sets new password
```

---

# 6. STRIPE-INTEGRATION

### 6.1 Warum Payment Links?
*   Keine komplexen Webhooks (reduzierte Komplexität).
*   Keine Server-to-Server-Race-Conditions.
*   Klare Kontrolle im Frontend.

### 6.2 Ablauf (End-to-End)
1.  User klickt „Upgrade“.
2.  Frontend speichert Auswahl in `sessionStorage` (Pending Purchase).
3.  Redirect zu Stripe Payment Link.
4.  Stripe leitet nach erfolgreicher Zahlung zurück zur App.
5.  **Frontend:**
    *   Wartet auf Supabase Session.
    *   Ruft Edge Function auf.
6.  **Edge Function:**
    *   Validiert Token.
    *   Schreibt Lizenz in DB.
    *   Erzeugt Rechnung.

### 🔁 STRIPE PURCHASE FLOW
```text
User clicks "Upgrade"
        │
        ▼
Frontend selects:
- plan tier
- billing cycle
        │
        ▼
Store pending purchase in sessionStorage
        │
        ▼
Hard redirect to Stripe Payment Link
        │
        ▼
Stripe Checkout
        │
        ▼
Redirect back to:
#/dashboard/subscription?checkout=success
        │
        ▼
Frontend:
- retries supabase.auth.getSession()
- recovers tier/cycle from sessionStorage
        │
        ▼
Invoke Edge Function (Authorization header)
        │
        ▼
Edge Function:
- validates JWT
- upserts license
- inserts invoice
        │
        ▼
Frontend reloads data → UI updates
```

### 6.3 Warum sessionStorage?

Stripe liefert im Redirect nicht garantiert:
*   Tier
*   Cycle
*   Projektname

`sessionStorage` ist der Fallback, um den Kauf korrekt zu rekonstruieren, falls URL-Parameter fehlen.

---

# 7. EDGE FUNCTION (dynamic-endpoint)

### 7.1 Aufgabe
Einziger Schreibzugang für:
*   Lizenzänderungen
*   Rechnungen
*   Vertragsstatus

### 7.2 Sicherheitsmodell
*   Läuft mit **Service Role** (Admin-Rechte).
*   **JWT-Prüfung:** Manuell im Code (`Authorization: Bearer ...`).
*   **Supabase JWT Verification:** DEAKTIVIERT (Enforce JWT Verification = OFF).

### 7.3 Warum kein verify-jwt?
*   Bessere Fehlermeldungen.
*   Volle Kontrolle über Auth-Fehler.
*   Vermeidung von CORS-Preflight-Problemen.

---

# 8. INCIDENT REPORT – PASSWORD RESET „SUPER-GAU“

### 8.1 Symptom
*   Reset-Links aus E-Mails funktionierten lokal.
*   Im Deployment: weiße Seite, keine Session, Token verloren.

### 8.2 Root Causes
Nicht falsche Domain, sondern:
1.  **Supabase:** Fehlende Redirect-Wildcards (`/*`).
2.  **Vercel:** Kein SPA-Fallback (Rewrite) für `/update-password`.
3.  **Routing:** `HashRouter` konsumierte das Token (`#access_token`), bevor Supabase es lesen konnte.
4.  **Race Condition:** Session war nach Redirect noch nicht bereit.

### 8.3 Fix
*   Supabase Redirect URLs mit `/*` konfiguriert.
*   Vercel Rewrites in `vercel.json` hinzugefügt.
*   Hybrid Router in `App.tsx` implementiert.
*   Retry-Logik in `CustomerDashboard.tsx` eingebaut.
*   `AuthProvider` Remounting via `key` Prop.

### 8.4 Lehre
Auth-Flows dürfen niemals implizit sein. Alles muss dokumentiert und reproduzierbar sein.

---

# 9. INSTALLATION & SETUP (NEU)

1.  **Supabase Projekt anlegen.**
2.  **SQL Setup ausführen** (Tabellen erstellen).
3.  **Constraint setzen:** `ALTER TABLE licenses ADD CONSTRAINT licenses_user_id_key UNIQUE (user_id);`
4.  **RLS fixen:** Falls Rekursionsfehler auftreten (`fix_rls.sql`).
5.  **Edge Function manuell deployen:** Code aus `supabase/functions/webhook-handler/index.ts` kopieren.
6.  **JWT-Verification deaktivieren:** In den Function Settings im Dashboard.
7.  **Redirect URLs prüfen:** Muss `https://.../*` enthalten.
8.  **Vercel Rewrites prüfen:** `vercel.json` muss vorhanden sein.

---

# 10. MIGRATION CHECKLISTE (KOSMA.IO)

Wenn eine einzige dieser Stellen vergessen wird, bricht der Auth-Flow.

### Supabase
*   [ ] **Site URL:** Ändern auf `https://kosma.io`.
*   [ ] **Redirect URLs:** `https://kosma.io/*` hinzufügen.
*   [ ] **E-Mail Templates:** Prüfen, ob Links hardcodiert sind (`{{ .SiteURL }}/update-password`).

### Frontend
*   [ ] Hardcodierte Domains im Code prüfen.
*   [ ] Router-Weiche (`App.tsx`) beibehalten.

### Edge Function
*   [ ] **CORS Origins:** `https://kosma.io` und `https://www.kosma.io` in `index.ts` hinzufügen und neu deployen.

### Vercel
*   [ ] Domain aufschalten.
*   [ ] Rewrites prüfen.
*   [ ] HTTPS erzwingen.

---

# 11. DEBUGGING & AUDIT

Nutze diesen SQL-Dump, um RLS, Policies, Trigger und Functions zu prüfen:

```sql
-- DUMP: Policies + RLS + Trigger + Functions
with p as (
  select
    'POLICY' as type, n.nspname as schemaname, c.relname as tablename, pol.polname as name,
    case pol.polcmd when 'r' then 'SELECT' when 'a' then 'INSERT' when 'w' then 'UPDATE' when 'd' then 'DELETE' when '*' then 'ALL' else pol.polcmd::text end as cmd,
    array(select rolname from pg_roles r where r.oid = any (pol.polroles)) as roles,
    pg_get_expr(pol.polqual, pol.polrelid) as qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check
  from pg_policy pol
  join pg_class c on c.oid = pol.polrelid
  join pg_namespace n on n.oid = c.relnamespace
),
rls as (
  select
    'RLS' as type, n.nspname as schemaname, c.relname as tablename, null::text as name, null::text as cmd, null::text[] as roles,
    c.relrowsecurity::text as qual, c.relforcerowsecurity::text as with_check
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r','p') and n.nspname not in ('pg_catalog','information_schema')
)
select * from p union all select * from rls order by type, tablename;
```

---

# 12. GRUNDSATZ

Diese README ist:
*   **kein** Changelog
*   **keine** Bug-Notiz
*   sondern **Betriebs- & Architekturdokumentation**

**Jede Änderung am System → README aktualisieren.**

---

# 13. ☠️ DO NOT TOUCH – UNLESS YOU KNOW EXACTLY WHY

Diese Sektion ist Pflichtlektüre, bevor jemand „mal kurz was aufräumt“.

### 🚫 1. Routing (HashRouter / BrowserRouter)

**NICHT ändern:**
*   Hybrid-Routing-Logik in `App.tsx`
*   Weiche zwischen:
    *   `HashRouter` (Normalbetrieb)
    *   `BrowserRouter` (Recovery / Reset)

**Warum?**
*   Password-Reset-Links funktionieren nicht stabil mit Hash-Routes
*   Vercel braucht echte Pfade für `/update-password`
*   Änderung ⇒ Reset-Flow kaputt ⇒ **Super-GAU**

### 🚫 2. Supabase Redirect URLs

**NICHT entfernen / einschränken:**
`https://kosma-lake.vercel.app/*`

**Warum?**
*   Supabase vergleicht Redirects exakt
*   Ohne Wildcard:
    *   Token wird verworfen
    *   Session wird nicht initialisiert
    *   Fehlerbild: weiße Seite, kein User

### 🚫 3. Session-Retry-Logik im Frontend

**NICHT „vereinfachen“:**
`supabase.auth.getSession()`

**Warum?**
*   Nach Redirects (Stripe, Mail) ist Session oft `null`
*   Ohne Retry:
    *   Edge Function bekommt kein Token
    *   Lizenz wird nicht aktiviert
    *   Fehlerbild: Zahlung ok, aber kein Abo

### 🚫 4. sessionStorage bei Stripe-Flow

**NICHT entfernen:**
`sessionStorage.setItem('pending_purchase', …)`

**Warum?**
*   Stripe liefert Rückgabeparameter nicht zuverlässig
*   Ohne Fallback:
    *   kein Tier
    *   kein Cycle
    *   Ergebnis: Zahlung da, System weiß nicht wofür

### 🚫 5. Edge Function – JWT Verification

**NICHT aktivieren:**
„Enforce JWT Verification“ im Supabase Dashboard

**Warum?**
*   JWT wird manuell geprüft
*   Gateway-Verification:
    *   verursacht CORS-Probleme
    *   liefert schlechte Fehlermeldungen
    *   Aktivieren ⇒ 401er ohne Debug-Möglichkeit

### 🚫 6. Unique Constraint auf licenses.user_id

**NICHT entfernen:**
`UNIQUE (user_id)`

**Warum?**
*   Ohne Constraint:
    *   mehrere Lizenzzeilen pro User
    *   unvorhersehbares Verhalten
    *   Upgrades, Downgrades, Anzeige kaputt

### 🚫 7. Frontend-Schreibrechte auf licenses / invoices

**NIEMALS erlauben.**

**Warum?**
*   Umgehung der Business-Logik
*   Kein Audit
*   Kein Schutz vor Manipulation

### 🚫 8. Domains „aufräumen“

**NICHT blind ändern:**
*   Supabase
*   Stripe
*   Vercel
*   Email Templates

**Warum?**
*   Auth-Flows hängen an allen vier Stellen
*   Eine vergessene URL ⇒ Reset / Login kaputt

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

**Hintergrund-Funktion (nicht im Dashboard Screenshot):**
*   **`stripe-webhook`**: Liegt in `supabase/functions/stripe-webhook/`.
    *   Diese Funktion wird **nicht** vom Frontend aufgerufen.
    *   Sie muss als Webhook-URL in Stripe hinterlegt werden (`https://[PROJECT].supabase.co/functions/v1/stripe-webhook`).
