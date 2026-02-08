import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PlanTier, SubscriptionStatus, User } from '../../types';
import { STRIPE_LINKS } from '../../config/stripe';
import { Card } from '../ui/Card';
import { Notice, NoticeProps } from '../ui/Notice';
import { Loader2, Settings, Check } from 'lucide-react';
import { PLANS, PLAN_RANK } from '../../data/plans';

interface PricingSectionProps {
    user: User;
    currentTier: PlanTier;
    currentCycle: string;
    status: SubscriptionStatus;
    hasStripeId: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ user, currentTier, currentCycle, status, hasStripeId }) => {
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [notice, setNotice] = useState<NoticeProps | null>(null);
    const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>('yearly');
    
    const isManagedViaPortal = hasStripeId && (status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.PAST_DUE || status === SubscriptionStatus.TRIAL);

    const handlePortalRedirect = async () => {
        setLoadingPortal(true);
        setNotice(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
                body: { returnUrl: `${window.location.origin}/#/billing-return` },
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error(error?.message || "No URL returned");
        } catch (e) {
            console.error(e);
            setNotice({ 
                variant: 'error', 
                title: 'Portal Error', 
                message: 'Could not open billing portal. Please try again or contact support.' 
            });
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleDowngrade = async (targetPlan: PlanTier, targetCycle: 'yearly' | 'monthly') => {
        setLoadingPortal(true);
        setNotice(null);
        try {
            const { data, error } = await supabase.functions.invoke('schedule-downgrade', {
                body: { planTier: targetPlan, billingCycle: targetCycle }
            });
            if (error || data?.success === false) {
                throw new Error(data?.error || error?.message || 'Downgrade failed');
            }
            const dateLabel = new Date(data.effectiveAt).toLocaleDateString('en-GB');
            setNotice({
                variant: 'success',
                title: 'Change Scheduled',
                message: `Your plan will change to ${targetPlan} (${targetCycle}) on ${dateLabel}.`
            });
        } catch (err: any) {
            console.error("Downgrade error:", err);
            setNotice({
                variant: 'error',
                title: 'Downgrade Failed',
                message: err.message
            });
        } finally {
            setLoadingPortal(false);
        }
    };

    const handlePurchase = (planName: PlanTier, cycle: 'yearly' | 'monthly') => {
        const link = STRIPE_LINKS[planName]?.[cycle];
        if (!link) {
            setNotice({
                variant: 'error',
                title: 'Configuration Error',
                message: 'Payment link is missing. Please contact support.'
            });
            return;
        }
        const url = new URL(link);
        url.searchParams.set('client_reference_id', user.id);
        url.searchParams.set('prefilled_email', user.email);
        window.location.href = url.toString();
    };

    // Filter out Free plan for the upgrade list
    const availablePlans = PLANS.filter(p => p.name !== PlanTier.FREE);

    return (
        <div className="mt-12 border-t border-gray-100 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Expand Your Tools</h3>
                    <p className="text-gray-500 mt-1">
                        {isManagedViaPortal 
                            ? "Manage your active subscription in the Stripe Customer Portal or plan a downgrade." 
                            : "Choose the tier that matches your production workflow."}
                    </p>
                </div>
                <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-inner">
                    <button onClick={() => setBillingInterval('yearly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingInterval === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Yearly</button>
                    <button onClick={() => setBillingInterval('monthly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
                </div>
            </div>

            {notice && (
                <div className="mb-8">
                    <Notice {...notice} onClose={() => setNotice(null)} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans.map((plan) => {
                    // Logic Flags
                    const isCurrentTier = plan.name === currentTier;
                    const isCurrentExact = isCurrentTier && billingInterval === currentCycle;

                    const currentRank = PLAN_RANK[currentTier] || 0;
                    const targetRank = PLAN_RANK[plan.name] || 0;
                    
                    const isTierUpgrade = targetRank > currentRank;
                    const isTierDowngrade = targetRank < currentRank;
                    const isCycleSwitchSameTier = isCurrentTier && billingInterval !== currentCycle;
                    
                    // Specific logic for cycle switching:
                    const isYearToMonth = isCurrentTier && currentCycle === 'yearly' && billingInterval === 'monthly';
                    const isMonthToYear = isCurrentTier && currentCycle === 'monthly' && billingInterval === 'yearly';

                    // Display Logic: If active tier, show the actual current price/cycle, ignoring the toggle
                    const displayCycle = (isCurrentTier && (currentCycle === 'monthly' || currentCycle === 'yearly')) ? currentCycle : billingInterval;
                    const displayPrice = displayCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                    const displayLabel = displayCycle === 'yearly' ? 'per year' : 'per month';

                    return (
                        <Card 
                            key={plan.name} 
                            color={plan.color}
                            interactive
                            enableLedEffect={true}
                            className="group h-full p-6 rounded-2xl"
                        >
                            {isCurrentTier && (
                                <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-widest uppercase z-10">
                                    Active
                                </div>
                            )}
                            <h4 className={`text-xl md:text-2xl font-black ${plan.textClass} mb-4 tracking-tight`}>{plan.title}</h4>
                            <div className="flex justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300"><plan.Icon className={`w-14 h-14 ${plan.textClass} opacity-80`} /></div>
                            <div className="mb-6 text-center">
                                <span className={`text-4xl font-black ${plan.textClass}`}>{displayPrice} €</span>
                                <span className="text-sm text-gray-400 block mt-1 font-bold">{displayLabel}</span>
                            </div>

                            <div className="flex flex-col gap-3 mb-6">
                                {isCurrentExact ? (
                                    <button
                                        disabled
                                        className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-300 text-sm font-bold cursor-not-allowed"
                                    >
                                        Currently Active
                                    </button>
                                ) : isManagedViaPortal ? (
                                    <>
                                        {/* Case: Same Tier, Switching Cycle */}
                                        {isCycleSwitchSameTier && isYearToMonth && (
                                            <button
                                                onClick={() => handleDowngrade(plan.name, 'monthly')}
                                                disabled={loadingPortal}
                                                className={`w-full py-2.5 rounded-lg border-2 text-sm font-bold transition-all shadow-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center gap-2`}
                                            >
                                                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : "Switch to Monthly (next renewal)"}
                                            </button>
                                        )}
                                        {isCycleSwitchSameTier && isMonthToYear && (
                                            <button
                                                onClick={handlePortalRedirect}
                                                disabled={loadingPortal}
                                                className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-200 flex items-center justify-center gap-2 transition-all"
                                            >
                                                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Settings className="w-4 h-4"/>}
                                                Switch to Yearly
                                            </button>
                                        )}

                                        {/* Case: Tier Downgrade */}
                                        {isTierDowngrade && (
                                            <button
                                                onClick={() => handleDowngrade(plan.name, billingInterval)}
                                                disabled={loadingPortal}
                                                className={`w-full py-2.5 rounded-lg border-2 text-sm font-bold transition-all shadow-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center gap-2`}
                                            >
                                                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : "Downgrade (next renewal)"}
                                            </button>
                                        )}

                                        {/* Case: Tier Upgrade */}
                                        {isTierUpgrade && (
                                            <button
                                                onClick={handlePortalRedirect}
                                                disabled={loadingPortal}
                                                className="w-full py-2.5 rounded-lg border-2 border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-200 flex items-center justify-center gap-2 transition-all"
                                            >
                                                {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Settings className="w-4 h-4"/>}
                                                Upgrade
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    /* No Stripe Subscription (Free/Trial) */
                                    <button
                                        onClick={() => handlePurchase(plan.name, billingInterval)}
                                        className={`w-full py-2.5 rounded-lg border-2 text-sm font-bold transition-all shadow-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white`}
                                    >
                                        Get Started
                                    </button>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6 flex-1">
                                <ul className="space-y-3 text-left text-sm text-gray-600 font-medium">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start"><Check className={`w-5 h-5 ${plan.textClass} shrink-0`} /> <span>{f}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
