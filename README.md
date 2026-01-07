# KOSMA - SaaS Production Management Prototype

Ein SaaS-Prototyp für Filmproduktionsmanagement.
**Aktuelle Domain:** `kosma.io` (Deployment: `kosma-lake.vercel.app`)

---

# 🚨 INCIDENT REPORT: PASSWORT RESET "SUPER-GAU" (Feb 2024)

**Problem:** Der Passwort-Reset-Flow funktionierte lokal, aber nicht im Vercel-Deployment. Links aus Emails führten ins Leere oder Sessions wurden nicht übernommen.
**Status:** Gelöst.

### 1. Root Cause Analyse (Warum es nicht ging)

Das Problem war NICHT "kosma.io vs. Vercel", sondern dass Reset-Link, Redirects, Routing und Session-Handling nicht sauber auf `kosma-lake.vercel.app` ausgerichtet waren.

**A) Reset-Link Ziel (Routing Konflikt)**
Der Reset-Link ging auf eine URL, die die App nicht korrekt verarbeitet hat.
*   *Typisch:* Router (HashRouter) konnte die Route nicht direkt laden oder Vercel lieferte einen 404.
*   *Ergebnis:* Seite lädt, aber Reset-Token wird "verschluckt" oder Seite bleibt weiß.

**B) Supabase Auth Redirect URLs (Strict Security)**
Wenn Redirect URLs in Supabase nicht exakt passen (auch nur ein fehlender Slash oder Wildcard `/*`), bricht der Flow ab.
*   *Effekt:* Supabase schickt Link, Browser landet irgendwo, aber Supabase akzeptiert den Redirect nicht sauber -> Reset Flow bricht ab.

**C) SPA-Routing auf Vercel (Fallback fehlt)**
Beim Direktaufruf einer Route wie `/update-password` (aus der E-Mail) wusste Vercel nicht, was zu tun ist.
*   *Problem:* Vercel sucht nach einer Datei `update-password.html`.
*   *Lösung:* Vercel muss alles auf `index.html` routen (Rewrite).

**D) Session Instabilität (Race Condition)**
Wenn die Seite nach dem Redirect lädt, ist `supabase.auth.getSession()` oft noch leer (null).
*   *Problem:* Der Code läuft sofort in einen Zustand "Kein User", bevor das Token aus der URL verarbeitet wurde.
*   *Lösung:* Retry-Logik und Hybrid-Router.

### 2. Die Lösung (The Fix)

Wir haben das System an drei Stellen gehärtet:

1.  **Supabase Konfiguration:**
    *   Site URL: `https://kosma-lake.vercel.app`
    *   Redirect URLs: `https://kosma-lake.vercel.app/*` (Wichtig: Wildcard!)
2.  **Vercel Konfiguration (`vercel.json`):**
    *   Explizite Rewrites, damit alle Pfade (auch `/update-password`) auf `index.html` geleitet werden.
