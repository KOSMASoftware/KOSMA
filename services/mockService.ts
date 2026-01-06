import { User, UserRole, License, SubscriptionStatus, Invoice, PlanTier, Project } from '../types';

// --- MOCK DATABASE ---
const USERS: User[] = [
  { id: 'u1', email: 'customer@demo.com', name: 'Hans Müller', role: UserRole.CUSTOMER, registeredAt: '2023-01-15', stripeCustomerId: 'cus_123' },
  { id: 'u2', email: 'admin@demo.com', name: 'System Admin', role: UserRole.ADMIN, registeredAt: '2023-01-01' },
  { id: 'u3', email: 'producer@film.de', name: 'Sarah Connor', role: UserRole.CUSTOMER, registeredAt: '2023-03-10', stripeCustomerId: 'cus_456' },
  { id: 'u4', email: 'student@hff.de', name: 'Max Mustermann', role: UserRole.CUSTOMER, registeredAt: '2023-05-22', stripeCustomerId: 'cus_789' },
  { id: 'u5', email: 'dropout@trial.com', name: 'Tim Tester', role: UserRole.CUSTOMER, registeredAt: '2023-09-01', stripeCustomerId: 'cus_000' }, // Trial expired
  { id: 'u6', email: 'ex-customer@studio.com', name: 'Julia Roberts', role: UserRole.CUSTOMER, registeredAt: '2022-11-20', stripeCustomerId: 'cus_999' }, // Churned
];

// Initial License State (Simulates 'licenses' + 'subscriptions' tables)
let LICENSES: License[] = [
  { 
    id: 'l1', 
    userId: 'u1', 
    productName: 'KOSMA',
    planTier: PlanTier.BUDGET,
    billingCycle: 'yearly',
    validUntil: '2024-01-15', 
    licenseKey: 'KOS-BUD-1029', 
    status: SubscriptionStatus.ACTIVE,
    stripeSubscriptionId: 'sub_xyz123',
    billingProjectName: 'Tatort München: Abgrund' // From Stripe Metadata
  },
  { 
    id: 'l2', 
    userId: 'u2', 
    productName: 'KOSMA', 
    planTier: PlanTier.PRODUCTION,
    billingCycle: 'yearly',
    validUntil: '2099-12-31', 
    licenseKey: 'ADM-888-999', 
    status: SubscriptionStatus.ACTIVE,
    billingProjectName: 'Internal Admin'
  },
  { 
    id: 'l3', 
    userId: 'u3', 
    productName: 'KOSMA', 
    planTier: PlanTier.PRODUCTION,
    billingCycle: 'monthly',
    validUntil: '2023-11-10', 
    licenseKey: 'KOS-PRO-5551', 
    status: SubscriptionStatus.PAST_DUE,
    stripeSubscriptionId: 'sub_abc456',
    billingProjectName: 'Indie Short 2024' // From Stripe Metadata
  },
  { 
    id: 'l4', 
    userId: 'u4', 
    productName: 'KOSMA', 
    planTier: PlanTier.FREE,
    billingCycle: 'none',
    validUntil: null, 
    licenseKey: null, 
    status: SubscriptionStatus.NONE 
  },
  { 
    id: 'l5', 
    userId: 'u5', 
    productName: 'KOSMA', 
    planTier: PlanTier.FREE,
    billingCycle: 'none',
    validUntil: null, 
    licenseKey: null, 
    status: SubscriptionStatus.NONE 
  },
  { 
    id: 'l6', 
    userId: 'u6', 
    productName: 'KOSMA', 
    planTier: PlanTier.COST_CONTROL,
    billingCycle: 'monthly',
    validUntil: '2023-06-30', // Expired in the past
    licenseKey: 'KOS-COS-0000', 
    status: SubscriptionStatus.CANCELED, 
    billingProjectName: 'Old Studio Project'
  }
];

// Synced Projects from Electron App (Simulates 'projects' table)
// These are synced technically, separate from the billing project name
const PROJECTS: Record<string, Project[]> = {
  'u1': [
    { id: 'p1', name: 'Tatort München: Abgrund', lastSynced: '2023-10-05' },
    { id: 'p2', name: 'Werbespot BMW', lastSynced: '2023-09-12' }
  ],
  'u3': [
    { id: 'p3', name: 'Indie Short 2024', lastSynced: '2023-10-01' }
  ],
  'u4': [
    { id: 'p4', name: 'HFF Abschlussfilm', lastSynced: '2023-10-06' }
  ]
};

const INVOICES: Record<string, Invoice[]> = {
  'u1': [
    { id: 'inv_101', date: '2023-01-15', amount: 390.00, status: 'paid', pdfUrl: '#' }
  ],
  'u3': [
    { id: 'inv_201', date: '2023-03-10', amount: 69.00, status: 'paid', pdfUrl: '#' },
    { id: 'inv_202', date: '2023-04-10', amount: 69.00, status: 'paid', pdfUrl: '#' },
    { id: 'inv_203', date: '2023-10-10', amount: 69.00, status: 'open', pdfUrl: '#' } // Failed payment
  ],
  'u6': [
    { id: 'inv_601', date: '2023-01-01', amount: 59.00, status: 'paid', pdfUrl: '#' },
    { id: 'inv_602', date: '2023-02-01', amount: 59.00, status: 'paid', pdfUrl: '#' }
  ]
};

