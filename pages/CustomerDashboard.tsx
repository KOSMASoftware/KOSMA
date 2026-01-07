
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { License, SubscriptionStatus, Invoice, PlanTier, User, BillingAddress } from '../types';
import { Loader2, Download, CreditCard, FileText, Settings, Zap, CheckCircle as LucideCheckCircle, Briefcase, LayoutDashboard, Building, Check, Calculator, BarChart3, Clapperboard } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { STRIPE_LINKS } from '../config/stripe';

// --- SHARED COMPONENTS ---

const DashboardTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8">
             <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard')
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
            <Link 
                to="/dashboard/subscription" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard/subscription') 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <CreditCard className="w-4 h-4" /> Subscription & Invoices
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard/settings') 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Settings className="w-4 h-4" /> Account settings
            </Link>
        </div>
    );
};

// --- DATA HOOK (STRICT SUPABASE MODE) ---
const useCustomerData = (user: User) => {
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchData = async (retryCount = 0) => {
            if (retryCount === 0) setLoading(true);
            try {
                // 1. Licenses & Profile
                const { data: licData, error: licError } = await supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id);

                if (licError) console.error("License Fetch Error:", licError);
                
                // RETRY LOGIC
                if ((!licData || licData.length === 0) && retryCount < 3) {
                     await new Promise(r => setTimeout(r, 600)); 
                     return fetchData(retryCount + 1);
                }

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
                        validUntil: l.valid_until,
                        licenseKey: l.license_key,
                        billingProjectName: l.billing_project_name,
                        stripeSubscriptionId: l.stripe_subscription_id
                    }));

                    const priority = {
                        [SubscriptionStatus.ACTIVE]: 1,
                        [SubscriptionStatus.TRIAL]: 2,
                        [SubscriptionStatus.PAST_DUE]: 3,
                        [SubscriptionStatus.CANCELED]: 4,
                        [SubscriptionStatus.NONE]: 5
                    };

                    mappedLicenses.sort((a, b) => {
                        const pA = priority[a.status] || 99;
                        const pB = priority[b.status] || 99;
                        return pA - pB;
                    });

                    setLicenses(mappedLicenses);
                } else {
                    setLicenses([{
                        id: 'temp', userId: user.id, productName: 'KOSMA', 
                        planTier: PlanTier.FREE, billingCycle: 'none', 
                        status: SubscriptionStatus.NONE, validUntil: null, 
                        licenseKey: null 
                    }]);
                }

                // 2. Invoices
                const { data: invData } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                 if (invData) {
                    setInvoices(invData.map((i: any) => ({
                        id: i.id,
                        date: i.created_at, 
                        amount: i.amount,
                        currency: 'EUR',
                        status: i.status,
                        pdfUrl: i.invoice_pdf_url,
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


// --- VIEWS ---

const BillingAddressCard: React.FC<{ initialAddress: BillingAddress | null, userId: string }> = ({ initialAddress, userId }) => {
    const [isEditing, setIsEditing] = useState(!initialAddress);
    const [address, setAddress] = useState<BillingAddress>(initialAddress || { street: '', city: '', zip: '', country: 'Germany' });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ billing_address: address })
                .eq('id', userId);
            if (error) throw error;
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Error saving address.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-400" /> Billing Address
                </h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-brand-500 hover:underline">
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <input 
                        className="w-full p-2 border border-gray-200 rounded text-sm" 
                        placeholder="Company Name (Optional)" 
                        value={address.companyName || ''} 
                        onChange={e => setAddress({...address, companyName: e.target.value})}
                    />
                    <input 
                        className="w-full p-2 border border-gray-200 rounded text-sm" 
                        placeholder="VAT ID / USt-IdNr (Optional)" 
                        value={address.vatId || ''} 
                        onChange={e => setAddress({...address, vatId: e.target.value})}
                    />
                    <input 
                        className="w-full p-2 border border-gray-200 rounded text-sm" 
                        placeholder="Street & House Number" 
                        value={address.street} 
                        onChange={e => setAddress({...address, street: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            className="p-2 border border-gray-200 rounded text-sm" 
                            placeholder="ZIP" 
                            value={address.zip} 
                            onChange={e => setAddress({...address, zip: e.target.value})}
                        />
                        <input 
                            className="p-2 border border-gray-200 rounded text-sm" 
                            placeholder="City" 
                            value={address.city} 
                            onChange={e => setAddress({...address, city: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full py-2 bg-gray-900 text-white rounded font-bold text-sm flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Details'}
                    </button>
                </div>
            ) : (
                <div className="text-sm text-gray-600 space-y-1">
                    {address.companyName && <p className="font-bold text-gray-900">{address.companyName}</p>}
                    {address.vatId && <p className="text-xs text-gray-400 mb-2">VAT: {address.vatId}</p>}
                    <p>{address.street}</p>
                    <p>{address.zip} {address.city}</p>
                    <p>{address.country}</p>
                </div>
            )}
        </div>
    );
};

// Helper to determine Hierarchy: Free < Budget < Cost Control < Production
const getTierLevel = (tier: PlanTier) => {
    switch (tier) {
        case PlanTier.FREE: return 0;
        case PlanTier.BUDGET: return 1;
        case PlanTier.COST_CONTROL: return 2;
        case PlanTier.PRODUCTION: return 3;
        default: return 0;
    }
};

// FIX 1: Normalize Helper to avoid "none" / null comparisons causing logic bugs
const normalizeCycle = (c: any): 'monthly' | 'yearly' | 'none' =>
  (c === 'monthly' || c === 'yearly') ? c : 'none';

// FIX 2: Explicit Key Mapping for Stripe Config
const getStripeKey = (t: PlanTier): string | null => {
    if (t === PlanTier.BUDGET) return 'Budget';
    if (t === PlanTier.COST_CONTROL) return 'Cost Control';
    if (t === PlanTier.PRODUCTION) return 'Production';
    return null;
};

const PricingSection: React.FC<{ currentTier: PlanTier, currentCycle: string }> = ({ currentTier, currentCycle }) => {
    
    // Normalize logic immediately
    const normalizedCurrentCycle = normalizeCycle(currentCycle);

    // Initialize State - Default to 'yearly' if no paid cycle is active, otherwise sync.
    const [billingInterval, setBillingInterval] = useState<'yearly' | 'monthly'>(
        normalizedCurrentCycle === 'none' ? 'yearly' : normalizedCurrentCycle
    );

    // Sync state if props change (data loaded)
    useEffect(() => {
        if (normalizedCurrentCycle !== 'none') {
            setBillingInterval(normalizedCurrentCycle);
        }
    }, [normalizedCurrentCycle]);

    // FIX 3: Safe Stripe Link Lookup with Debugging
    const handlePurchase = (planName: PlanTier, cycle: 'yearly' | 'monthly') => {
        try {
            const key = getStripeKey(planName);
            
            if (!key) {
                console.error(`[Stripe] Invalid PlanTier: ${planName}`);
                alert("Invalid plan selected.");
                return;
            }

            // Explicit cast not needed if we access via string key, but good for TS
            const link = STRIPE_LINKS[key as keyof typeof STRIPE_LINKS]?.[cycle];
            
            console.log(`[Stripe] Redirecting: Tier=${planName} Key=${key} Cycle=${cycle} Link=${link}`);

            if (!link) {
                console.error(`[Stripe] Missing link configuration`);
                alert("Payment link configuration missing. Please contact support.");
                return;
            }

            // FIX 4: Store Pending Purchase for robust return flow (if URL params missing)
            sessionStorage.setItem('pending_purchase', JSON.stringify({ tier: planName, cycle: cycle }));

            // HARD REDIRECT
            window.location.href = link;
        } catch (e) {
            console.error("Redirect failed:", e);
            alert("Something went wrong initializing the checkout. Please try again.");
        }
    };

    const handleDowngrade = () => {
        alert("Dein Downgrade wird zum Ende deiner aktuellen Laufzeit wirksam. Bitte kontaktiere den Support, um dies einzurichten.");
    };

    const plans = [
        {
          name: PlanTier.BUDGET,
          title: "Budget",
          Icon: Calculator,
          subtitle: "For production managers focused on budget creation.",
          price: billingInterval === 'yearly' ? 390 : 39,
          colorClass: "border-amber-500",
          textClass: "text-amber-500",
          btnClass: "border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100",
          save: billingInterval === 'yearly' ? 78 : null,
          features: ["Budgeting Module", "Unlimited Projects", "Share Projects"]
        },
        {
          name: PlanTier.COST_CONTROL,
          title: "Cost Control",
          Icon: BarChart3,
          subtitle: "For production managers monitoring production costs.",
          price: billingInterval === 'yearly' ? 590 : 59,
          colorClass: "border-purple-600",
          textClass: "text-purple-600",
          btnClass: "border-purple-600 text-purple-700 bg-purple-50 hover:bg-purple-100",
          save: billingInterval === 'yearly' ? 238 : null,
          features: ["Budgeting Module", "Cost Control Module", "Share projects"]
        },
        {
          name: PlanTier.PRODUCTION,
          title: "Production",
          Icon: Clapperboard,
          subtitle: "For producers seeking full project control.",
          price: billingInterval === 'yearly' ? 690 : 69,
          colorClass: "border-green-600",
          textClass: "text-green-600",
          btnClass: "border-green-600 text-green-700 bg-green-50 hover:bg-green-100",
          save: billingInterval === 'yearly' ? 378 : null,
          features: ["All Modules Included", "Financing & Cashflow", "Full Control"]
        }
    ];

    const currentLevel = getTierLevel(currentTier);

    return (
        <div className="mt-16 border-t border-gray-100 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">Change Subscription</h3>
                    <p className="text-gray-500 mt-1">Upgrade or downgrade your license instantly.</p>
                </div>
                {/* TOGGLE: Updates local state to show correct prices */}
                <div className="inline-flex bg-gray-100 rounded-full p-1">
                    <button onClick={() => setBillingInterval('yearly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingInterval === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Yearly</button>
                    <button onClick={() => setBillingInterval('monthly')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingInterval === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Monthly</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const planLevel = getTierLevel(plan.name);
                    
                    // Logic Definition
                    const isSameTier = plan.name === currentTier;
                    
                    // Use Normalized Cycle for logic: Only true if actual cycle matches selected cycle AND isn't 'none'
                    const isSameCycle = normalizedCurrentCycle !== 'none' && billingInterval === normalizedCurrentCycle;
                    
                    // Case A: Active Plan (Same Tier + Same Cycle + Valid Cycle) -> DISABLED
                    const isCurrentActive = normalizedCurrentCycle !== 'none' && isSameTier && isSameCycle;

                    // Case B: Cycle Switch (Same Tier + Diff Cycle) -> PURCHASE (Stripe)
                    // Allowed even if tier is same, as long as cycle is different OR current is 'none'
                    const isCycleSwitch = isSameTier && (!isSameCycle || normalizedCurrentCycle === 'none');

                    // Case C: Upgrade (Higher Tier) -> PURCHASE (Stripe)
                    const isUpgrade = planLevel > currentLevel;

                    // Case D: Downgrade (Lower Tier) -> ALERT
                    const isDowngrade = planLevel < currentLevel;
                    
                    // Button Label Logic
                    let btnLabel = "Select";
                    if (isCurrentActive) btnLabel = "Active Plan";
                    else if (isCycleSwitch && normalizedCurrentCycle !== 'none') btnLabel = `Switch to ${billingInterval === 'yearly' ? 'Yearly' : 'Monthly'}`;
                    else if (isUpgrade) btnLabel = `Upgrade to ${plan.title}`;
                    else if (isDowngrade) btnLabel = `Downgrade to ${plan.title}`;

                    return (
                        <div key={plan.name} className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 border-t-[8px] ${plan.colorClass} p-8 flex flex-col text-center transform transition-all hover:shadow-xl`}>
                            {isCurrentActive && (
                                <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    CURRENT
                                </div>
                            )}
                            
                            <h4 className={`text-2xl font-bold ${plan.textClass} mb-4`}>{plan.title}</h4>
                            
                            <div className="flex justify-center mb-6">
                                <plan.Icon className={`w-12 h-12 ${plan.textClass} opacity-90`} />
                            </div>

                            <div className="mb-2">
                                <span className={`text-4xl font-bold ${plan.textClass}`}>{plan.price}€</span>
                                <span className="text-sm text-gray-400">/{billingInterval === 'yearly' ? 'year' : 'month'}</span>
                            </div>

                            <div className="h-6 mb-8">
                                {plan.save && (
                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                        Save {plan.save}€ per year
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (isDowngrade) handleDowngrade();
                                    else handlePurchase(plan.name, billingInterval); // IMPORTANT: Pass the SELECTED cycle
                                }}
                                disabled={isCurrentActive}
                                className={`w-full py-3 rounded-lg border-2 text-sm font-bold transition-all mb-8 ${
                                    isCurrentActive
                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                                    : isDowngrade
                                        ? 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700' // Downgrade Grey
                                        : `${plan.btnClass}` // Upgrade/Switch Colored
                                }`}
                            >
                                {btnLabel}
                            </button>

                            <div className="border-t border-gray-100 pt-6 flex-1">
                                <ul className="space-y-3 text-left text-sm text-gray-600">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <Check className={`w-4 h-4 ${plan.textClass} shrink-0 mt-0.5`} /> 
                                            <span className="leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
             <p className="text-center text-xs text-gray-400 mt-8">
                All payments are processed securely via Stripe. You can cancel your subscription at any time.
            </p>
        </div>
    );
};

const SubscriptionView: React.FC<{ user: User }> = ({ user }) => {
    const { loading, licenses, invoices, billingAddress, refresh } = useCustomerData(user);
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const activeLicense = licenses[0];

    useEffect(() => {
        // REGEL: Webhook Simulation (SECURE PRODUCTION MODE)
        const stripeSuccess = searchParams.get('stripe_success');
        const checkoutStatus = searchParams.get('checkout'); // Support checkout=success
        const isSuccess = stripeSuccess === 'true' || checkoutStatus === 'success';

        let tier = searchParams.get('tier') as PlanTier;
        let cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
        const rawProjectName = searchParams.get('project_name');
        
        // RECOVERY FROM SESSION STORAGE (Falls Stripe keine Params liefert)
        if (isSuccess && (!tier || !cycle)) {
             try {
                const stored = sessionStorage.getItem('pending_purchase');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    tier = parsed.tier;
                    cycle = parsed.cycle;
                    console.log("Recovered purchase info from session:", tier, cycle);
                }
             } catch(e) { console.error("Session recovery failed", e); }
        }

        // HARDENED RETURN FLOW:
        // If we still miss tier or cycle after recovery attempt, stop here.
        if (isSuccess && (!tier || !cycle)) {
             console.warn("Detected success param but missing tier/cycle info. Cannot activate.");
             return;
        }

        if (isSuccess && tier && cycle) {
            const updateLicense = async () => {
                setProcessing(true);
                try {
                    const projectName = (rawProjectName && rawProjectName.startsWith('cs_test')) 
                        ? `Project (Session ${rawProjectName.substring(8, 14)})` 
                        : (rawProjectName || 'New Production');

                    // AUFRUF DER SECURE EDGE FUNCTION
                    // Rule: No userId in body. Authentication via JWT is handled automatically by invoke if user is logged in.
                    const { data, error } = await supabase.functions.invoke('dynamic-endpoint', {
                        body: {
                            tier: tier,
                            cycle: cycle,
                            projectName: projectName
                        }
                    });

                    if (error) throw error;

                    // Clean up
                    sessionStorage.removeItem('pending_purchase');
                    setSuccessMessage(true);
                    setSearchParams({}); // Clean URL
                    refresh(); // Reload Data from DB
                } catch (err) {
                    console.error("Success handling failed via Edge Function:", err);
                    // alert("Activation failed. Please contact support if your payment was processed.");
                } finally {
                    setProcessing(false);
                }
            };
            updateLicense();
        }
    }, [searchParams, user.id]);

    if (loading || processing) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" /></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
                <p className="text-gray-500">Manage your active licenses, invoices, and billing details.</p>
            </div>

            <DashboardTabs />

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl mb-12 flex items-center gap-4 animate-in zoom-in-95">
                    <LucideCheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                        <h3 className="font-bold text-lg">Thank you! Your payment was successful.</h3>
                        <p className="text-sm">Your {activeLicense?.planTier} license is now active.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Active Plan Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Plan</h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-gray-900">{activeLicense?.planTier || 'Free'}</span>
                            {activeLicense?.status === SubscriptionStatus.ACTIVE && (
                                <span className="text-sm text-gray-500">{activeLicense?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                            )}
                        </div>
                        <div className="mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                activeLicense?.status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                                activeLicense?.status === SubscriptionStatus.TRIAL ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {activeLicense?.status === SubscriptionStatus.ACTIVE ? 'Active Subscription' :
                                 activeLicense?.status === SubscriptionStatus.TRIAL ? 'Free Trial' : 'Free Tier'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {activeLicense?.validUntil 
                                ? `Valid until: ${new Date(activeLicense.validUntil).toLocaleDateString()}`
                                : 'No expiry date.'
                            }
                        </p>
                        {activeLicense?.billingProjectName && (
                            <p className="text-xs font-bold text-brand-500 mt-2 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> Project: {activeLicense.billingProjectName}
                            </p>
                        )}
                    </div>
                    
                    {activeLicense?.status === SubscriptionStatus.ACTIVE && (
                        <button 
                             onClick={() => alert("Please contact support to cancel your subscription. It will remain active until the end of the billing period.")}
                             className="px-6 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                        >
                           Cancel Subscription
                        </button>
                    )}
                </div>

                {/* Billing Address Card */}
                <BillingAddressCard initialAddress={billingAddress} userId={user.id} />
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" /> Invoice History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length > 0 ? invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold">{inv.amount.toFixed(2)} {inv.currency}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {inv.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-500 hover:text-brand-700 font-bold flex items-center gap-1 ml-auto">
                                            <Download className="w-4 h-4" /> PDF
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        No invoices found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PRICING SELECTION (Integrated Here) */}
            <PricingSection 
                currentTier={activeLicense?.planTier || PlanTier.FREE} 
                currentCycle={activeLicense?.billingCycle || 'none'}
            />
            
            <div className="h-20"></div>
        </div>
    );
};

const Overview: React.FC<{ user: User }> = ({ user }) => {
    const { loading, licenses, invoices } = useCustomerData(user);
    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" /></div>;
    
    // Sortierung ist im Hook erledigt.
    const activeLicense = licenses[0];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}</h1>
                <p className="text-gray-500">Your production hub.</p>
            </div>
            <DashboardTabs />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">License Status</h3>
                    {activeLicense ? (
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${activeLicense.status === SubscriptionStatus.TRIAL ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{activeLicense.planTier} Plan</p>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
                                    {activeLicense.status}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {activeLicense.validUntil ? `Valid until ${new Date(activeLicense.validUntil).toLocaleDateString()}` : 'No expiration'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No active license.</p>
                    )}
                    <Link to="/dashboard/subscription" className="mt-6 block text-center py-2 bg-brand-500 text-white rounded font-bold text-sm hover:bg-brand-600 transition-colors">
                        {activeLicense?.status === SubscriptionStatus.TRIAL ? 'Upgrade Now' : 'Manage Subscription'}
                    </Link>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Invoices</h3>
                    {invoices.length > 0 ? (
                        <ul className="space-y-2">
                            {invoices.slice(0, 2).map(inv => (
                                <li key={inv.id} className="text-sm flex justify-between">
                                    <span className="text-gray-500">{new Date(inv.date).toLocaleDateString()}</span>
                                    <span className="font-bold">{inv.amount} €</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-400">No invoices yet.</p>
                    )}
                    <Link to="/dashboard/subscription" className="mt-6 block text-center py-2 border border-gray-200 rounded font-bold text-sm hover:bg-gray-50">View All</Link>
                </div>
            </div>
        </div>
    );
};

export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<Overview user={user} />} />
                <Route path="subscription" element={<SubscriptionView user={user} />} />
                <Route path="settings" element={<div className="text-center py-20 text-gray-500">Account settings view</div>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};
