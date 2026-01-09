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

---

# 4. EDGE FUNCTIONS & DEPLOYMENT MAPPING

| Lokaler Ordner | Function Name (Dashboard) | JWT Verify | Beschreibung |
| :--- | :--- | :--- | :--- |
| `supabase/functions/webhook-handler/` | **`dynamic-endpoint`** | OFF* | Verarbeitet den Checkout-Return. |
| `supabase/functions/stripe-webhook/` | **`stripe-webhook`** | **OFF** | Haupt-Logik. Empfängt Events von Stripe. |
| `supabase/functions/cancel-subscription/` | **`swift-action`** | ON | Führt Kündigung in Stripe API aus. |
| `supabase/functions/create-billing-portal-session/` | **`rapid-handler`** | ON | Erzeugt Link zum Stripe Portal. |
| `supabase/functions/system-health/` | **`swift-service`** | OFF | Health-Checks für Dashboard. |
| `supabase/functions/admin-action/` | **`admin-action`** | ON | Admin Aktionen (Overrides). |
| `supabase/functions/cron-scheduler/` | **`cron-scheduler`** | OFF* | Zeitgesteuerte Aufgaben. |

---

# 🛠 DEBUGGING: DEEP INSPECTION

[... rest of README ...]
