
# KOSMA - SaaS Production Management Prototype

Ein SaaS-Prototyp für Filmproduktionsmanagement.
**Aktuelle Domain:** `kosma.io`

---

# 🚀 WICHTIG: ERSTE SCHRITTE

Um die Datenbank korrekt einzurichten und das System **sicher** zu machen, musst du folgende Schritte durchführen:

### 1. SQL Setup (Tabellen erstellen)
1. Gehe zu deinem Supabase Projekt -> **SQL Editor**.
2. Führe das `setup.sql` Skript aus (falls noch nicht geschehen), um Tabellen zu erstellen.

### 2. RLS Infinite Recursion Fix (WICHTIG!)
Wenn du 500er Fehler oder "infinite recursion" im Dashboard siehst:
1. Öffne die Datei `supabase/fix_rls.sql` in diesem Projekt.
2. Kopiere den **kompletten Inhalt**.
3. Gehe zum Supabase **SQL Editor**, füge den Inhalt ein und klicke auf **RUN**.
   *Dies behebt das Problem, dass sich Admin-Checks in einer Endlosschleife aufhängen.*

### 3. Edge Function deployen
Da wir client-seitige Schreibrechte entfernt haben (Security!), muss der Server Updates übernehmen. Edge Functions müssen via CLI deployed werden.

**Voraussetzungen:**
*   [Supabase CLI](https://supabase.com/docs/guides/cli) installiert.
*   [Docker](https://www.docker.com/) installiert und läuft (für lokales Testen, optional für reines Deploy).

**Schritt-für-Schritt Deployment:**

1.  **Login:**
    Öffne dein Terminal und logge dich ein:
    ```bash
    npx supabase login
    ```

2.  **Projekt verknüpfen:**
    Finde deine `Reference ID` im Supabase Dashboard (unter Project Settings > General > Reference ID) und führe aus:
    ```bash
    npx supabase link --project-ref deine-project-id
    ```
    *(Gib dein Datenbank-Passwort ein, wenn gefragt).*

3.  **Function Deployen:**
    Wir deployen die Funktion `dynamic-endpoint` (ehemals webhook-handler).
    ```bash
    npx supabase functions deploy dynamic-endpoint --no-verify-jwt
    ```
    *Hinweis: Das Flag `--no-verify-jwt` erlaubt den Aufruf auch ohne aktiven User-Token. Da wir im Code aber jetzt JWT Validierung eingebaut haben, ist es sicherer, das Token vom Frontend mitzuschicken.*

4.  **Secrets setzen (Optional):**
    Die Function benötigt `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY`. Diese werden von Supabase automatisch injiziert.
    Falls du externe APIs wie Stripe oder Elastic Email nutzen willst, setze diese Secrets im Dashboard unter **Edge Functions > Secrets** oder via CLI:
    ```bash
    npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
    ```

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

**Security Update:**
Das Frontend darf **NICHT** in die `licenses` oder `invoices` Tabellen schreiben. Dies geschieht ausschließlich über die Edge Function `dynamic-endpoint` (simuliert) oder echte Stripe Webhooks.

## 4. Auth & Recovery Flow
Um Deadlocks ("Infinite Spinner") zu vermeiden:
1.  **Niemals** `getSession()` während des Password-Recovery-Flows oder auf der Route `/update-password` aufrufen.
2.  Der AuthProvider muss erkennen, ob ein Recovery-Flow aktiv ist, und das Session-Fetching überspringen.

---

# 🛠️ DATENBANK TABELLEN

Die Struktur wird automatisch durch `supabase/setup.sql` erstellt.

*   `profiles`: Benutzerdaten
*   `licenses`: Abonnement-Status
*   `invoices`: Rechnungen

---

# 🧰 DEBUGGING TOOLS

Um die komplette Konfiguration deiner Datenbank (Policies, RLS-Status, Trigger und Functions) auf einen Blick zu sehen, führe folgenden SQL-Code im Supabase SQL Editor aus. Das hilft extrem bei der Fehlersuche.

```sql
-- DUMP: Policies + RLS + Trigger + Functions (public + auth.users trigger)
-- Copy/Paste in Supabase SQL Editor

with p as (
  select
    'POLICY' as type,
    n.nspname as schemaname,
    c.relname as tablename,
    pol.polname as name,
    case pol.polcmd
      when 'r' then 'SELECT'
      when 'a' then 'INSERT'
      when 'w' then 'UPDATE'
      when 'd' then 'DELETE'
      when '*' then 'ALL'
      else pol.polcmd::text
    end as cmd,
    array(select rolname from pg_roles r where r.oid = any (pol.polroles)) as roles,
    pg_get_expr(pol.polqual, pol.polrelid) as qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check
  from pg_policy pol
  join pg_class c on c.oid = pol.polrelid
  join pg_namespace n on n.oid = c.relnamespace
),
rls as (
  select
    'RLS' as type,
    n.nspname as schemaname,
    c.relname as tablename,
    null::text as name,
    null::text as cmd,
    null::text[] as roles,
    c.relrowsecurity::text as qual,
    c.relforcerowsecurity::text as with_check
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r','p') and n.nspname not in ('pg_catalog','information_schema')
),
trg as (
  select
    'TRIGGER' as type,
    n.nspname as schemaname,
    c.relname as tablename,
    t.tgname as name,
    null::text as cmd,
    null::text[] as roles,
    pg_get_triggerdef(t.oid, true) as qual,
    null::text as with_check
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where not t.tgisinternal
),
fn as (
  select
    'FUNCTION' as type,
    n.nspname as schemaname,
    null::text as tablename,
    p.proname as name,
    null::text as cmd,
    null::text[] as roles,
    pg_get_functiondef(p.oid) as qual,
    null::text as with_check
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public','auth')
)
select * from fn
union all
select * from p
union all
select * from rls
union all
select * from trg
order by type, schemaname, tablename nulls first, name;
```
