import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../services/mockService';
import { License, SubscriptionStatus, Invoice, PlanTier, User } from '../types';
import { Check, Loader2, Download, CreditCard, User as UserIcon, HelpCircle, FileText, Settings, AlertTriangle, Receipt, Phone } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';

// --- SHARED COMPONENTS ---

const DashboardTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path || (path === '/dashboard' && location.pathname === '/dashboard/');

    const tabs = [
        { path: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
        { path: '/dashboard', label: 'Payment / Receipts', icon: Receipt }, // Mapping Overview to Payment/Receipts based on mockup roughly, or strictly separate
        { path: '/dashboard/settings', label: 'Account settings', icon: Settings },
        { path: '#', label: 'Contact Support', icon: HelpCircle },
    ];

    // Special case: If we are on /dashboard (index), we might want to highlight a specific tab or none if it's a general landing. 
    // Based on mockup, "Welcome {{User}}" is the header for the dashboard.
    // Let's treat /dashboard/subscription as the primary "Subscription" tab.
    
    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-12">
            <Link 
                to="/dashboard/subscription" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/dashboard/subscription' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <CreditCard className="w-4 h-4" /> Subscription
            </Link>
             <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/dashboard' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Receipt className="w-4 h-4" /> Payment / Receipts
            </Link>
            <Link 
                to="/dashboard/settings" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/dashboard/settings' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Settings className="w-4 h-4" /> Account settings
            </Link>
             <a 
                href="#"
                className="flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
                <HelpCircle className="w-4 h-4" /> Contact Support
            </a>
        </div>
    );
};

// --- SUB-COMPONENTS (VIEWS) ---

