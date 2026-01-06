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

// Maps to Supabase 'auth.users' + 'public.customers'
export interface User {
  id: string; // Supabase Auth ID
  email: string;
  name: string;
  role: UserRole;
  registeredAt: string;
  stripeCustomerId?: string; // From 'public.customers'
}

// Maps to 'public.products' logic via Stripe
export interface Product {
  id: string;
  name: string;
  stripePriceId: string;
}

// Maps to 'public.projects' (Synced from Electron App)
export interface Project {
  id: string;
  name: string;
  lastSynced: string;
}

// Maps to 'public.licenses' & 'public.subscriptions' combined view for frontend
export interface License {
  id: string;
  userId: string; // foreign key to customers
  productName: string; 
  planTier: PlanTier;
  
  // Subscription Data
  stripeSubscriptionId?: string;
  billingCycle: 'monthly' | 'yearly' | 'none';
  status: SubscriptionStatus;
  
  // License Specifics
  validUntil: string | null; 
  licenseKey: string | null;
  
  // Requirement D: Project Name from Stripe Metadata -> Invoice -> DB
  billingProjectName?: string; 
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'open';
  pdfUrl: string;
}

export interface Session {
  user: User | null;
  token: string | null;
}