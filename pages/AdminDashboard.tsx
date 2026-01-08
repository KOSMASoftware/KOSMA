
import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, Project, Invoice } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, LineChart } from 'recharts';
import { Users, CreditCard, TrendingUp, Search, X, Download, Monitor, FolderOpen, Calendar, AlertCircle, CheckCircle, Clock, UserX, Mail, ArrowRight, Briefcase, Activity, Server, Database, Shield, Lock, Zap, LayoutDashboard, LineChart as LineChartIcon, ShieldCheck, RefreshCw, AlertTriangle, ChevronUp, ChevronDown, Filter, ArrowUpDown, ExternalLink, Code, Terminal, Copy, Megaphone, Target, ArrowUpRight, CalendarPlus, History, Building, CalendarMinus, Plus, Minus, Check, Bug, Key, Globe, Info } from 'lucide-react';

const TIER_COLORS = {
  [PlanTier.FREE]: '#1F2937',
  [PlanTier.BUDGET]: '#F59E0B',
  [PlanTier.COST_CONTROL]: '#A855F7',
  [PlanTier.PRODUCTION]: '#22C55E'
};

const CYCLE_COLORS = {
  'yearly': '#0ea5e9',
  'monthly': '#64748b',
  'none': '#e2e8f0'
};

// --- SHARED ADMIN COMPONENTS ---

const AdminTabs = () => {
    const location = useLocation();
    
    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 pt-2">
            <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/admin' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
             <Link 
                to="/admin/users" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/admin/users' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <ShieldCheck className="w-4 h-4" /> Users & Licenses
            </Link>
            <Link 
                to="/admin/marketing" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/admin/marketing' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <LineChartIcon className="w-4 h-4" /> Marketing
            </Link>
             <Link 
                to="/admin/system" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/admin/system' 
                    ? 'border-brand-500 text-brand-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Server className="w-4 h-4" /> System
            </Link>
            <Link 
                to="/admin/debug" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === '/admin/debug' 
                    ? 'border-brand-500 text-brand-600 bg-brand-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
                <Bug className="w-4 h-4" /> Debug
            </Link>
        </div>
    );
};

// --- DATA FETCHING HELPER ---
const useAdminData = () => {
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
                // Fetch profiles (Users)
                const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
                if (pError) throw pError;

                // Fetch licenses
                const { data: licData, error: lError } = await supabase.from('licenses').select('*');
                if (lError) throw lError;

                // Fetch invoices (Revenue)
                const { data: invData, error: iError } = await supabase.from('invoices').select('amount, status');
                if (iError) throw iError;

                // Process Users
                const realUsers: User[] = profiles.map((p: any) => ({
                    id: p.id,
                    email: p.email || 'N/A',
                    name: p.full_name || 'User',
                    role: p.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
                    registeredAt: p.created_at || new Date().toISOString(),
                    stripeCustomerId: p.stripe_customer_id,
                    billingAddress: p.billing_address
                }));

                // Process Licenses
                const realLicenses: License[] = licData.map((l: any) => ({
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
                    adminValidUntilOverride: l.admin_valid_until_override,
                    adminOverrideReason: l.admin_override_reason
                }));

                // Calculate Stats
                const realRevenue = invData
                    .filter((i: any) => i.status === 'paid')
                    .reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

                setUsers(realUsers);
                setLicenses(realLicenses);
                setStats({
                    totalUsers: realUsers.length,
                    activeLicenses: realLicenses.filter(l => l.status === SubscriptionStatus.ACTIVE).length,
                    inactiveLicenses: realLicenses.filter(l => l.status !== SubscriptionStatus.ACTIVE).length,
                    revenue: realRevenue
                });
            } catch (err) {
                console.error("Admin Data Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [refreshIndex]);

    return { loading, users, licenses, stats, refreshData };
};

// --- VIEW 1: OVERVIEW ---
const DashboardOverview: React.FC = () => {
    const { loading, stats, users } = useAdminData();

    // Mock growth data (since we don't track historical user counts in DB efficiently for this prototype)
    const data = [
      { name: 'Jan', users: Math.floor(stats.totalUsers * 0.2) },
      { name: 'Feb', users: Math.floor(stats.totalUsers * 0.35) },
      { name: 'Mar', users: Math.floor(stats.totalUsers * 0.45) },
      { name: 'Apr', users: Math.floor(stats.totalUsers * 0.6) },
      { name: 'May', users: Math.floor(stats.totalUsers * 0.75) },
      { name: 'Jun', users: Math.floor(stats.totalUsers * 0.9) },
      { name: 'Jul', users: stats.totalUsers },
    ];

    if (loading) return <div className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Licenses</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeLicenses}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue (Est.)</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.revenue.toFixed(2)} €</h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Churn / Inactive</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.inactiveLicenses}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-6">User Growth (Mock)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0093D0" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#0093D0" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="users" stroke="#0093D0" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// --- VIEW 2: USERS MANAGEMENT ---
