
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
                const { data: profiles } = await supabase.from('profiles').select('*');
                const { data: licData } = await supabase.from('licenses').select('*');
                const { data: invData } = await supabase.from('invoices').select('amount, status');

                let realUsers: User[] = [];
                let realLicenses: License[] = [];
                let realRevenue = 0;

                if (profiles) {
                    realUsers = profiles.map((p: any) => ({
                        id: p.id, email: p.email || 'N/A', name: p.full_name || 'User', role: p.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
                        registeredAt: p.created_at || new Date().toISOString(), stripeCustomerId: p.stripe_customer_id, billingAddress: p.billing_address
                    }));
                }
                if (licData) {
                    realLicenses = licData.map((l: any) => ({
                        id: l.id, userId: l.user_id, productName: l.product_name, planTier: l.plan_tier as PlanTier, billingCycle: l.billing_cycle || 'none',
                        status: l.status as SubscriptionStatus, validUntil: l.admin_valid_until_override || l.current_period_end || l.valid_until,
                        licenseKey: l.license_key, billingProjectName: l.billing_project_name, stripeSubscriptionId: l.stripe_subscription_id,
                        stripeCustomerId: l.stripe_customer_id, cancelAtPeriodEnd: l.cancel_at_period_end, adminValidUntilOverride: l.admin_valid_until_override, adminOverrideReason: l.admin_override_reason
                    }));
                }
                if (invData) {
                     realRevenue = invData.filter((i: any) => i.status === 'paid').reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
                }

                setUsers(realUsers);
                setLicenses(realLicenses);
                setStats({ totalUsers: realUsers.length, activeLicenses: realLicenses.filter(l => l.status === SubscriptionStatus.ACTIVE).length, inactiveLicenses: realLicenses.filter(l => l.status !== SubscriptionStatus.ACTIVE).length, revenue: realRevenue });
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchAll();
    }, [refreshIndex]);
    return { loading, users, licenses, stats, refreshData };
};

// --- VIEW 1-4 PLACEHOLDERS (To keep file small, in real app these are full components) ---
const DashboardOverview: React.FC = () => { const { stats } = useAdminData(); return <div className="p-8 text-center text-gray-500">Overview Stats: {stats.totalUsers} Users</div>; };
const UsersManagement: React.FC = () => { const { users } = useAdminData(); return <div className="p-8 text-center text-gray-500">User List: {users.length} Users</div>; };
const MarketingInsights: React.FC = () => { return <div className="p-8 text-center text-gray-500">Marketing Charts</div>; };
const SystemHealthView: React.FC = () => { return <div className="p-8 text-center text-gray-500">System Health Checks</div>; };