// 1. SETTINGS VIEW
const SettingsView: React.FC<{ user: User }> = ({ user }) => {
    const [firstName, setFirstName] = useState(user.name.split(' ')[0]);
    const [lastName, setLastName] = useState(user.name.split(' ').slice(1).join(' ') || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleUpdateInfo = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Profile updated successfully (Simulation)");
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Password changed successfully (Simulation)");
        setCurrentPassword('');
        setNewPassword('');
    };

    const handleDeleteAccount = () => {
        if(confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            alert("Account deletion request sent.");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-500">Edit your password and personal information</p>
            </div>

            <DashboardTabs />

            <div className="space-y-12">
                {/* Personal Information */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                    <form onSubmit={handleUpdateInfo} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">First Name</label>
                            <input 
                                type="text" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-gray-900"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Last Name</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-gray-900"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                            <input 
                                type="email" 
                                value={user.email} 
                                disabled
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-white border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors mt-2"
                        >
                            Update info
                        </button>
                    </form>
                </section>

                {/* Change Password */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Current Password</label>
                            <input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">New Password</label>
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-3 bg-white border border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors mt-2"
                        >
                            Save new password
                        </button>
                    </form>
                </section>

                {/* Delete Account */}
                <section className="pt-4">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Delete Account</h3>
                     <p className="text-sm text-gray-600 mb-4">
                        Upon removal, your account becomes unavailable and all the data in it is deleted.
                     </p>
                     <button 
                        type="button"
                        onClick={handleDeleteAccount}
                        className="w-full py-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Delete account
                    </button>
                </section>
            </div>
        </div>
    );
};

// 2. SUBSCRIPTION VIEW
const SubscriptionView: React.FC<{ user: User; license: License | null; onPurchase: (tier: PlanTier) => void; loading: boolean }> = ({ user, license, onPurchase, loading }) => {
  const [interval, setInterval] = useState<'yearly' | 'monthly'>('yearly');
  
  const plans = [
    {
      id: PlanTier.FREE,
      name: "Free",
      price: 0,
      yearlyPrice: 0,
      save: "",
      color: "border-gray-800",
      textColor: "text-gray-800",
      btnText: "Switch to Free",
      features: ["Budgeting Module", "Cost Control Module", "Financing Module"] 
    },
    {
      id: PlanTier.BUDGET,
      name: "Budget",
      price: 39,
      yearlyPrice: 390,
      save: "Save 78€ per year",
      color: "border-yellow-500", 
      textColor: "text-yellow-600",
      btnText: "Switch to Budget",
      features: ["Budgeting Module", "Unlimited Projects", "Share projects"]
    },
    {
      id: PlanTier.COST_CONTROL,
      name: "Cost Control",
      price: 59,
      yearlyPrice: 590,
      save: "Save 238€ per year",
      color: "border-purple-500", 
      textColor: "text-purple-600",
      btnText: "Switch to Cost Control",
      features: ["Budgeting Module", "Cost Control Module", "Unlimited Projects"]
    },
    {
      id: PlanTier.PRODUCTION,
      name: "Production",
      price: 69,
      yearlyPrice: 690,
      save: "Save 378€ per year",
      color: "border-green-500", 
      textColor: "text-green-600",
      btnText: "Switch to Production",
      features: ["Budgeting Module", "Cost Control Module", "Financing Module", "Cashflow Module", "Unlimited Projects"]
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome {user.name}</h1>
        <p className="text-gray-500 mb-6">Make your settings and adjust your license.</p>
        
        <DashboardTabs />
        
        <div className="inline-flex bg-white rounded-full border border-gray-200 p-1 mb-6">
            <button 
              onClick={() => setInterval('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${interval === 'yearly' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Yearly
            </button>
            <button 
              onClick={() => setInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${interval === 'monthly' ? 'bg-brand-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Monthly
            </button>
        </div>
      </div>
      
      {/* Current Subscription Card */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-6 mb-12 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{license?.planTier || 'Free'}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
             <div>
                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Licensed To</span>
                <span className="text-gray-900">{user.email}</span>
             </div>
             <div>
                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Valid From</span>
                <span className="text-gray-900">March 05, 2023</span> {/* Simulation */}
             </div>
             <div>
                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Valid Through</span>
                <span className="text-gray-900">
                    {license?.validUntil ? new Date(license.validUntil).toLocaleDateString() : 'Unlimited'}
                </span>
             </div>
             <div>
                <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Price</span>
                <span className="text-gray-900">
                     {license?.planTier === PlanTier.FREE ? '0€ /month' : 
                      license?.planTier === PlanTier.BUDGET ? '390€ /year' :
                      license?.planTier === PlanTier.COST_CONTROL ? '590€ /year' : '690€ /year'
                     }
                </span>
             </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="block text-gray-500 text-xs uppercase font-bold mb-3">Features</span>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-900"><Check className="w-3 h-3 text-gray-900"/> Budgeting Module</div>
                <div className="flex items-center gap-2 text-sm text-gray-900"><Check className="w-3 h-3 text-gray-900"/> Cost Control Module</div>
                <div className="flex items-center gap-2 text-sm text-gray-900"><Check className="w-3 h-3 text-gray-900"/> Financing Module</div>
                <div className="flex items-center gap-2 text-sm text-gray-900"><Check className="w-3 h-3 text-gray-900"/> Cashflow Module</div>
            </div>
        </div>
      </div>

      <div className="text-left max-w-4xl mx-auto mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Change Subscription</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
         {plans.filter(p => p.id !== PlanTier.FREE).map((plan) => {
             const isCurrent = license?.planTier === plan.id && license.status === SubscriptionStatus.ACTIVE;
             const price = interval === 'yearly' ? Math.round(plan.yearlyPrice) : plan.price;
             const period = interval === 'yearly' ? '/year' : '/month';
             
             return (
                 <div key={plan.id} className={`bg-white rounded-xl border-t-8 ${plan.color} p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-x border-b border-gray-200`}>
                     
                     <h3 className={`font-bold ${plan.textColor} text-xl mb-1`}>{plan.name}</h3>
                     <div className="flex items-baseline gap-1 mb-4">
                         <span className={`text-xl font-bold ${plan.textColor}`}>{price}€</span>
                         <span className={`text-sm ${plan.textColor}`}>{period}</span>
                     </div>

                     <div className="flex justify-center mb-4">
                        <div className="inline-flex rounded-full border border-gray-200 p-0.5 w-full">
                            <span className={`w-1/2 text-center text-[10px] py-1 rounded-full font-bold ${interval === 'yearly' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}>Yearly</span>
                            <span className={`w-1/2 text-center text-[10px] py-1 rounded-full font-bold ${interval === 'monthly' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                        </div>
                     </div>
                     
                     <button
                         onClick={() => onPurchase(plan.id)}
                         disabled={isCurrent || loading}
                         className={`w-full py-2 rounded border font-medium text-sm transition-colors mb-2 ${
                             isCurrent 
                             ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-default'
                             : `bg-white hover:bg-gray-50 ${plan.color.replace('border-t-8', 'border')} ${plan.textColor}`
                         }`}
                     >
                         {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : isCurrent ? 'Current Plan' : plan.btnText}
                     </button>
                     
                     {plan.save && interval === 'yearly' && (
                         <div className="text-center text-xs font-bold text-gray-900">
                             {plan.save}
                         </div>
                     )}
                 </div>
             )
         })}
      </div>
    </div>
  );
};

// 3. OVERVIEW VIEW (Rebranded as "Payment / Receipts" mostly, but keeps overview functionality)
const DashboardOverview: React.FC<{ user: User | null; license: License | null; invoices: Invoice[] }> = ({ user, license, invoices }) => {
    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome {user.name}</h1>
                <p className="text-gray-500 mb-6">Make your settings and adjust your license.</p>
                <DashboardTabs />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Subscription & Status */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoices */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-500" /> Payment / Receipts
                            </h3>
                            <button className="text-sm text-brand-600 hover:underline">View All</button>
                        </div>
                        
                        {invoices.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Amount</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-right">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {invoices.slice(0, 5).map(inv => (
                                            <tr key={inv.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{inv.date}</td>
                                                <td className="px-4 py-3 font-medium">€{inv.amount.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center py-4">No invoices yet.</p>
                        )}
                    </div>

                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-brand-500" /> Current Status
                                </h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                license?.status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                                license?.status === SubscriptionStatus.PAST_DUE ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {license?.status === SubscriptionStatus.ACTIVE ? 'Active' : 
                                 license?.status === SubscriptionStatus.PAST_DUE ? 'Past Due' : 'Inactive'}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 uppercase font-bold">Plan</span>
                                <div className="text-xl font-bold text-gray-900 mt-1">{license?.planTier || 'Free'}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 uppercase font-bold">Next Payment</span>
                                <div className="text-xl font-bold text-gray-900 mt-1">
                                    {license?.validUntil ? new Date(license.validUntil).toLocaleDateString() : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right Col: Account & Support */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                         <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider mb-4">
                            <UserIcon className="w-4 h-4 text-brand-500" /> My Profile
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                                {user?.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <Link to="/dashboard/settings" className="w-full text-left text-sm text-gray-600 hover:text-brand-600 hover:bg-gray-50 px-3 py-2 rounded transition-colors flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Account Settings
                             </Link>
                        </div>
                    </div>

                    <div className="bg-brand-900 text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5" /> Need Help?
                            </h3>
                            <p className="text-sm text-brand-100 mb-4">Check our learning campus for tutorials or contact support.</p>
                            <button className="text-xs font-bold bg-white text-brand-900 px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors">
                                Visit Campus
                            </button>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-brand-800 rounded-full opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export const CustomerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [license, setLicense] = useState<License | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const loadData = async () => {
            setLoading(true);
            try {
                const [lic, inv] = await Promise.all([
                    mockApi.getLicense(user.id),
                    mockApi.getInvoices(user.id)
                ]);
                setLicense(lic || null);
                setInvoices(inv);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [user]);

    const handlePurchase = async (tier: PlanTier) => {
        if (!user) return;
        setPurchaseLoading(true);
        try {
            const updatedLicense = await mockApi.purchaseSubscription(user.id, tier);
            setLicense(updatedLicense);
            // In a real app, this would redirect to Stripe Checkout
            alert(`Successfully upgraded to ${tier}!`);
            navigate('/dashboard'); // Go back to overview
        } catch (error) {
            console.error("Purchase failed", error);
            alert("Something went wrong with the purchase simulation.");
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <Routes>
            <Route index element={<DashboardOverview user={user} license={license} invoices={invoices} />} />
            <Route path="subscription" element={<SubscriptionView user={user} license={license} onPurchase={handlePurchase} loading={purchaseLoading} />} />
            <Route path="settings" element={<SettingsView user={user} />} />
            <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
    );
};