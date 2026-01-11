
# KOSMA – SaaS Production Management Prototype

**Status:** Production Candidate (Standardized)
**Live Domain:** `https://kosma.io`

---

# 🚨 EDGE FUNCTIONS & SLUG MAPPING

Das System nutzt nun ein striktes **1:1 Mapping**. Der Name des Ordners in `supabase/functions/` ist identisch mit dem Slug in der Cloud.

| Lokaler Ordner | Deployment Befehl | URL Endpunkt |
| :--- | :--- | :--- |
| `admin-action` | `supabase functions deploy admin-action` | `/admin-action` |
| `cancel-subscription` | `supabase functions deploy cancel-subscription` | `/cancel-subscription` |
| `create-billing-portal-session` | `supabase functions deploy create-billing-portal-session` | `/create-billing-portal-session` |
| `webhook-handler` | `supabase functions deploy webhook-handler` | `/webhook-handler` |
| `system-health` | `supabase functions deploy system-health` | `/system-health` |
| `stripe-webhook` | `supabase functions deploy stripe-webhook` | `/stripe-webhook` |
| `mark-login` | `supabase functions deploy mark-login` | `/mark-login` |
| `cron-scheduler` | `supabase functions deploy cron-scheduler` | `/cron-scheduler` |

---

# 🛠 CORS & SICHERHEIT

Alle Funktionen erlauben nur Anfragen von:
- `https://kosma.io`
- `https://www.kosma.io`
- `https://kosma-lake.vercel.app`
- `http://localhost:5173`
- `http://localhost:3000`
