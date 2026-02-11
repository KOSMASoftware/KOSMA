
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, License, BillingAddress, PlanTier } from '../../types';
import { DashboardTabs } from './DashboardTabs';
import { Notice, NoticeProps } from '../ui/Notice';
import { Building, Settings, ExternalLink, CreditCard, CalendarMinus } from 'lucide-react';
import { Button } from '../ui/Button';

export const SettingsView: React.FC<{ user: User, licenses: License[], billingAddress: BillingAddress | null, refresh: () => void }> = ({ user, licenses, billingAddress, refresh }) => {
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [notice, setNotice] = useState<NoticeProps | null>(null);

    const activeLicense = licenses[0];
    const hasStripeId = activeLicense?.stripeSubscriptionId && activeLicense.stripeSubscriptionId.startsWith('sub_');
    const hasStripeCustomer = !!activeLicense?.stripeCustomerId;

    const handlePortal = async () => {
        setNotice(null);
        // GUARD: No Stripe Customer = No Portal
        if (!hasStripeCustomer || activeLicense?.planTier === PlanTier.FREE) {
            setNotice({
                variant: 'warning',
                title: 'No Billing Account',
                message: 'You are currently on a free or trial plan. Please subscribe to a paid plan to manage billing details or payment methods.'
            });
            return;
        }

        setLoadingPortal(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
                body: { returnUrl: `${window.location.origin}/#/billing-return` },
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error(error?.message);
        } catch (e) {
            setNotice({
                variant: 'error',
                title: 'Portal Unavailable',
                message: 'Could not connect to Stripe. Please try again later.'
            });
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? Your access will remain active until the end of the current billing period.")) {
            return;
        }

        setCancelling(true);
        setNotice(null);
        try {
            const { data, error } = await supabase.functions.invoke('cancel-subscription');
            
            if (error) throw error;
            if (data?.success === false) throw new Error(data.error || "Cancellation failed");

            setNotice({
                variant: 'success',
                title: 'Cancellation Requested',
                message: 'Your subscription will be cancelled at the end of the billing period.'
            });
            refresh();
        } catch (err: any) {
            console.error("Cancellation error:", err);
            setNotice({
                variant: 'error',
                title: 'Cancellation Failed',
                message: err.message || 'Please contact support.'
            });
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Account Settings</h1>
            <DashboardTabs />
            
            {notice && (
                <div className="mb-8">
                    <Notice {...notice} onClose={() => setNotice(null)} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Building className="w-6 h-6 text-brand-500" /> Billing Info
                    </h3>
                    {billingAddress ? (
                        <div className="space-y-2 text-gray-600 font-medium mb-8">
                            <p className="text-gray-900 font-black">{billingAddress.companyName || user.name}</p>
                            <p>{billingAddress.street}</p>
                            <p>{billingAddress.zip} {billingAddress.city}</p>
                            <p className="text-xs uppercase font-bold text-gray-400 pt-4">VAT: {billingAddress.vatId || 'Not provided'}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm mb-8">No billing address stored yet. This will be updated after your first purchase.</p>
                    )}
                    
                    <Button 
                        onClick={handlePortal} 
                        isLoading={loadingPortal}
                        variant="secondary"
                        className="w-full h-12"
                        icon={<Settings className="w-4 h-4" />}
                    >
                        Update Billing Address
                    </Button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-brand-500" /> Payment Methods
                    </h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                        Securely manage your credit cards and subscription preferences in the Stripe customer portal.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button 
                            onClick={handlePortal} 
                            isLoading={loadingPortal}
                            variant="primary"
                            className="w-full h-12"
                            icon={<ExternalLink className="w-4 h-4" />}
                        >
                            Open Portal
                        </Button>
                        
                        {hasStripeId && activeLicense?.status === 'active' && !activeLicense.cancelAtPeriodEnd && (
                            <Button 
                                onClick={handleCancelSubscription}
                                isLoading={cancelling}
                                variant="danger"
                                className="w-full mt-2"
                                icon={<CalendarMinus className="w-3.5 h-3.5" />}
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
