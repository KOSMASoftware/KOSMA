import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, License, Invoice, BillingAddress, PlanTier, SubscriptionStatus } from '../types';

export const useCustomerData = (user: User) => {
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Licenses
                const { data: licData, error: licError } = await supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id);

                if (licError) console.error("License Fetch Error:", licError);
                
                // 2. Billing Address
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('billing_address')
                    .eq('id', user.id)
                    .single();

                if (profileData?.billing_address) setBillingAddress(profileData.billing_address);

                // 3. Map Licenses
                if (licData && licData.length > 0) {
                     const mappedLicenses = licData.map((l: any) => {
                        // Calculate validUntil based on priority: Stripe > Trial > Admin Override
                        let computedValidUntil: string | null = null;
                        
                        if (l.stripe_subscription_id) {
                            computedValidUntil = l.current_period_end;
                        } else if (l.status === 'trial') {
                            computedValidUntil = l.trial_ends_at;
                        } else {
                            computedValidUntil = l.admin_valid_until_override;
                        }

                        return {
                            id: l.id,
                            userId: l.user_id,
                            productName: l.product_name,
                            planTier: l.plan_tier as PlanTier,
                            billingCycle: l.billing_cycle || 'none',
                            status: l.status as SubscriptionStatus,
                            validUntil: computedValidUntil,
                            licenseKey: l.license_key,
                            billingProjectName: l.billing_project_name,
                            stripeSubscriptionId: l.stripe_subscription_id,
                            stripeCustomerId: l.stripe_customer_id,
                            cancelAtPeriodEnd: l.cancel_at_period_end,
                            currentPeriodEnd: l.current_period_end,
                            trialEndsAt: l.trial_ends_at,
                            pendingDowngradePlan: l.pending_downgrade_plan,
                            pendingDowngradeCycle: l.pending_downgrade_cycle,
                            pendingDowngradeAt: l.pending_downgrade_at
                        };
                    });
                    setLicenses(mappedLicenses);
                } else {
                    // Fallback Dummy License for UI consistency
                    setLicenses([{
                        id: 'temp', userId: user.id, productName: 'KOSMA', 
                        planTier: PlanTier.FREE, billingCycle: 'none', 
                        status: SubscriptionStatus.NONE, validUntil: null, 
                        licenseKey: null 
                    }]);
                }

                // 4. Invoices
                const { data: invData } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                 if (invData) {
                    setInvoices(invData.map((i: any) => ({
                        id: i.id,
                        date: i.created_at, 
                        amount: (Number(i.amount) || 0) / 100,
                        currency: 'EUR',
                        status: i.status,
                        pdfUrl: i.invoice_pdf_url || i.invoice_hosted_url || '#',
                        projectName: i.project_name
                    })));
                 }
            } catch (err: any) {
                console.error("Critical Data Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, refreshTrigger]);

    return { loading, licenses, invoices, billingAddress, refresh };
};
