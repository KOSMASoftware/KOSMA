
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { License, SubscriptionStatus, Invoice, PlanTier, User, Project, BillingAddress } from '../types';
import { Check, Loader2, Download, CreditCard, User as UserIcon, HelpCircle, FileText, Settings, AlertTriangle, Receipt, Phone, LayoutDashboard, ArrowUpRight, Zap, CheckCircle as LucideCheckCircle, ExternalLink, Globe, MapPin, Building, Briefcase } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { mockApi } from '../services/mockService';
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

// --- DATA HOOK ---
const useCustomerData = (user: User) => {
    const [loading, setLoading] = useState(true);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (user.id.startsWith('mock-bypass-')) {
                    throw new Error('PROTOTYPE_MODE'); 
                }

                // 1. Licenses & Profile
                const { data: licData, error: licError } = await supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id);

                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('billing_address')
                    .eq('id', user.id)
                    .single();

                if (licError) throw licError;
                if (profileData?.billing_address) setBillingAddress(profileData.billing_address);

                if (licData) {
                     setLicenses(licData.map((l: any) => ({
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
                    })));
                }

                // 2. Invoices
                const { data: invData, error: invError } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                 if (invError) throw invError;
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
                const isSchemaError = err.message?.includes('schema') || err.message === 'PROTOTYPE_MODE' || err.code === 'PGRST000';
                if (isSchemaError) {
                    const fallbackId = 'u1'; 
                    const mockLic = await mockApi.getLicense(fallbackId);
                    const mockDetails = await mockApi.getUserDetails(fallbackId);
                    if (mockLic) setLicenses([mockLic]);
                    if (mockDetails) {
                        setInvoices(mockDetails.invoices.map(i => ({...i, currency: 'EUR'})));
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, refreshTrigger]);

    return { loading, licenses, invoices, projects, billingAddress, refresh };
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
            alert("Error saving address. Make sure the 'profiles' table has a 'billing_address' JSONB column.");
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

const SubscriptionView: React.FC<{ user: User }> = ({ user }) => {
    const { loading, licenses, invoices, billingAddress, refresh } = useCustomerData(user);
    const [searchParams, setSearchParams] = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const activeLicense = licenses.find(l => l.status === SubscriptionStatus.ACTIVE);

    useEffect(() => {
        const stripeSuccess = searchParams.get('stripe_success');
        const tier = searchParams.get('tier') as PlanTier;
        const cycle = searchParams.get('cycle') as 'monthly' | 'yearly';
        const rawProjectName = searchParams.get('project_name');
        
        if (stripeSuccess === 'true' && tier && !user.id.startsWith('mock-bypass-')) {
            const updateLicense = async () => {
                setProcessing(true);
                try {
                    // Clean up project name if it's the stripe session placeholder
                    const projectName = (rawProjectName && rawProjectName.startsWith('cs_test')) 
                        ? `Project (Session ${rawProjectName.substring(8, 14)})` 
                        : (rawProjectName || 'New Production');

                    const validUntil = new Date();
                    if (cycle === 'yearly') validUntil.setFullYear(validUntil.getFullYear() + 1);
                    else validUntil.setMonth(validUntil.getMonth() + 1);

                    // License update
                    await supabase
                        .from('licenses')
                        .upsert({
                            user_id: user.id,
                            plan_tier: tier,
                            status: 'active',
                            billing_cycle: cycle,
                            valid_until: validUntil.toISOString(),
                            product_name: 'KOSMA',
                            billing_project_name: projectName,
                            license_key: `KOS-${tier.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
                        }, { onConflict: 'user_id' });

                    // Map price based on cycle and tier
                    let amount = 0;
                    if (tier === PlanTier.BUDGET) amount = cycle === 'yearly' ? 390 : 39;
                    if (tier === PlanTier.COST_CONTROL) amount = cycle === 'yearly' ? 590 : 59;
                    if (tier === PlanTier.PRODUCTION) amount = cycle === 'yearly' ? 690 : 69;

                    // Simulate Invoice creation (In Real Life: Stripe Webhook does this)
                    await supabase.from('invoices').insert({
                        user_id: user.id,
                        amount: amount,
                        status: 'paid',
                        project_name: projectName
                    });

                    setSuccessMessage(true);
                    setSearchParams({}); 
                    refresh();
                } catch (err) {
                    console.error("Success handling failed:", err);
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
                        <p className="text-sm">Your {activeLicense?.planTier} license is now active. The invoice has been generated below.</p>
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
                            <span className="text-sm text-gray-500">{activeLicense?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            {activeLicense?.status === 'active' 
                                ? `Next renewal: ${new Date(activeLicense.validUntil!).toLocaleDateString()}.`
                                : 'You are currently on the free trial tier.'
                            }
                        </p>
                        {activeLicense?.billingProjectName && (
                            <p className="text-xs font-bold text-brand-500 mt-2 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> Project: {activeLicense.billingProjectName}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                         <button className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" /> Change Plan
                         </button>
                         <button className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel Subscription
                         </button>
                    </div>
                </div>

                {/* Billing Address Card */}
                <BillingAddressCard initialAddress={billingAddress} userId={user.id} />
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                <th className="px-6 py-4">Project / Service</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length > 0 ? invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{inv.projectName || 'General Subscription'}</td>
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
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No invoices found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
                <HelpCircle className="w-5 h-5" />
                <p>Need a custom invoice or have billing questions? Contact our support at <a href="mailto:support@kosma.io" className="font-bold underline">support@kosma.io</a></p>
            </div>
        </div>
    );
};

const Overview: React.FC<{ user: User }> = ({ user }) => {
    const { loading, licenses, invoices } = useCustomerData(user);
    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" /></div>;
    const activeLicense = licenses.find(l => l.status === SubscriptionStatus.ACTIVE);

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
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Zap className="w-6 h-6" /></div>
                            <div>
                                <p className="font-bold text-gray-900">{activeLicense.planTier} Plan</p>
                                <p className="text-xs text-gray-500">Valid until {new Date(activeLicense.validUntil!).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No active license.</p>
                    )}
                    <Link to="/dashboard/subscription" className="mt-6 block text-center py-2 border border-gray-200 rounded font-bold text-sm hover:bg-gray-50">Manage</Link>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Invoices</h3>
                    <ul className="space-y-2">
                        {invoices.slice(0, 2).map(inv => (
                            <li key={inv.id} className="text-sm flex justify-between">
                                <span className="text-gray-500">{new Date(inv.date).toLocaleDateString()}</span>
                                <span className="font-bold">{inv.amount} €</span>
                            </li>
                        ))}
                    </ul>
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