// --- VIEW 5: DEBUG VIEW (ENHANCED) ---
const DebugView: React.FC = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [authLogs, setAuthLogs] = useState<any[]>([]);
    const [authLogsError, setAuthLogsError] = useState<string | null>(null);
    const [auditLogsError, setAuditLogsError] = useState<string | null>(null);
    const [logFilter, setLogFilter] = useState<'all' | 'edge' | 'system'>('all');
    const [activeTab, setActiveTab] = useState<'stripe' | 'logs' | 'auth'>('logs');
    const [loading, setLoading] = useState(false);
    const [copying, setCopying] = useState(false);

    const refresh = async () => {
        setLoading(true);
        setAuthLogsError(null);
        setAuditLogsError(null);

        // 1. Stripe Events (Limit 10 as requested)
        const { data: eData } = await supabase
            .from('stripe_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        // 2. Audit Logs (Limit 10 as requested)
        // This table 'audit_logs' must be created by the SQL script below for Edge Functions to write to it.
        let logQuery = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (logFilter === 'edge') {
            logQuery = logQuery.ilike('action', 'EDGE_%');
        }

        const { data: lData, error: lError } = await logQuery;

        // 3. Auth Logs (Limit 10 as requested)
        // Requires View 'auth_logs_view'
        const { data: aData, error: aError } = await supabase
            .from('auth_logs_view' as any)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (eData) setEvents(eData);
        if (lData) setLogs(lData);
        if (aData) setAuthLogs(aData);
        
        // Error Handling
        if (aError) {
             if (aError.code === '42P01') setAuthLogsError("MISSING_VIEW");
             else setAuthLogsError(aError.message);
        }
        if (lError) {
             if (lError.code === '42P01') setAuditLogsError("MISSING_TABLE");
             else setAuditLogsError(lError.message);
        }

        setLoading(false);
    };

    const handleCopyAll = async () => {
        setCopying(true);
        const dump = {
            timestamp: new Date().toISOString(),
            environment: 'production',
            currentUser: user?.email,
            data: { stripeEvents: events, systemLogs: logs, authLogs: authLogs }
        };
        try {
            await navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
            setTimeout(() => setCopying(false), 2000);
        } catch (err) { setCopying(false); }
    };

    useEffect(() => { refresh(); }, [logFilter]);

    const getBadgeClass = (count: number) => 
        count > 0 ? "bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold" : "hidden";

    // --- SQL SETUP HELP ---
    const showSqlHelp = authLogsError === "MISSING_VIEW" || auditLogsError === "MISSING_TABLE" || (logs.length === 0 && authLogs.length === 0 && events.length === 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <AdminTabs />
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 mb-2">Debug Console</h1>
                   <p className="text-gray-500">Live view of the last 10 events from System, Edge Functions & Auth.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleCopyAll} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50">
                         {copying ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>} Copy All
                    </button>
                    <button onClick={refresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg text-sm font-bold hover:bg-gray-800">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* SQL SETUP INSTRUCTION BOX (Visible if data missing) */}
            {showSqlHelp && !loading && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-sm text-amber-900">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Database className="w-5 h-5"/> Database Setup Required</h3>
                    <p className="mb-4">
                        Supabase logs are secure by default. To make them visible here, you must run this SQL script once in your Supabase Dashboard.
                    </p>
                    <div className="bg-white border border-amber-300 rounded p-4 font-mono text-xs overflow-x-auto text-gray-600 select-all">
<pre>{`-- 1. Create Audit Logs Table (for Edge Functions)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  action text not null,
  actor_email text,
  target_user_id text,
  details jsonb,
  is_error boolean default false
);
alter table public.audit_logs enable row level security;
create policy "Admins can view audit logs" on public.audit_logs for select to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Service role can insert audit logs" on public.audit_logs for insert to service_role with check (true);

-- 2. Create Auth Logs View (for Native Supabase Auth Events)
create or replace view public.auth_logs_view as
  select id, created_at, payload->>'action' as action, payload->>'actor_email' as email, payload, payload->>'type' as type
  from auth.audit_log_entries
  order by created_at desc;
grant select on public.auth_logs_view to authenticated;
grant select on public.auth_logs_view to service_role;`}</pre>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <a href="https://supabase.com/dashboard/project/_/sql/new" target="_blank" rel="noreferrer" className="bg-amber-100 text-amber-800 px-4 py-2 rounded font-bold hover:bg-amber-200 inline-flex items-center gap-2">
                            Open Supabase SQL Editor <ExternalLink className="w-4 h-4"/>
                        </a>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-purple-500 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <Activity className="w-4 h-4"/> Edge & System Logs 
                    <span className={getBadgeClass(logs.length)}>{logs.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('auth')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'auth' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <Key className="w-4 h-4"/> Auth Logs
                    <span className={getBadgeClass(authLogs.length)}>{authLogs.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('stripe')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'stripe' ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    <CreditCard className="w-4 h-4"/> Stripe Events
                    <span className={getBadgeClass(events.length)}>{events.length}</span>
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
                         {auditLogsError ? (
                             <div className="p-12 text-center text-red-500">Error: Table 'audit_logs' is missing. Run SQL above.</div>
                         ) : logs.length === 0 ? (
                             <div className="p-12 text-center text-gray-400">No logs found yet. Run an action to generate logs.</div>
                         ) : (
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

                 {/* TAB: AUTH LOGS */}
                 {activeTab === 'auth' && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between">
                         <span>Authentication Events (auth.audit_log_entries)</span>
                     </div>
                     
                     {authLogsError ? (
                         <div className="p-12 text-center text-amber-500">
                            {authLogsError === "MISSING_VIEW" ? "View 'auth_logs_view' is missing. Run SQL above." : `Error: ${authLogsError}`}
                         </div>
                     ) : (
                        <div className="overflow-y-auto max-h-[600px]">
                             {authLogs.length === 0 ? <div className="p-12 text-center text-gray-400">No auth logs found.</div> : (
                                 <div className="divide-y divide-gray-100">
                                     {authLogs.map((log: any) => (
                                         <div key={log.id} className="p-4 hover:bg-gray-50 text-sm">
                                             <div className="flex justify-between items-start mb-1">
                                                 <span className="font-bold text-gray-900">{log.action || log.type}</span>
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
