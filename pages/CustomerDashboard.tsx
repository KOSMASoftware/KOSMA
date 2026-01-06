import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { License, SubscriptionStatus, Invoice, PlanTier, User, Project } from '../types';
import { Check, Loader2, Download, CreditCard, User as UserIcon, HelpCircle, FileText, Settings, AlertTriangle, Receipt, Phone, LayoutDashboard } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { mockApi } from '../services/mockService';

// --- SHARED COMPONENTS ---

const DashboardTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-12">
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
                <CreditCard className="w-4 h-4" /> Subscription
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // If we are in 'Prototype Bypass Mode' (User ID starts with mock), skip DB and load mocks directly
                if (user.id.startsWith('mock-bypass-')) {
                    throw new Error('PROTOTYPE_MODE'); 
                }

                // 1. Licenses
                let realLicenses: License[] = [];
                const { data: licData, error: licError } = await supabase
                    .from('licenses')
                    .select('*')
                    .eq('user_id', user.id);

                if (licError) throw licError;

                if (licData && licData.length > 0) {
                     realLicenses = licData.map((l: any) => ({
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
                }

                // 2. Invoices
                let realInvoices: Invoice[] = [];
                const { data: invData, error: invError } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                 if (invError) throw invError;

                 if (invData) {
                    realInvoices = invData.map((i: any) => ({
                        id: i.id,
                        date: i.created_at || i.date, 
                        amount: i.amount,
                        status: i.status,
                        pdfUrl: i.invoice_pdf_url || i.pdf_url
                    }));
                 }

                // 3. Projects
                let realProjects: Project[] = [];
                const { data: projData, error: projError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (projError) throw projError;
                
                if (projData) {
                    realProjects = projData.map((p: any) => ({
                        id: p.id,
                        name: p.project_name || p.name, 
                        lastSynced: p.last_synced_at || p.updated_at
                    }));
                }

                setLicenses(realLicenses);
                setInvoices(realInvoices);
                setProjects(realProjects);

            } catch (err: any) {
                // PROTOTYPE FALLBACK: If DB fails (schema error, network), load Mock Data
                const isSchemaError = err.message?.includes('schema') || err.message === 'PROTOTYPE_MODE' || err.code === 'PGRST000';
                
                if (isSchemaError) {
                    console.warn('Dashboard: DB Error or Mock Mode detected. Loading fallback data for prototype.');
                    // Use a default user ID from mock service to get meaningful data
                    const fallbackId = 'u1'; 
                    const mockLic = await mockApi.getLicense(fallbackId);
                    const mockDetails = await mockApi.getUserDetails(fallbackId);
                    
                    if (mockLic) setLicenses([mockLic]);
                    if (mockDetails) {
                        setInvoices(mockDetails.invoices);
                        setProjects(mockDetails.projects);
                    }
                } else {
                    console.error('Error fetching customer data:', err);
                    setError(err.message || 'Failed to load data from Supabase');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    return { loading, licenses, invoices, projects, error };
};


// --- VIEWS ---

const Overview: React.FC<{ user: User }> = ({ user }) => {
    const { loading, licenses, invoices, projects, error } = useCustomerData(user);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand-500" /></div>;

    const activeLicense = licenses.find(l => l.status === SubscriptionStatus.ACTIVE);
    const isMockUser = user.id.startsWith('mock-');

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}</h1>
                <p className="text-gray-500">Manage your KOSMA licenses and billing.</p>
                {isMockUser && (
                    <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                        PROTOTYPE MODE (Offline Data)
                    </span>
                )}
            </div>
            
            <DashboardTabs />

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                        <p className="font-bold">Error loading data</p>
                        <p className="text-sm">{error}</p>
                        <p className="text-xs mt-1">Check database connection or RLS policies.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* License Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <CreditCard className="w-24 h-24 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-brand-500" /> Current License
                    </h3>
                    
                    {activeLicense ? (
                        <div className="space-y-4">
                             <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</span>
                                <p className="text-2xl font-bold text-gray-900">{activeLicense.planTier}</p>
                             </div>
                             <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                        {activeLicense.status}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Renews: {activeLicense.validUntil ? new Date(activeLicense.validUntil).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                             </div>
                             {activeLicense.licenseKey && (
                                 <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-sm text-center">
                                     {activeLicense.licenseKey}
                                 </div>
                             )}
                             {activeLicense.billingProjectName && (
                                 <div className="text-xs text-gray-400 mt-2">
                                     Billing Project: {activeLicense.billingProjectName}
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No active license found.</p>
                            <Link to="/dashboard/subscription" className="text-brand-600 font-bold hover:underline">
                                Purchase a Plan
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Invoices Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                     <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-gray-400" /> Recent Invoices
                    </h3>
                    {invoices.length > 0 ? (
                        <ul className="space-y-3">
                            {invoices.slice(0, 3).map(inv => (
                                <li key={inv.id} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{new Date(inv.date).toLocaleDateString()}</span>
                                        <span className={`text-xs ${inv.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{inv.status}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">€{Number(inv.amount).toFixed(2)}</span>
                                        {inv.pdfUrl && (
                                            <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-brand-500">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center py-8 text-gray-400 text-sm">No invoices found.</div>
                    )}
                </div>
            </div>
            
            {/* Synced Projects List */}
            <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Synced Projects</h3>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-900">{p.name}</span>
                                <span className="text-xs text-gray-500">Synced: {new Date(p.lastSynced).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No projects synced from Desktop App yet.</p>
                )}
            </div>
        </div>
    );
};

const SettingsView: React.FC<{ user: User }> = ({ user }) => {
    const [firstName, setFirstName] = useState(user.name.split(' ')[0]);
    const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') || '');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-500">Edit your personal information</p>
            </div>

            <DashboardTabs />

            <div className="space-y-12">
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                    <form className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-900"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-gray-900"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                            />
                        </div>
                        <button type="button" className="px-6 py-2 bg-brand-500 text-white rounded font-medium opacity-50 cursor-not-allowed">
                            Update Profile (Coming Soon)
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

// Helper Icon
const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);


// --- MAIN DASHBOARD COMPONENT ---

export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<Overview user={user} />} />
                <Route path="subscription" element={<div className="text-center py-20 text-gray-500">Subscription Management Coming Soon (Real Stripe Integration)</div>} />
                <Route path="settings" element={<SettingsView user={user} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
};