// --- SYSTEM LOGS SIMULATION ---
const LOGS = [
  { id: 1, type: 'info', source: 'Auth', message: 'User login success (admin@demo.com)', time: 'Just now' },
  { id: 2, type: 'success', source: 'Stripe', message: 'Webhook received: invoice.payment_succeeded', time: '2 mins ago' },
  { id: 3, type: 'info', source: 'Supabase', message: 'Realtime subscription active: public.projects', time: '5 mins ago' },
  { id: 4, type: 'warning', source: 'System', message: 'High latency on Edge Function: generate-pdf', time: '12 mins ago' },
  { id: 5, type: 'error', source: 'Stripe', message: 'Payment failed for user u3 (insufficient_funds)', time: '1 hour ago' },
];

// --- API SIMULATION ---

export const mockApi = {
  login: async (email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = USERS.find(u => u.email === email);
        if (user) resolve(user);
        else reject(new Error('User not found'));
      }, 800);
    });
  },

  signup: async (email: string, name: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: `u${Date.now()}`,
          email,
          name,
          role: UserRole.CUSTOMER,
          registeredAt: new Date().toISOString()
        };
        USERS.push(newUser);
        LICENSES.push({
          id: `l${Date.now()}`,
          userId: newUser.id,
          productName: 'KOSMA',
          planTier: PlanTier.FREE,
          billingCycle: 'none',
          validUntil: null,
          licenseKey: null,
          status: SubscriptionStatus.NONE
        });
        resolve(newUser);
      }, 800);
    });
  },

  getLicense: async (userId: string): Promise<License | undefined> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(LICENSES.find(l => l.userId === userId)), 400);
    });
  },

  getAdminData: async (): Promise<{
    users: User[],
    licenses: License[],
    stats: { totalUsers: number, activeLicenses: number, inactiveLicenses: number, revenue: number }
  }> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const activeLicenses = LICENSES.filter(l => l.status === SubscriptionStatus.ACTIVE);
        const inactiveLicenses = LICENSES.filter(l => l.status !== SubscriptionStatus.ACTIVE);
        
        let revenue = 0;
        Object.values(INVOICES).flat().forEach(i => {
             if(i.status === 'paid') revenue += i.amount;
        });

        resolve({
          users: USERS,
          licenses: LICENSES,
          stats: {
            totalUsers: USERS.length,
            activeLicenses: activeLicenses.length,
            inactiveLicenses: inactiveLicenses.length,
            revenue
          }
        });
      }, 500);
    });
  },

  getUserDetails: async (userId: string): Promise<{ projects: Project[], invoices: Invoice[] }> => {
     return new Promise(resolve => {
        setTimeout(() => {
           resolve({
             projects: PROJECTS[userId] || [],
             invoices: INVOICES[userId] || []
           });
        }, 300);
     });
  },

  // Simulates the Stripe Checkout Webhook effect
  purchaseSubscription: async (userId: string, tier: PlanTier): Promise<License> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const licenseIndex = LICENSES.findIndex(l => l.userId === userId);
        if (licenseIndex > -1) {
          const updatedLicense: License = {
            ...LICENSES[licenseIndex],
            status: SubscriptionStatus.ACTIVE,
            planTier: tier,
            billingCycle: 'yearly',
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            licenseKey: `KOSMA-${tier.toUpperCase().substring(0,3)}-${Math.floor(Math.random() * 10000)}`,
            stripeSubscriptionId: `sub_new_${Date.now()}`,
            billingProjectName: 'New Project (via Checkout)' // Simulated Metadata
          };
          LICENSES[licenseIndex] = updatedLicense;
          
          let amount = 0;
          if (tier === PlanTier.BUDGET) amount = 390;
          if (tier === PlanTier.COST_CONTROL) amount = 590;
          if (tier === PlanTier.PRODUCTION) amount = 690;
          
          if (amount > 0) {
            const newInvoice = {
              id: `inv_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              amount,
              status: 'paid' as const,
              pdfUrl: '#'
            };
            if (!INVOICES[userId]) INVOICES[userId] = [];
            INVOICES[userId].unshift(newInvoice);
          }

          resolve(updatedLicense);
        }
      }, 1500);
    });
  },

  getInvoices: async (userId: string): Promise<Invoice[]> => {
    return new Promise(resolve => setTimeout(() => resolve(INVOICES[userId] || []), 300));
  },

  // --- NEW SYSTEM CHECK METHODS ---
  getSystemStatus: async () => {
    return new Promise<{ service: string, status: 'operational' | 'degraded' | 'down', latency: number }[]>((resolve) => {
        setTimeout(() => {
            resolve([
                { service: 'Supabase Auth', status: 'operational', latency: 45 },
                { service: 'PostgreSQL DB', status: 'operational', latency: 32 },
                { service: 'Stripe API', status: 'operational', latency: 120 },
                { service: 'Edge Functions', status: 'operational', latency: 85 },
                { service: 'Email Service', status: 'operational', latency: 210 },
            ]);
        }, 600);
    });
  },

  getSystemLogs: async () => {
      return new Promise(resolve => setTimeout(() => resolve(LOGS), 400));
  }
};