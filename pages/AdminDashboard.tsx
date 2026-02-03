
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { mockApi } from '../services/mockService';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { User, License, PlanTier, SubscriptionStatus } from '../types';
import { 
  Search, AlertTriangle, CheckCircle, XCircle, 
  Activity, LayoutDashboard, Users, RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';

// --- COMPONENTS ---

const AdminTabs = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-wrap justify-start border-b border-gray-200 mb-8 bg-white/50 backdrop-blur-md sticky top-0 z-10 -mx-4 md:mx-0 px-4">
             <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/admin')
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link 
                to="/admin/users" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/admin/users') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <Users className="w-4 h-4" /> Users & Licenses
            </Link>
            <Link 
                to="/admin/system" 
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                    isActive('/admin/system') 
                    ? 'border-brand-500 text-brand-600 translate-y-[1px]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
                <Activity className="w-4 h-4" /> System Health
            </Link>
        </div>
    );
};

const DashboardHome = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        mockApi.getAdminData().then(data => setStats(data.stats));
    }, []);

    if (!stats) return <div className="p-8 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Admin Dashboard</h1>
            <AdminTabs />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-4xl font-black text-gray-900">{stats.totalUsers}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Licenses</h3>
                    <p className="text-4xl font-black text-green-600">{stats.activeLicenses}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Inactive</h3>
                    <p className="text-4xl font-black text-gray-400">{stats.inactiveLicenses}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Revenue (Mock)</h3>
                    <p className="text-4xl font-black text-gray-900">{stats.revenue.toLocaleString()} €</p>
                </Card>
            </div>
        </div>
    );
};

const UsersView = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [engagementFilter, setEngagementFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');

    useEffect(() => {
        mockApi.getAdminData().then(data => {
            setUsers(data.users);
            setLicenses(data.licenses);
            setLoading(false);
        });
    }, []);

    // Filter-Logic
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const lic = licenses.find(l => l.userId === u.id);
            const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                                 u.name.toLowerCase().includes(search.toLowerCase()) || 
                                 (u.billingAddress?.companyName || '').toLowerCase().includes(search.toLowerCase());
            
            const matchesTier = tierFilter === 'all' || lic?.planTier === tierFilter;
            
            // Updated Status Filter Logic
            const matchesStatus = statusFilter === 'all' || (() => {
                if (lic?.status !== statusFilter) return false;
                
                // For active and trial, ensure the date is valid and in the future
                if (statusFilter === 'active' || statusFilter === 'trial') {
                    if (!lic?.validUntil) return false;
                    
                    // Requirement: validUntil >= today (UTC start of day)
                    const validUntilDate = new Date(lic.validUntil);
                    const now = new Date();
                    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                    
                    return validUntilDate.getTime() >= todayUTC.getTime();
                }
                
                // For past_due or canceled, we don't check date expiry strictly for the filter match
                // (Requirement: past_due, canceled: immer anzeigen)
                return true;
            })();
            
            const isEngaged = !!u.lastLoginAt;
            const matchesEngagement = engagementFilter === 'all' || 
                                     (engagementFilter === 'engaged' && isEngaged) || 
                                     (engagementFilter === 'inactive' && !isEngaged);
            
            const matchesCompany = companyFilter === 'all' || u.billingAddress?.companyName === companyFilter;

            return matchesSearch && matchesTier && matchesStatus && matchesEngagement && matchesCompany;
        });
    }, [users, licenses, search, tierFilter, statusFilter, engagementFilter, companyFilter]);

    if (loading) return <div className="p-8 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Users & Licenses</h1>
            <AdminTabs />
            
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="p-2 rounded-xl border border-gray-200 text-sm">
                    <option value="all">All Tiers</option>
                    {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 rounded-xl border border-gray-200 text-sm">
                    <option value="all">All Statuses</option>
                    {Object.values(SubscriptionStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={engagementFilter} onChange={e => setEngagementFilter(e.target.value)} className="p-2 rounded-xl border border-gray-200 text-sm">
                    <option value="all">All Engagement</option>
                    <option value="engaged">Active (Logged in)</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Valid Until</th>
                            <th className="px-6 py-4">Last Login</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => {
                            const lic = licenses.find(l => l.userId === user.id);
                            return (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{user.name}</div>
                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                        {user.billingAddress?.companyName && (
                                            <div className="text-brand-600 text-[10px] font-bold uppercase mt-1">{user.billingAddress.companyName}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{lic?.planTier || 'Free'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                            lic?.status === 'active' ? 'bg-green-100 text-green-700' : 
                                            lic?.status === 'past_due' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {lic?.status || 'None'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {lic?.validUntil ? new Date(lic.validUntil).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No users found matching filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SystemHealthView = () => {
    const [checks, setChecks] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(false);

    const runChecks = async () => {
        setLoading(true);
        const results = await Promise.all([
            liveSystemService.checkDatabaseConnection(),
            liveSystemService.checkAuthService(),
            liveSystemService.checkEdgeFunctionService('Stripe', 'stripe'),
            liveSystemService.checkEdgeFunctionService('Email', 'email')
        ]);
        setChecks(results);
        setLoading(false);
    };

    useEffect(() => {
        runChecks();
    }, []);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-gray-900">System Health</h1>
                <button onClick={runChecks} disabled={loading} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-500 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {checks.map((check, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                            check.status === 'operational' ? 'bg-green-50 text-green-600' : 
                            check.status === 'degraded' ? 'bg-amber-50 text-amber-600' : 
                            'bg-red-50 text-red-600'
                        }`}>
                            {check.status === 'operational' ? <CheckCircle className="w-6 h-6" /> : 
                             check.status === 'degraded' ? <AlertTriangle className="w-6 h-6" /> : 
                             <XCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900">{check.service}</h3>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                    check.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>{check.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{check.details || check.message || 'No details'}</p>
                            <div className="text-xs font-mono text-gray-400">Latency: {check.latency}ms</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    return (
        <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UsersView />} />
            <Route path="system" element={<SystemHealthView />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};
