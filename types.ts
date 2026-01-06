
export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  NONE = 'none'
}

export enum PlanTier {
  FREE = 'Free',
  BUDGET = 'Budget',
  COST_CONTROL = 'Cost Control',
  PRODUCTION = 'Production'
}

export interface BillingAddress {
  companyName?: string;
  vatId?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  registeredAt: string;
  stripeCustomerId?: string;
  billingAddress?: BillingAddress;
}

export interface Project {
  id: string;
  name: string;
  lastSynced: string;
}

export interface License {
  id: string;
  userId: string;
  productName: string; 
  planTier: PlanTier;
  stripeSubscriptionId?: string;
  billingCycle: 'monthly' | 'yearly' | 'none';
  status: SubscriptionStatus;
  validUntil: string | null; 
  licenseKey: string | null;
  billingProjectName?: string; 
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open';
  pdfUrl: string;
  projectName?: string;
}

export interface Session {
  user: User | null;
  token: string | null;
}
