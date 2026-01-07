
# KOSMA - SaaS Production Management Prototype

Ein SaaS-Prototyp für Filmproduktionsmanagement.
**Aktuelle Domain:** `kosma.io`

---

# 🚀 WICHTIG: ERSTE SCHRITTE

Um die Datenbank korrekt einzurichten und das System **sicher** zu machen, musst du zwei Dinge tun:

### 1. SQL ausführen
1. Kopiere das korrigierte SQL-Skript (Fixed Syntax) aus dem Chat.
2. Gehe zu deinem Supabase Projekt -> **SQL Editor**.
3. Füge den Inhalt ein und klicke auf **RUN**.

### 2. Edge Function deployen
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
    Wir deployen die Funktion `webhook-handler`.
    ```bash
    npx supabase functions deploy webhook-handler --no-verify-jwt
    ```
    *Hinweis: Das Flag `--no-verify-jwt` erlaubt den Aufruf auch ohne aktiven User-Token, was für Webhooks von Stripe wichtig wäre. In unserer Simulation rufen wir es aber MIT Token auf, das Flag schadet jedoch nicht.*

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
Das Frontend darf **NICHT** in die `licenses` oder `invoices` Tabellen schreiben. Dies geschieht ausschließlich über die Edge Function `webhook-handler` (simuliert) oder echte Stripe Webhooks.

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
