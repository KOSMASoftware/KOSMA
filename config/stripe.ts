
/**
 * STRIPE CONFIGURATION
 * 
 * Source of Truth for Payment Links.
 * Keys match the PlanTier enum values: "Budget", "Cost Control", "Production".
 */

export const STRIPE_LINKS = {
  "Budget": {
    monthly: 'https://buy.stripe.com/test_6oU5kD690gMt18Bgaw93y05', 
    yearly: 'https://buy.stripe.com/test_dRmaEX9lceElg3v7E093y04'
  },
  "Cost Control": {
    monthly: 'https://buy.stripe.com/test_9B600jbtkgMt9F7gaw93y03',
    yearly: 'https://buy.stripe.com/test_6oU5kD40SgMt3gJ2jG93y02'
  },
  "Production": {
  monthly: 'https://buy.stripe.com/test_5kQ8wPfJA67PeZr8I493y01',
  yearly:  'https://buy.stripe.com/test_00waEX7d42VD6sVf6s93y00'
  }
} as const;

export const STRIPE_CONFIG = {
  isLive: false,
  links: STRIPE_LINKS
};
