
import React, { useEffect, useState } from 'react';
import { User, License, Invoice, PlanTier } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { DashboardTabs } from './DashboardTabs';
import { PricingSection } from '../billing/PricingSection';
import { RefreshCw, Check, AlertCircle, TrendingDown } from 'lucide-react';
import { H1, H2, H3, H4, H5, Paragraph, Label, Small } from '../ui/Typography';

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
            <H3 className="mb-8">Your Subscription</H3>
            <DashboardTabs />

            {isPolling && (
                <div className="bg-brand-50 border border-brand-100 text-brand-800 p-6 rounded-2xl mb-12 flex items-center gap-4 animate-pulse">
                    <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
                    <div>
                        <H4 className="mb-1">Syncing Status...</H4>
                        <Small className="opacity-70 block">We are synchronizing your account with Stripe. This takes a few seconds.</Small>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <H5 className="text-brand-500 mb-2">Active Plan</H5>
                        <div className="flex items-baseline gap-2">
                            <H3>{activeLicense?.planTier || 'Free'}</H3>
                            <Label className="text-gray-400">/{cycleLabel}</Label>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Small className={`flex items-center gap-2 border px-4 py-1.5 rounded-full font-bold ${
                                activeLicense?.status === 'active' 
                                    ? 'bg-green-50 border-green-100 text-green-700' 
                                    : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}>
                                <Check className="w-4 h-4" /> {activeLicense?.status}
                            </Small>
                            {activeLicense?.cancelAtPeriodEnd && (
                                <Small className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-bold">
                                    <AlertCircle className="w-4 h-4" /> Cancels soon
                                </Small>
                            )}
                            {activeLicense?.pendingDowngradePlan && (
                                <Small className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-bold">
                                    <TrendingDown className="w-4 h-4" /> Downgrade scheduled
                                </Small>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 md:min-w-[280px]">
                        <H5 className="text-gray-400 mb-4">Renewal Details</H5>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-gray-500 font-medium text-sm">Valid until</Label>
                                <Label className="text-gray-900 font-black text-sm">{activeLicense?.validUntil ? new Date(activeLicense.validUntil).toLocaleDateString() : '—'}</Label>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label className="text-gray-500 font-medium text-sm">Auto-renew</Label>
                                <Label className={`${autoRenewClass} font-black text-sm`}>
                                    {autoRenewLabel}
                                </Label>
                            </div>
                            {activeLicense?.pendingDowngradeAt && (
                                <div className="flex justify-between items-center border-t border-gray-100 pt-2 mt-2">
                                    <Label className="text-gray-500 font-medium text-sm">Downgrade to {activeLicense.pendingDowngradePlan}</Label>
                                    <Label className="text-brand-600 font-black text-sm">{new Date(activeLicense.pendingDowngradeAt).toLocaleDateString()}</Label>
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
