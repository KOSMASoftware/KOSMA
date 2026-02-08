import React, { useEffect, useState } from 'react';
import { User, License, Invoice, PlanTier } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardTabs } from './DashboardTabs';
import { PricingSection } from '../billing/PricingSection';
import { RefreshCw, Check, AlertCircle, TrendingDown } from 'lucide-react';

export const SubscriptionView: React.FC<{ user: User, licenses: License[], invoices: Invoice[], refresh: () => void }> = ({ user, licenses, invoices, refresh }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isPolling, setIsPolling] = useState(false);
    const { refreshProfile } = useAuth();

    const activeLicense = licenses[0];
    const hasStripeId = activeLicense?.stripeSubscriptionId && activeLicense.stripeSubscriptionId.startsWith('sub_');

    const isAutoRenew = hasStripeId && activeLicense?.status === 'active' && !activeLicense?.cancelAtPeriodEnd;
    const autoRenewLabel = hasStripeId ? (isAutoRenew ? 'Active' : 'Off') : '—';
    const autoRenewClass = isAutoRenew ? 'text-green-600' : 'text-amber-600';

    const cycleLabel = activeLicense?.billingCycle === 'yearly' 
        ? 'Yearly' 
        : activeLicense?.billingCycle === 'monthly' 
            ? 'Monthly' 
            : activeLicense?.status === 'trial' ? 'Trial' : '—';

    useEffect(() => {
        if (searchParams.get('stripe_success') === 'true' || searchParams.get('checkout') === 'success') {
            setIsPolling(true);
            refreshProfile();
        }
    }, [searchParams, refreshProfile]);

    useEffect(() => {
        if (!isPolling) return;
        const intervalId = setInterval(async () => {
            refresh();
            if ((activeLicense?.status === 'active' && hasStripeId) || activeLicense?.cancelAtPeriodEnd) {
                setIsPolling(false);
                setSearchParams({});
            }
        }, 3000);
        return () => clearInterval(intervalId);
    }, [isPolling, refresh, activeLicense, hasStripeId, setSearchParams]);

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Your Subscription</h1>
            <DashboardTabs />

            {isPolling && (
                <div className="bg-brand-50 border border-brand-100 text-brand-800 p-6 rounded-2xl mb-12 flex items-center gap-4 animate-pulse">
                    <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
                    <div>
                        <h3 className="font-black text-base tracking-tight">Syncing Status...</h3>
                        <p className="text-sm font-medium opacity-70">We are synchronizing your account with Stripe. This takes a few seconds.</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="text-xs font-black text-brand-500 uppercase tracking-[0.2em]">Active Plan</span>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{activeLicense?.planTier || 'Free'}</h2>
                            <span className="text-gray-400 font-bold">/{cycleLabel}</span>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <div className={`flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                                activeLicense?.status === 'active' 
                                    ? 'bg-green-50 border-green-100 text-green-700' 
                                    : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}>
                                <Check className="w-4 h-4" /> {activeLicense?.status}
                            </div>
                            {activeLicense?.cancelAtPeriodEnd && (
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    <AlertCircle className="w-4 h-4" /> Cancels soon
                                </div>
                            )}
                            {activeLicense?.pendingDowngradePlan && (
                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    <TrendingDown className="w-4 h-4" /> Downgrade scheduled
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 md:min-w-[280px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Renewal Details</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Valid until</span>
                                <span className="text-gray-900 font-black">{activeLicense?.validUntil ? new Date(activeLicense.validUntil).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Auto-renew</span>
                                <span className={`${autoRenewClass} font-black`}>
                                    {autoRenewLabel}
                                </span>
                            </div>
                            {activeLicense?.pendingDowngradeAt && (
                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-2 mt-2">
                                    <span className="text-gray-500 font-medium">Downgrade to {activeLicense.pendingDowngradePlan}</span>
                                    <span className="text-brand-600 font-black">{new Date(activeLicense.pendingDowngradeAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PricingSection user={user} currentTier={activeLicense?.planTier || PlanTier.FREE} currentCycle={activeLicense?.billingCycle || 'none'} status={activeLicense?.status} hasStripeId={!!hasStripeId} />
        </div>
    );
};
