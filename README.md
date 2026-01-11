
# KOSMA – SaaS Production Management Prototype

**Status:** Production Candidate  
**Live Domain:** `https://kosma.io`

---

# 🚨 EDGE FUNCTIONS & SLUG MAPPING

Um die Verbindung zwischen Dashboard und Cloud herzustellen, **MUSS** beim Deployment der richtige Slug angegeben werden.

| Lokaler Ordner | Deployment Befehl (Slug) | Beschreibung |
| :--- | :--- | :--- |
| `supabase/functions/admin-action/` | `supabase functions deploy admin-action` | Admin-Eingriffe |
| `supabase/functions/cancel-subscription/` | `supabase functions deploy swift-action` | Stripe Storno |
| `supabase/functions/create-billing-portal-session/` | `supabase functions deploy rapid-handler` | Stripe Portal |
| `supabase/functions/webhook-handler/` | `supabase functions deploy dynamic-endpoint` | Kauf-Bestätigung |
| `supabase/functions/system-health/` | `supabase functions deploy system-health` | Diagnose |
| `supabase/functions/stripe-webhook/` | `supabase functions deploy stripe-webhook` | Stripe Events |
| `supabase/functions/mark-login/` | `supabase functions deploy mark-login` | Login Tracking |
| `supabase/functions/cron-scheduler/` | `supabase functions deploy cron-scheduler` | Automatisierung |

---

# 🛠 CORS & SICHERHEIT

Alle Funktionen erlauben nur Anfragen von:
- `https://kosma.io`
- `https://www.kosma.io`
- `https://kosma-lake.vercel.app`
- `http://localhost:5173` (Vite Default)
- `http://localhost:3000`
