import { PlanTier } from '../types';

/**
 * STRIPE CONFIGURATION - PROFI-SETUP FÜR RECHNUNGEN
 * 
 * Damit Rechnungen korrekt generiert werden und wir den Projektnamen erhalten,
 * nimm folgende Einstellungen in deinem Stripe Payment Link vor:
 * 
 * 1. OPTIONEN -> "Custom fields":
 *    - Klicke "Add custom field" -> Typ "Text".
 *    - Label: "Project Name" (WICHTIG: Genau so schreiben).
 * 
 * 2. OPTIONEN -> "Collect customers' addresses":
 *    - Wähle "Billing address only" (oder "Shipping & Billing").
 * 
 * 3. OPTIONEN -> "Tax ID Collection":
 *    - Aktiviere dies, falls du B2B VAT-IDs (USt-IdNr) in der EU sammeln willst.
 * 
 * 4. AFTER PAYMENT -> "Don't show confirmation page":
 *    - Redirect URL Beispiel für Production Yearly: 
 *      http://localhost:3000/#/dashboard/subscription?stripe_success=true&tier=Production&cycle=yearly&project_name={CHECKOUT_SESSION_ID}
 */

export const STRIPE_CONFIG = {
  isLive: false,
  links: {
    [PlanTier.BUDGET]: {
      monthly: 'https://buy.stripe.com/test_6oU5kD690gMt18Bgaw93y05', 
      yearly: 'https://buy.stripe.com/test_dRmaEX9lceElg3v7E093y04'
    },
    [PlanTier.COST_CONTROL]: {
      monthly: 'https://buy.stripe.com/test_9B600jbtkgMt9F7gaw93y03',
      yearly: 'https://buy.stripe.com/test_6oU5kD40SgMt3gJ2jG93y02'
    },
    [PlanTier.PRODUCTION]: {
      monthly: 'https://buy.stripe.com/test_5kQ8wPfJA67PeZr8I493y01',
      yearly: 'https://buy.stripe.com/test_00waEX7d42VD6sVf6s93y04'
    }
  }
};

export const STRIPE_LINKS = STRIPE_CONFIG.links;
