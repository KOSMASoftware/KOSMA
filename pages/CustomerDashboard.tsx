
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { License, SubscriptionStatus, Invoice, PlanTier, User, BillingAddress } from '../types';
import { Loader2, Download, CreditCard, FileText, Settings, Zap, Briefcase, LayoutDashboard, Building, Check, Calculator, BarChart3, Clapperboard, AlertCircle, RefreshCw, ChevronRight, Lock, ExternalLink, CalendarMinus, TrendingDown } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { STRIPE_LINKS } from '../config/stripe';

// --- SHARED COMPONENTS ---

const DashboardTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-md sticky top-0 z-10 -mx-4 md:mx-0 px-4">
             <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard')
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
            <Link 
                to="/dashboard/subscription" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard/subscription') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <CreditCard className="w-4 h-4" /> Subscription
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/dashboard/settings') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <Settings className="w-4 h-4" /> Settings
            </Link>
        </div>
    );
};

// --- DATA HOOK ---
const useCustomerData = (user: User) => {
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: licData, error: licError } = await supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id);

                if (licError) console.error("License Fetch Error:", licError);
                
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('billing_address')
                    .eq('id', user.id)
                    .single();

                if (profileData?.billing_address) setBillingAddress(profileData.billing_address);

                if (licData && licData.length > 0) {
                     const mappedLicenses = licData.map((l: any) => ({
                        id: l.id,
                        userId: l.user_id,
                        productName: l.product_name,
                        planTier: l.plan_tier as PlanTier,
                        billingCycle: l.billing_cycle || 'none',
                        status: l.status as SubscriptionStatus,
                        validUntil: l.admin_valid_until_override || l.current_period_end || l.valid_until,
                        licenseKey: l.license_key,
                        billingProjectName: l.billing_project_name,
                        stripeSubscriptionId: l.stripe_subscription_id,
                        stripeCustomerId: l.stripe_customer_id,
                        cancelAtPeriodEnd: l.cancel_at_period_end,
                        currentPeriodEnd: l.current_period_end,
                        pendingDowngradePlan: l.pending_downgrade_plan,
                        pendingDowngradeCycle: l.pending_downgrade_cycle,
                        pendingDowngradeAt: l.pending_downgrade_at
                    }));
                    setLicenses(mappedLicenses);
                } else {
                    setLicenses([{
                        id: 'temp', userId: user.id, productName: 'KOSMA', 
                        planTier: PlanTier.FREE, billingCycle: 'none', 
                        status: SubscriptionStatus.NONE, validUntil: null, 
                        licenseKey: null 
                    }]);
                }

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