const UsersManagement: React.FC = () => {
    const { loading, users, licenses } = useAdminData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.stripeCustomerId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLicenseForUser = (userId: string) => licenses.find(l => l.userId === userId);

    if (loading) return <div className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTabs />
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Current Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Stripe ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => {
                                const license = getLicenseForUser(user.id);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                                user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {license ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-brand-600">{license.planTier}</span>
                                                    {license.billingCycle !== 'none' && (
                                                        <span className="text-xs text-gray-400">({license.billingCycle})</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">No license</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {license ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    license.status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                                    license.status === SubscriptionStatus.TRIAL ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {license.status}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {user.stripeCustomerId || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- VIEW 3: MARKETING INSIGHTS ---
const MarketingInsights: React.FC = () => {
    const { loading, licenses } = useAdminData();

    // Prepare Pie Data
    const tierData = [
        { name: PlanTier.FREE, value: 0 },
        { name: PlanTier.BUDGET, value: 0 },
        { name: PlanTier.COST_CONTROL, value: 0 },
        { name: PlanTier.PRODUCTION, value: 0 },
    ];

    licenses.forEach(l => {
        const idx = tierData.findIndex(t => t.name === l.planTier);
        if (idx > -1) tierData[idx].value++;
    });

    // Prepare Cycle Data
    const cycleData = [
        { name: 'Yearly', value: licenses.filter(l => l.billingCycle === 'yearly').length },
        { name: 'Monthly', value: licenses.filter(l => l.billingCycle === 'monthly').length },
    ];

    if (loading) return <div className="p-8 text-center"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 mb-4 w-full text-left">Plan Distribution</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={tierData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {tierData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name as PlanTier]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 mb-4 w-full text-left">Billing Preferences</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cycleData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#0093D0" radius={[4, 4, 0, 0]} barSize={50}>
                                    {cycleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CYCLE_COLORS[entry.name.toLowerCase() as keyof typeof CYCLE_COLORS] || '#0093D0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- VIEW 4: SYSTEM HEALTH ---
const SystemHealthView: React.FC = () => {
    const [checks, setChecks] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(true);

    const runChecks = async () => {
        setLoading(true);
        const results = await Promise.all([
            liveSystemService.checkDatabaseConnection(),
            liveSystemService.checkAuthService(),
            liveSystemService.checkRealtime(),
            liveSystemService.checkStripe(),
            liveSystemService.checkEmail()
        ]);
        setChecks(results);
        setLoading(false);
    };

    useEffect(() => { runChecks(); }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <AdminTabs />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Status</h3>
                    <p className="text-sm text-gray-500">Real-time operational checks.</p>
                </div>
                <button onClick={runChecks} disabled={loading} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {checks.map((check, idx) => (
                        <div key={idx} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                            <div className={`p-2 rounded-lg shrink-0 ${
                                check.status === 'operational' ? 'bg-green-50 text-green-600' :
                                check.status === 'degraded' ? 'bg-orange-50 text-orange-600' :
                                'bg-red-50 text-red-600'
                            }`}>
                                {check.status === 'operational' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900">{check.service}</h4>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                        check.status === 'operational' ? 'bg-green-100 text-green-700' : 
                                        check.status === 'configuring' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {check.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {check.latency}ms</span>
                                </div>
                                {check.details && (
                                    <div className="mt-3 text-xs font-mono bg-gray-900 text-gray-300 p-3 rounded-lg whitespace-pre-wrap">
                                        {check.details}
                                    </div>
                                )}
                                {check.actionLink && (
                                    <a href={check.actionLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline">
                                        Fix Issue <ExternalLink className="w-3 h-3"/>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    {!loading && checks.length === 0 && (
                        <div className="p-8 text-center text-gray-400">Initializing checks...</div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- VIEW 5: DEBUG VIEW (ENHANCED) ---
const DebugView: React.FC = () => {
    const { user } = useAuth(); // Access current user for debug info
    const [events, setEvents] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [authLogs, setAuthLogs] = useState<any[]>([]);
    const [authLogsError, setAuthLogsError] = useState<string | null>(null);
    const [logFilter, setLogFilter] = useState<'all' | 'edge' | 'system'>('all');
    const [activeTab, setActiveTab] = useState<'stripe' | 'logs' | 'auth'>('logs');
    const [loading, setLoading] = useState(false);
    const [copying, setCopying] = useState(false);

    const refresh = async () => {
        setLoading(true);
        setAuthLogsError(null);

        // 1. Stripe Events
        const { data: eData } = await supabase
            .from('stripe_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        // 2. Audit Logs (System & Edge)
        let logQuery = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        
        // Filter logic for specific view
        if (logFilter === 'edge') {
            logQuery = logQuery.ilike('action', 'EDGE_%');
        }

        const { data: lData } = await logQuery;

        // 3. Auth Logs (Attempt to fetch from View)
        // NOTE: This requires the SQL View `auth_logs_view` to be created in Supabase.
        const { data: aData, error: aError } = await supabase
            .from('auth_logs_view' as any) // Cast to avoid TS error on non-generated type
            .select('*')
            .limit(20);

        if (eData) setEvents(eData);
        if (lData) setLogs(lData);
        if (aData) setAuthLogs(aData);
        
        // Handle case where view doesn't exist (typical in new projects)
        if (aError) {
             if (aError.code === '42P01') { // Undefined Table
                 setAuthLogsError("MISSING_VIEW");
             } else {
                 setAuthLogsError(aError.message);
             }
        }

        setLoading(false);
    };

    const handleCopyAll = async () => {
        setCopying(true);
        const dump = {
            timestamp: new Date().toISOString(),
            environment: 'production', // Or dynamic if available
            currentUser: user?.email,
            stats: {
                stripeEventsCount: events.length,
                systemLogsCount: logs.length,
                authLogsCount: authLogs.length
            },
            data: {
                stripeEvents: events,
                systemLogs: logs,
                authLogs: authLogs
            }
        };

        try {
            await navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
            setTimeout(() => setCopying(false), 2000);
        } catch (err) {
            console.error("Copy failed", err);
            setCopying(false);
        }
    };

    useEffect(() => { refresh(); }, [logFilter]);

    // Helpers for badges
    const getBadgeClass = (count: number) => 
        count > 0 ? "bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold" : "hidden";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <AdminTabs />
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 mb-2">Debug Console</h1>
                   <p className="text-gray-500">Inspect server events, edge function logs, and authentication trails.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleCopyAll}
                        disabled={loading} 
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                    >
                         {copying ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                         {copying ? 'Copied!' : 'Copy All'}
                    </button>
                    <button onClick={refresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* DEBUG USER INFO BOX */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-900 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold mb-1">Your Access Status</h4>
                    <p>Logged in as: <span className="font-mono bg-blue-100 px-1 rounded">{user?.email}</span></p>
                    <p>Detected Role: <span className="font-mono bg-blue-100 px-1 rounded uppercase font-bold">{user?.role}</span></p>
                    <p className="text-xs text-blue-600 mt-1">UUID: {user?.id}</p>
                    {user?.role !== 'admin' && (
                        <div className="mt-2 text-red-600 font-bold text-xs bg-red-50 p-2 border border-red-100 rounded">
                            ⚠️ Warning: You are not recognized as 'admin'. Logs are hidden by RLS policies. Run the SQL update to fix this.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-purple-500 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <Activity className="w-4 h-4"/> System & Edge Logs 
                    <span className={getBadgeClass(logs.length)}>{logs.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('stripe')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'stripe' ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <CreditCard className="w-4 h-4"/> Stripe Webhooks
                    <span className={getBadgeClass(events.length)}>{events.length}</span>
                </button>
                 <button 
                    onClick={() => setActiveTab('auth')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'auth' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <Key className="w-4 h-4"/> Authentication
                    <span className={getBadgeClass(authLogs.length)}>{authLogs.length}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                 {/* TAB: SYSTEM & EDGE LOGS */}
                 {activeTab === 'logs' && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <span>Application Logs (audit_logs)</span>
                            <div className="flex gap-1 ml-4 text-[10px]">
                                <button onClick={() => setLogFilter('all')} className={`px-2 py-0.5 rounded border ${logFilter === 'all' ? 'bg-white border-gray-300 shadow-sm' : 'border-transparent text-gray-500'}`}>All</button>
                                <button onClick={() => setLogFilter('edge')} className={`px-2 py-0.5 rounded border ${logFilter === 'edge' ? 'bg-white border-gray-300 shadow-sm' : 'border-transparent text-gray-500'}`}>Edge Only</button>
                            </div>
                         </div>
                     </div>
                     <div className="overflow-y-auto max-h-[600px]">
                         {logs.length === 0 ? <div className="p-12 text-center text-gray-400">No logs found yet.</div> : (
                             <div className="divide-y divide-gray-100">
                                 {logs.map(log => {
                                     const isEdge = log.action.startsWith('EDGE_');
                                     const isError = log.details?.is_error;
                                     return (
                                     <div key={log.id} className="p-4 hover:bg-gray-50 text-sm group">
                                         <div className="flex justify-between items-start mb-1">
                                             <div className="flex items-center gap-2">
                                                 {isEdge ? <Globe className="w-4 h-4 text-purple-500"/> : <Database className="w-4 h-4 text-gray-400"/>}
                                                 <span className={`font-mono font-bold ${isError ? 'text-red-600' : isEdge ? 'text-purple-700' : 'text-gray-800'}`}>
                                                     {log.action}
                                                 </span>
                                             </div>
                                             <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                         </div>
                                         <div className="text-xs text-gray-500 mb-2 pl-6">Actor: {log.actor_email || 'System'}</div>
                                         <div className="pl-6">
                                            <pre className={`text-[10px] p-2 rounded overflow-x-auto border ${isError ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                         </div>
                                     </div>
                                 )})}
                             </div>
                         )}
                     </div>
                 </div>
                 )}

                 {/* TAB: STRIPE EVENTS */}
                 {activeTab === 'stripe' && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700">
                         <span>Stripe Webhooks (stripe_events)</span>
                     </div>
                     <div className="overflow-y-auto max-h-[600px]">
                         {events.length === 0 ? <div className="p-12 text-center text-gray-400">No events found yet.</div> : (
                             <div className="divide-y divide-gray-100">
                                 {events.map(ev => (
                                     <div key={ev.id} className="p-4 hover:bg-gray-50 text-sm">
                                         <div className="flex justify-between items-start mb-1">
                                             <span className="font-mono font-bold text-brand-600">{ev.type}</span>
                                             <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${ev.processing_error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                 {ev.processing_error ? 'ERROR' : 'OK'}
                                             </span>
                                         </div>
                                         <div className="text-xs text-gray-500 mb-2">{new Date(ev.created_at).toLocaleString()}</div>
                                         <pre className="text-[10px] bg-gray-900 text-gray-300 p-2 rounded overflow-x-auto">
                                             {JSON.stringify(ev.payload, null, 2)}
                                         </pre>
                                         {ev.processing_error && (
                                              <div className="mt-2 text-xs text-red-600 font-mono bg-red-50 p-2 rounded border border-red-100">
                                                  Error: {ev.processing_error}
                                              </div>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 </div>
                 )}

                 {/* TAB: AUTH LOGS */}
                 {activeTab === 'auth' && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between">
                         <span>Authentication Events (auth.audit_log_entries)</span>
                     </div>
                     
                     {authLogsError === "MISSING_VIEW" ? (
                         <div className="p-8 bg-amber-50 text-amber-800 text-sm">
                             <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> SQL Setup Required</h3>
                             <p className="mb-4">To view internal Supabase Auth logs, you must create a secure View in your database.</p>
                             <div className="bg-white p-4 rounded border border-amber-200 font-mono text-xs overflow-x-auto">
                                 <code className="block text-gray-600">-- Run this in Supabase SQL Editor:</code>
                                 <code className="block text-purple-700 font-bold">create or replace view public.auth_logs_view as</code>
                                 <code className="block text-purple-700 font-bold">select id, created_at, payload-&gt;&gt;'action' as action, payload-&gt;&gt;'actor_email' as email, payload</code>
                                 <code className="block text-purple-700 font-bold">from auth.audit_log_entries order by created_at desc;</code>
                                 <code className="block text-purple-700 font-bold mt-2">grant select on public.auth_logs_view to service_role;</code>
                                 <code className="block text-purple-700 font-bold mt-2">grant select on public.auth_logs_view to authenticated;</code>
                             </div>
                         </div>
                     ) : authLogsError ? (
                         <div className="p-8 text-center text-red-500">Error fetching auth logs: {authLogsError}</div>
                     ) : (
                        <div className="overflow-y-auto max-h-[600px]">
                             {authLogs.length === 0 ? <div className="p-12 text-center text-gray-400">No auth logs found.</div> : (
                                 <div className="divide-y divide-gray-100">
                                     {authLogs.map((log: any) => (
                                         <div key={log.id} className="p-4 hover:bg-gray-50 text-sm">
                                             <div className="flex justify-between items-start mb-1">
                                                 <span className="font-bold text-gray-900">{log.action}</span>
                                                 <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                             </div>
                                             <div className="text-xs text-gray-500 mb-2">User: {log.email || 'N/A'}</div>
                                             <pre className="text-[10px] bg-gray-50 text-gray-600 p-2 rounded overflow-x-auto border border-gray-200">
                                                 {JSON.stringify(log.payload, null, 2)}
                                             </pre>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                     )}
                 </div>
                 )}
            </div>
        </div>
    );
};

// --- MAIN ROUTING COMPONENT ---
export const AdminDashboard: React.FC = () => {
    return (
        <div className="pb-20">
            <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="marketing" element={<MarketingInsights />} />
                <Route path="system" element={<SystemHealthView />} />
                <Route path="debug" element={<DebugView />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </div>
    );
};
