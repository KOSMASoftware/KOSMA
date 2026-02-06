import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { User, License, PlanTier, SubscriptionStatus, UserRole } from '../../../types';

export const useAdminData = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, activeLicenses: 0, inactiveLicenses: 0, revenue: 0 });
    const [refreshIndex, setRefreshIndex] = useState(0);
    const refreshData = () => setRefreshIndex(prev => prev + 1);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
                if (pError) console.error("Profiles error:", pError);

                const { data: licData, error: lError } = await supabase.from('licenses').select('*');
                if (lError) console.error("Licenses error:", lError);

                const { data: invData } = await supabase.from('invoices').select('amount, status');

                if (profiles && Array.isArray(profiles)) {
                    setUsers(profiles.map((p: any) => ({
                        id: p.id, 
                        email: p.email || 'N/A', 
                        name: p.full_name || 'User', 
                        role: p.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
                        registeredAt: p.created_at || new Date().toISOString(), 
                        stripeCustomerId: p.stripe_customer_id, 
                        billingAddress: p.billing_address,
                        firstLoginAt: p.first_login_at || null, 
                        lastLoginAt: p.last_login_at || null
                    })));
                }
                
                if (licData && Array.isArray(licData)) {
                    setLicenses(licData.map((l: any) => {
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
                            adminValidUntilOverride: l.admin_valid_until_override,
                            currentPeriodEnd: l.current_period_end,
                            trialEndsAt: l.trial_ends_at,
                            pendingDowngradePlan: l.pending_downgrade_plan,
                            pendingDowngradeCycle: l.pending_downgrade_cycle,
                            pendingDowngradeAt: l.pending_downgrade_at
                        };
                    }));
                }
                const rev = (invData as any[])?.filter((i: any) => i.status === 'paid').reduce((acc: number, curr: any) => acc + ((Number(curr.amount) || 0) / 100), 0) || 0;
                setStats({ totalUsers: profiles?.length || 0, activeLicenses: licData?.filter((l: any) => l.status === 'active').length || 0, inactiveLicenses: licData?.filter((l: any) => l.status !== 'active').length || 0, revenue: rev });
            } catch(e) {
                console.error("[AdminData] Crash:", e);
            } finally { 
                setLoading(false); 
            }
        };
        fetchAll();
    }, [refreshIndex]);
    return { loading, users, licenses, stats, refreshData };
};