const PricingSection: React.FC<{ user: User, currentTier: PlanTier, currentCycle: string, status: SubscriptionStatus, hasStripeId: boolean }> = ({ user, currentTier, currentCycle, status, hasStripeId }) => {
    const [loadingPortal, setLoadingPortal] = useState(false);
    const isManagedViaPortal = hasStripeId && (status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.PAST_DUE || status === SubscriptionStatus.TRIAL);

    const handlePortalRedirect = async () => {
        setLoadingPortal(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
                body: { returnUrl: `${window.location.origin}/#/dashboard/settings` },
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error(error?.message || "No URL returned");
        } catch (e) {
            console.error(e);
            alert("Could not open billing portal. Please try again.");
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleDowngrade = async (targetPlan: PlanTier, targetCycle: 'yearly' | 'monthly') => {
        setLoadingPortal(true);
        try {
            const { data, error } = await supabase.functions.invoke('schedule-downgrade', {
                body: { planTier: targetPlan, billingCycle: targetCycle }
            });
            if (error || data?.success === false) {
                throw new Error(data?.error || error?.message || 'Downgrade failed');
            }
            const dateLabel = new Date(data.effectiveAt).toLocaleDateString('de-DE');
            alert(`Downgrade geplant zum Periodenende (${dateLabel}).`);
        } catch (err: any) {
            console.error("Downgrade error:", err);
            alert(`Fehler: ${err.message}`);
        } finally {
            setLoadingPortal(false);
        }
    };

    const handlePurchase = (planName: PlanTier, cycle: 'yearly' | 'monthly') => {
        const link = STRIPE_LINKS[planName]?.[cycle];
        if (!link) {
            alert("Payment link configuration missing.");
            return;
        }
        const url = new URL(link);
        url.searchParams.set('client_reference_id', user.id);
        url.searchParams.set('prefilled_email', user.email);
        window.location.href = url.toString();
    };

    const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>('yearly');

    const plans = [
        {
          name: PlanTier.BUDGET,
          title: "Budget",
          Icon: Calculator,
          price: billingInterval === 'yearly' ? 390 : 39,
          colorClass: "border-amber-500",
          textClass: "text-amber-500",
          features: ["Budgeting Module", "Unlimited Projects", "Print to PDF"]
        },
        {
          name: PlanTier.COST_CONTROL,
          title: "Cost Control",
          Icon: BarChart3,
          price: billingInterval === 'yearly' ? 590 : 59,
          colorClass: "border-purple-600",
          textClass: "text-purple-600",
          features: ["Budgeting + Cost Control", "Soll/Ist Comparison", "Share projects"]
        },
        {
          name: PlanTier.PRODUCTION,
          title: "Production",
          Icon: Clapperboard,
          price: billingInterval === 'yearly' ? 690 : 69,
          colorClass: "border-green-600",
          textClass: "text-green-600",
          features: ["All Modules", "Financing & Cashflow", "Multi-Project Overview"]
        }
    ];

    return (
        <div className="mt-16 border-t border-gray-100 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Expand Your Tools</h3>
                    <p className="text-gray-500 mt-1">
                        {isManagedViaPortal 
                            ? "Manage your active subscription in the Stripe Customer Portal or plan a downgrade." 
                            : "Choose the tier that matches your production workflow."}
                    </p>
                </div>
                <div className="inline-flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
                    <button onClick={() => setBillingInterval('yearly')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${billingInterval === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Yearly</button>
                    <button onClick={() => setBillingInterval('monthly')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Monthly</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const isCurrent = plan.name === currentTier && billingInterval === currentCycle;
                    
                    // Downgrade Rank Logic
                    const planRank: Record<string, number> = { "Free": 0, "Budget": 1, "Cost Control": 2, "Production": 3 };
                    const currentRank = planRank[currentTier] || 0;
                    const targetRank = planRank[plan.name] || 0;
                    const isSameTier = currentTier === plan.name;
                    const isDowngrade = targetRank < currentRank || (isSameTier && currentCycle === 'yearly' && billingInterval === 'monthly');

                    return (
                        <div key={plan.name} className={`relative bg-white rounded-3xl shadow-sm border border-gray-100 border-t-[10px] ${plan.colorClass} p-8 flex flex-col h-full hover:shadow-xl transition-all duration-300 group`}>
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-widest uppercase">
                                    Active
                                </div>
                            )}
                            <h4 className={`text-2xl font-black ${plan.textClass} mb-4 tracking-tight`}>{plan.title}</h4>
                            <div className="flex justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300"><plan.Icon className={`w-14 h-14 ${plan.textClass} opacity-80`} /></div>
                            <div className="mb-8 text-center">
                                <span className={`text-5xl font-black ${plan.textClass}`}>{plan.price} €</span>
                                <span className="text-sm text-gray-400 block mt-1 font-bold">{billingInterval === 'yearly' ? 'per year' : 'per month'}</span>
                            </div>

                            <div className="flex flex-col gap-3 mb-8">
                                {isCurrent ? (
                                    <button
                                        disabled
                                        className="w-full py-4 rounded-2xl border-2 border-gray-100 text-gray-300 text-sm font-bold cursor-not-allowed"
                                    >
                                        Currently Active
                                    </button>
                                ) : (isManagedViaPortal && isDowngrade) ? (
                                    <button
                                        onClick={() => handleDowngrade(plan.name, billingInterval)}
                                        disabled={loadingPortal}
                                        className={`w-full py-4 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center gap-2`}
                                    >
                                        {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : "Downgrade"}
                                    </button>
                                ) : isManagedViaPortal ? (
                                    <button
                                        onClick={handlePortalRedirect}
                                        disabled={loadingPortal}
                                        className="w-full py-4 rounded-2xl border-2 border-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-50 hover:border-gray-200 flex items-center justify-center gap-2 transition-all"
                                    >
                                        {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Settings className="w-4 h-4"/>}
                                        Upgrade
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(plan.name, billingInterval)}
                                        className={`w-full py-4 rounded-2xl border-2 text-sm font-bold transition-all shadow-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white`}
                                    >
                                        Get Started
                                    </button>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-8 flex-1">
                                <ul className="space-y-4 text-left text-sm text-gray-600 font-medium">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start"><Check className={`w-5 h-5 ${plan.textClass} shrink-0`} /> <span>{f}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- VIEWS ---

const OverviewView: React.FC<{ user: User, licenses: License[], invoices: Invoice[] }> = ({ user, licenses, invoices }) => {
    const activeLicense = licenses[0];
    const daysRemaining = useMemo(() => {
        if (!activeLicense?.validUntil) return null;
        const diff = new Date(activeLicense.validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [activeLicense]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome, {user.name}</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Production Dashboard</p>
                </div>
            </div>
            
            <DashboardTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl group-hover:bg-brand-100 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                             <div className={`p-4 rounded-2xl ${activeLicense?.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-500'}`}>
                                <Zap className="w-8 h-8" />
                             </div>
                             <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                activeLicense?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-700'
                             }`}>
                                {activeLicense?.status || 'No License'}
                             </span>
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Plan</h3>
                        <p className="text-3xl font-black text-gray-900">{activeLicense?.planTier || 'Free'}</p>
                        
                        {activeLicense?.validUntil && (
                             <p className="text-sm text-gray-500 mt-2 font-medium">
                                Valid until {new Date(activeLicense.validUntil).toLocaleDateString()}
                             </p>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                        <div className="text-center">
                            <span className="block text-2xl font-black text-gray-900 leading-none">{daysRemaining ?? 0}</span>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase mt-1">Days left</span>
                        </div>
                        <Link to="/dashboard/subscription" className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-gray-900 text-white text-xs font-black hover:bg-brand-500 transition-all shadow-lg shadow-gray-900/10">
                            Details <ChevronRight className="w-4 h-4"/>
                        </Link>
                    </div>
                </div>

                {/* History Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Invoices</h3>
                        <FileText className="w-5 h-5 text-gray-300" />
                    </div>
                    {invoices.length > 0 ? (
                        <div className="space-y-4 flex-1">
                            {invoices.slice(0, 3).map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                                        <p className="font-black text-gray-900">{inv.amount.toFixed(2)} €</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {inv.status}
                                        </span>
                                        {inv.pdfUrl && inv.pdfUrl !== '#' && (
                                            <a 
                                                href={inv.pdfUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-gray-300 hover:text-brand-500 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-400 italic">
                            <div className="p-4 bg-gray-50 rounded-full mb-4"><CreditCard className="w-10 h-10 opacity-20" /></div>
                            No payments yet.
                        </div>
                    )}
                    <Link to="/dashboard/subscription" className="mt-8 text-center text-xs font-black text-brand-500 uppercase tracking-widest hover:text-brand-600">
                        View Billing History
                    </Link>
                </div>
            </div>
        </div>
    );
};

const SubscriptionView: React.FC<{ user: User, licenses: License[], invoices: Invoice[], refresh: () => void }> = ({ user, licenses, invoices, refresh }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isPolling, setIsPolling] = useState(false);
    const { refreshProfile } = useAuth();

    const activeLicense = licenses[0];
    const hasStripeId = activeLicense?.stripeSubscriptionId && activeLicense.stripeSubscriptionId.startsWith('sub_');

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
                <div className="bg-brand-50 border border-brand-100 text-brand-800 p-8 rounded-3xl mb-12 flex items-center gap-6 animate-pulse">
                    <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
                    <div>
                        <h3 className="font-black text-xl tracking-tight">Syncing Status...</h3>
                        <p className="text-sm font-medium opacity-70">We are synchronizing your account with Stripe. This takes a few seconds.</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 mb-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div>
                        <span className="text-xs font-black text-brand-500 uppercase tracking-[0.2em]">Active Plan</span>
                        <div className="flex items-baseline gap-3 mt-2">
                            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{activeLicense?.planTier || 'Free'}</h2>
                            <span className="text-gray-400 font-bold">/{activeLicense?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
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
                    
                    <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 md:min-w-[280px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Renewal Details</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Valid until</span>
                                <span className="text-gray-900 font-black">{activeLicense?.validUntil ? new Date(activeLicense.validUntil).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Auto-renew</span>
                                <span className={`${activeLicense?.cancelAtPeriodEnd ? 'text-amber-600' : 'text-green-600'} font-black`}>
                                    {activeLicense?.cancelAtPeriodEnd ? 'Off' : 'Active'}
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

const SettingsView: React.FC<{ user: User, licenses: License[], billingAddress: BillingAddress | null, refresh: () => void }> = ({ user, licenses, billingAddress, refresh }) => {
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const activeLicense = licenses[0];
    const hasStripeId = activeLicense?.stripeSubscriptionId && activeLicense.stripeSubscriptionId.startsWith('sub_');

    const handlePortal = async () => {
        setLoadingPortal(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
                body: { returnUrl: `${window.location.origin}/#/dashboard/settings` },
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error(error?.message);
        } catch (e) {
            alert("Payment account not found or Stripe is unreachable.");
        } finally {
            setLoadingPortal(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription? Your access will remain active until the end of the current billing period.")) {
            return;
        }

        setCancelling(true);
        try {
            const { data, error } = await supabase.functions.invoke('cancel-subscription');
            
            if (error) throw error;
            if (data?.success === false) throw new Error(data.error || "Cancellation failed");

            alert("Cancellation requested. Your account status will update once Stripe confirms the change.");
            refresh();
        } catch (err: any) {
            console.error("Cancellation error:", err);
            alert(`Could not cancel subscription: ${err.message}`);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Account Settings</h1>
            <DashboardTabs />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
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
                    
                    <button onClick={handlePortal} disabled={loadingPortal} className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all">
                        {loadingPortal ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                        Update Billing Address
                    </button>
                </div>

                <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-brand-500" /> Payment Methods
                    </h3>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                        Securely manage your credit cards and subscription preferences in the Stripe customer portal.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handlePortal} disabled={loadingPortal} className="w-full py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-black flex items-center justify-center gap-3 hover:bg-gray-100 transition-all">
                            {loadingPortal ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                            Open Portal
                        </button>
                        
                        {hasStripeId && activeLicense?.status === 'active' && !activeLicense.cancelAtPeriodEnd && (
                            <button 
                                onClick={handleCancelSubscription}
                                disabled={cancelling}
                                className="w-full py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50/50 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarMinus className="w-3 h-3" />}
                                Cancel Subscription
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { loading, licenses, invoices, billingAddress, refresh } = useCustomerData(user!);

    if (!user) return <Navigate to="/login" />;
    if (loading) return <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Dashboard</p>
    </div>;

    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<OverviewView user={user} licenses={licenses} invoices={invoices} />} />
                <Route path="subscription" element={<SubscriptionView user={user} licenses={licenses} invoices={invoices} refresh={refresh} />} />
                <Route path="settings" element={<SettingsView user={user} licenses={licenses} billingAddress={billingAddress} refresh={refresh} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};
