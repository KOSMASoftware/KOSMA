

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  NONE = 'none',
  TRIAL = 'trial'
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
  // App Login Tracking
  firstLoginAt?: string | null;
  lastLoginAt?: string | null;
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
  stripeCustomerId?: string;
  billingCycle: 'monthly' | 'yearly' | 'none' | 'trial';
  status: SubscriptionStatus;
  
  // The logic 'validUntil' displayed to user. 
  // Calculated based on specific priority rules (Stripe > Trial > Override)
  validUntil: string | null; 
  
  licenseKey: string | null;
  billingProjectName?: string; 

  // V2 Fields
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  
  // Admin Overrides
  adminValidUntilOverride?: string;
  adminOverrideReason?: string;
  adminOverrideBy?: string;
  adminOverrideAt?: string;

  // Pending Downgrade Fields
  pendingDowngradePlan?: string | null;
  pendingDowngradeCycle?: 'monthly' | 'yearly' | null;
  pendingDowngradeAt?: string | null;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  actorUserId?: string;
  actorEmail?: string;
  action: string;
  targetUserId: string;
  details: any;
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

// --- MARKETING BACKEND TYPES ---

export type MarketingJobStatus = 'scheduled' | 'running' | 'done' | 'done_with_errors' | 'failed' | 'cancelled';

export interface MarketingJob {
  id: string;
  created_at: string;
  created_by: string;
  status: MarketingJobStatus;
  run_at: string;
  segment_key: string;
  template_name: string;
  event_key: string;
  filters?: any;
  dry_run: boolean;
  stats?: {
    total?: number;
    sent?: number;
    failed?: number;
    skipped?: number;
    queued?: number;
    sending?: number;
  };
  last_error?: string;
}

export interface MarketingJobRecipient {
  job_id: string;
  user_id: string;
  email: string;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'skipped';
  attempts: number;
  error?: string;
  sent_at?: string;
  skip_reason?: string;
  provider_message_id?: string;
  created_at: string;
}

export interface EmailMessage {
  id?: string; // Optional if not selected
  to_email: string;
  template_name: string;
  event_key: string;
  status: 'sent' | 'failed';
  provider_message_id?: string;
  sent_at: string;
  job_id?: string;
  provider?: string;
  meta?: any;
}

export interface EmailEvent {
  id?: string; // Optional
  event_type: 'open' | 'click' | 'bounce' | 'unsub' | 'complaint' | 'delivered';
  to_email: string;
  occurred_at: string;
  provider_event_id?: string;
  message_id?: string;
  raw?: any;
}