3.  **Frontend Logik (Hybrid Router):**
    *   Wir nutzen eine Weiche in `App.tsx`:
        *   Normaler Betrieb: `HashRouter` (/#/dashboard)
        *   Recovery Flow: `BrowserRouter` (/update-password)
    *   Wir erzwingen ein **Re-Mounting** des `AuthProvider` durch einen `key`-Prop Wechsel. Das garantiert, dass die Session frisch initialisiert wird.

---

# 🚀 INSTALLATION & SETUP (Schritt für Schritt)

Damit das System sicher läuft, müssen diese Schritte in der angegebenen Reihenfolge durchgeführt werden.

### 1. SQL Basiseinrichtung
1. Gehe zu deinem Supabase Projekt -> **SQL Editor**.
2. Führe das `setup.sql` Skript aus (falls vorhanden), um die Grundtabellen (`profiles`, `licenses`, `invoices`) zu erstellen.

### 2. Datenbank Constraints (ESSENTIELL)
Damit die Edge Function Lizenzen aktualisieren kann, statt Duplikate zu erzeugen, **MUSS** ein Unique Constraint auf der `user_id` liegen. Führe dies im SQL Editor aus:

```sql
-- Sicherstellen, dass ein User nur EINE Lizenzzeile hat
ALTER TABLE licenses ADD CONSTRAINT licenses_user_id_key UNIQUE (user_id);
```

### 3. RLS Fix (Infinite Recursion vermeiden)
Falls du 500er Fehler im Dashboard siehst:
1. Öffne `supabase/fix_rls.sql`.
2. Kopiere den Inhalt in den Supabase SQL Editor und klicke **RUN**.

### 4. Edge Function Einrichten (Manuell im Dashboard)
Wir nutzen eine "Secure Edge Function" für alle Schreibvorgänge. Da wir das CLI nicht nutzen, machen wir dies direkt im Browser:

1.  Öffne dein Supabase Projekt im Browser.
2.  Gehe im Menü links auf **Edge Functions**.
3.  Klicke auf **Create a new Function**.
4.  Nenne die Funktion: `dynamic-endpoint`.
5.  Im nächsten Schritt siehst du einen Editor.
6.  **Kopiere** den gesamten Code aus deiner lokalen Datei `supabase/functions/webhook-handler/index.ts`.
7.  **Füge** ihn im Browser-Editor ein (ersetze den Standard-Code).
8.  Speichere / Deploye die Funktion.

**WICHTIG: JWT Verifizierung deaktivieren**
Da unser Code die Authentifizierung (`Authorization: Bearer ...`) selbst prüft, um bessere Fehlermeldungen zu geben, musst du die automatische Prüfung von Supabase deaktivieren:
1.  Klicke in der Funktionsübersicht auf `dynamic-endpoint`.
2.  Gehe auf den Tab **Settings** (oder "Enforce JWT Verification").
3.  **Deaktiviere** den Schalter "Enforce JWT Verification".
4.  Speichern.

---

# 🧠 ARCHITEKTUR & SICHERHEIT

### 1. Datenfluss & Source of Truth
*   **Lesen (Frontend):** Das Frontend nutzt den Supabase Client (`@supabase/supabase-js`), um Daten direkt aus `profiles`, `licenses` und `invoices` zu lesen. RLS-Policies stellen sicher, dass User nur ihre eigenen Daten sehen.
*   **Schreiben (Backend):** Das Frontend darf **nicht** in sensible Tabellen schreiben. Ein Kauf oder Upgrade ruft die Edge Function `dynamic-endpoint` auf.
*   **Edge Function:** Diese läuft mit "Service Role" Rechten (Admin), validiert den Input, prüft das User-Token und führt dann den Datenbank-Schreibvorgang (`upsert`) durch.

### 2. Stripe Integration & Race Conditions
Der Ablauf bei einem Kauf:
1.  Frontend leitet zu Stripe Payment Link weiter.
2.  Stripe leitet zurück zur App (`/dashboard/subscription`).
3.  **Lösung:** Das Frontend wartet (Retry-Logik), bis `supabase.auth.getSession()` ein valides Token liefert, bevor der Request an die Edge Function gesendet wird.

---

# 🔮 MIGRATION: KOSMA.EU (Checkliste)

Wenn das Projekt später auf die echte Domain `kosma.eu` umzieht, muss exakt folgendes angepasst werden, sonst tritt der "Super-GAU" erneut auf:

1.  **Supabase Auth Settings:**
    *   Ändere "Site URL" auf `https://kosma.eu`.
    *   Füge `https://kosma.eu/*` zu den Redirect URLs hinzu.
2.  **Email Templates:**
    *   In Supabase Auth Templates sicherstellen, dass Links `{{ .SiteURL }}/update-password` verwenden.
3.  **Edge Function CORS:**
    *   In `supabase/functions/webhook-handler/index.ts` muss `https://kosma.eu` und `https://www.kosma.eu` zur `allowedOrigins` Liste hinzugefügt werden.
4.  **Vercel / DNS:**
    *   Domain in Vercel aufschalten.

---

# 🧰 DEBUGGING TOOLS

Um die komplette Konfiguration deiner Datenbank (Policies, RLS-Status, Trigger und Functions) auf einen Blick zu sehen, führe folgenden SQL-Code im Supabase SQL Editor aus:

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