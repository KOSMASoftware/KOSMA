import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, Project, Invoice } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, LineChart } from 'recharts';
import { Users, CreditCard, TrendingUp, Search, X, Download, Monitor, FolderOpen, Calendar, AlertCircle, CheckCircle, Clock, UserX, Mail, ArrowRight, Briefcase, Activity, Server, Database, Shield, Lock, Zap, LayoutDashboard, LineChart as LineChartIcon, ShieldCheck, RefreshCw, AlertTriangle, ChevronUp, ChevronDown, Filter, ArrowUpDown, ExternalLink, Code, Terminal, Copy, Megaphone, Target, ArrowUpRight, CalendarPlus, History, Building, CalendarMinus, Plus, Minus } from 'lucide-react';

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
                const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
                const { data: licData, error: lError } = await supabase.from('licenses').select('*');
                const { data: invData, error: iError } = await supabase.from('invoices').select('amount, status');

                if (pError) console.error("Admin Profiles Error:", pError);
                if (lError) console.error("Admin Licenses Error:", lError);

                let realUsers: User[] = [];
                let realLicenses: License[] = [];
                let realRevenue = 0;

                if (profiles && profiles.length > 0) {
                    realUsers = profiles.map((p: any) => ({
                        id: p.id,
                        email: p.email || 'N/A', 
                        name: p.full_name || 'User', 
                        role: p.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
                        registeredAt: p.created_at || new Date().toISOString(),
                        stripeCustomerId: p.stripe_customer_id,
                        billingAddress: p.billing_address // Mapped for Company Name
                    }));
                }

                if (licData && licData.length > 0) {
                    realLicenses = licData.map((l: any) => {
                        // Logic for ValidUntil: Prefer Admin Override, then Current Period, then basic valid_until
                        const effectiveValidUntil = l.admin_valid_until_override || l.current_period_end || l.valid_until;

                        return {
                            id: l.id,
                            userId: l.user_id,
                            productName: l.product_name,
                            planTier: l.plan_tier as PlanTier,
                            billingCycle: l.billing_cycle || 'none',
                            status: l.status as SubscriptionStatus,
                            validUntil: effectiveValidUntil,
                            licenseKey: l.license_key,
                            billingProjectName: l.billing_project_name,
                            stripeSubscriptionId: l.stripe_subscription_id,
                            stripeCustomerId: l.stripe_customer_id,
                            cancelAtPeriodEnd: l.cancel_at_period_end,
                            canceledAt: l.canceled_at,
                            adminValidUntilOverride: l.admin_valid_until_override,
                            adminOverrideReason: l.admin_override_reason
                        };
                    });
                }

                if (invData && invData.length > 0) {
                     realRevenue = invData
                        .filter((i: any) => i.status === 'paid')
                        .reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
                }

                const active = realLicenses.filter(l => l.status === SubscriptionStatus.ACTIVE || l.status === SubscriptionStatus.TRIAL).length;
                const inactive = realLicenses.filter(l => l.status !== SubscriptionStatus.ACTIVE && l.status !== SubscriptionStatus.TRIAL).length;

                setUsers(realUsers);
                setLicenses(realLicenses);
                setStats({
                    totalUsers: realUsers.length,
                    activeLicenses: active,
                    inactiveLicenses: inactive,
                    revenue: realRevenue
                });

            } catch (err) {
                console.error("Admin Data Critical Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [refreshIndex]);

    return { loading, users, licenses, stats, refreshData };
};

// --- VIEW 1: STRATEGIC OVERVIEW ---
const DashboardOverview: React.FC = () => {
  const { loading, stats, licenses } = useAdminData();
  const navigate = useNavigate();

  const cycleCounts = licenses.reduce((acc, curr) => {
    if (curr.status === SubscriptionStatus.ACTIVE) {
       acc[curr.billingCycle] = (acc[curr.billingCycle] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <div className="p-12 text-center text-gray-500">Loading metrics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminTabs />
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Platform performance and license distribution.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-brand-200 transition-all group"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 text-brand-600 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Registrations</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        
        <div 
          onClick={() => navigate('/admin/users?status=active')}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-green-200 transition-all group"
        >
           <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active / Trial</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeLicenses}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">€{stats.revenue.toLocaleString()}</p>
        </div>

        <div 
          onClick={() => navigate('/admin/marketing')}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group"
        >
           <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <UserX className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-500">Inactive Users</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inactiveLicenses}</p>
        </div>
      </div>
    </div>
  );
};

// --- VIEW 2: USER MANAGEMENT (With Enhanced V2 Logic) ---
type SortKey = 'name' | 'company' | 'planTier' | 'validUntil' | 'daysLeft' | 'status';
type SortDirection = 'asc' | 'desc';

const UsersManagement: React.FC = () => {
  const { user: adminUser } = useAuth();
  const { loading, users, licenses, refreshData } = useAdminData();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'daysLeft', direction: 'asc' });
  
  // Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserLicense, setSelectedUserLicense] = useState<License | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);
  const [modifying, setModifying] = useState(false);

  const calculateDaysLeft = (validUntil: string | null) => {
    if (!validUntil) return -9999;
    
    const valid = new Date(validUntil);
    const now = new Date();
    // Normalize to Start of Day
    const startValid = new Date(valid.getFullYear(), valid.getMonth(), valid.getDate());
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diff = startValid.getTime() - startToday.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const tableData = useMemo(() => {
    return users.map(u => {
        const lic = licenses.find(l => l.userId === u.id);
        const days = calculateDaysLeft(lic?.validUntil || null);
        const company = u.billingAddress?.companyName || '—';

        return {
            user: u,
            license: lic,
            name: u.name,
            email: u.email,
            company: company,
            planTier: lic?.planTier || PlanTier.FREE,
            status: lic?.status || 'none',
            validUntil: lic?.validUntil || null,
            daysLeft: days,
            billingCycle: lic?.billingCycle || 'none',
            project: lic?.billingProjectName || '—',
            stripeId: lic?.stripeSubscriptionId || null
        };
    });
  }, [users, licenses]);

  const processedRows = useMemo(() => {
    let rows = [...tableData];
    
    // Status Filter
    if (statusFilter === 'active') rows = rows.filter(r => r.status === SubscriptionStatus.ACTIVE || r.status === SubscriptionStatus.TRIAL);
    if (statusFilter === 'inactive') rows = rows.filter(r => r.status !== SubscriptionStatus.ACTIVE && r.status !== SubscriptionStatus.TRIAL);
    
    // Plan Filter
    if (planFilter !== 'all') rows = rows.filter(r => r.planTier === planFilter);
    
    // Expiry Filter
    if (expiryFilter !== 'all') {
        const days = parseInt(expiryFilter);
        // Only consider active/trial users for expiration warnings, or anyone if we want to see who expired recently
        rows = rows.filter(r => r.daysLeft >= 0 && r.daysLeft <= days);
    }

    // Search Filter (Name, Email, Company)
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        rows = rows.filter(r => 
            r.name.toLowerCase().includes(lowerTerm) || 
            r.email.toLowerCase().includes(lowerTerm) ||
            r.company.toLowerCase().includes(lowerTerm) ||
            r.project.toLowerCase().includes(lowerTerm)
        );
    }

    // Sorting
    rows.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        // Special sort for daysLeft to handle 'no expiration' better if needed
        if (sortConfig.key === 'daysLeft') {
             // If validUntil is null, treat as infinite? No, here -9999 means expired/none. 
             // Logic is fine for raw numbers.
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return rows;
  }, [tableData, statusFilter, planFilter, expiryFilter, searchTerm, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
      if (sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1 opacity-0 group-hover:opacity-50" />;
      return sortConfig.direction === 'asc' 
        ? <ChevronUp className="w-3 h-3 text-brand-600 ml-1" />
        : <ChevronDown className="w-3 h-3 text-brand-600 ml-1" />;
  };

  // Preview date based on manual adjustment
  const previewNewDate = useMemo(() => {
      if (!selectedUserLicense || !selectedUserLicense.validUntil) return new Date();
      const current = new Date(selectedUserLicense.validUntil);
      current.setDate(current.getDate() + manualAdjustment);
      return current;
  }, [selectedUserLicense, manualAdjustment]);

  const extendLicense = async (days: number) => {
      if (!selectedUser || !selectedUserLicense) return;
      if (!overrideReason.trim()) {
          alert("Please provide a reason for this manual override (required for audit logs).");
          return;
      }

      setModifying(true);
      try {
          // Basis: Current valid date or now
          const currentValid = selectedUserLicense.validUntil ? new Date(selectedUserLicense.validUntil) : new Date();
          const newDate = new Date(currentValid);
          newDate.setDate(newDate.getDate() + days);

          const isoDate = newDate.toISOString();

          // 1. UPDATE LICENSE (Write to admin_valid_until_override)
          const { error: licError } = await supabase.from('licenses').upsert({
              user_id: selectedUser.id,
              admin_valid_until_override: isoDate,
              admin_override_reason: overrideReason,
              admin_override_by: adminUser?.id,
              admin_override_at: new Date().toISOString(),
              status: 'active' // Ensure user has access
          }, { onConflict: 'user_id' });

          if (licError) throw licError;

          // 2. CREATE AUDIT LOG
          const { error: auditError } = await supabase.from('audit_logs').insert({
              actor_user_id: adminUser?.id,
              actor_email: adminUser?.email,
              action: 'ADMIN_OVERRIDE',
              target_user_id: selectedUser.id,
              details: {
                  days_added: days,
                  new_valid_until: isoDate,
                  reason: overrideReason,
                  previous_valid_until: selectedUserLicense.validUntil
              }
          });

          if (auditError) console.error("Audit Log failed", auditError);

          alert(`Override applied. New access valid until: ${newDate.toLocaleDateString()}`);
          setOverrideReason(''); // Reset
          setManualAdjustment(0);
          refreshData(); 
          closeDetails();
      } catch (err) {
          console.error("Extension failed", err);
          alert("Failed to extend license.");
      } finally {
          setModifying(false);
      }
  };

  const handleUserClick = (row: typeof tableData[0]) => {
    setSelectedUser(row.user);
    setSelectedUserLicense(row.license || null);
    setOverrideReason('');
    setManualAdjustment(0);
  };

  const closeDetails = () => {
    setSelectedUser(null);
    setSelectedUserLicense(null);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="relative h-full animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <AdminTabs />
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
           <h1 className="text-2xl font-bold text-gray-900 capitalize">
               {statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'} Users ({processedRows.length})
            </h1>
         </div>
         <div className="bg-white border border-gray-200 p-1 rounded-lg flex">
            <button onClick={() => setSearchParams({})} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === 'all' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>All</button>
            <button onClick={() => setSearchParams({status: 'active'})} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === 'active' ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-gray-500 hover:text-gray-900'}`}>Active</button>
            <button onClick={() => setSearchParams({status: 'inactive'})} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === 'inactive' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-gray-500 hover:text-gray-900'}`}>Inactive</button>
         </div>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col xl:flex-row gap-4 items-center justify-between">
           <div className="relative w-full max-w-lg">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
             <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Company, Email, User..." 
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full bg-white shadow-sm" 
             />
           </div>
           
           <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                <div className="relative flex items-center shrink-0">
                    <Filter className="absolute left-3 w-4 h-4 text-gray-500" />
                    <select 
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-gray-400"
                    >
                        <option value="all">All Plans</option>
                        <option value={PlanTier.FREE}>{PlanTier.FREE}</option>
                        <option value={PlanTier.BUDGET}>{PlanTier.BUDGET}</option>
                        <option value={PlanTier.COST_CONTROL}>{PlanTier.COST_CONTROL}</option>
                        <option value={PlanTier.PRODUCTION}>{PlanTier.PRODUCTION}</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative flex items-center shrink-0">
                    <Clock className="absolute left-3 w-4 h-4 text-gray-500" />
                    <select 
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer shadow-sm hover:border-gray-400"
                    >
                        <option value="all">Any Expiration</option>
                        <option value="7">Expires in 7 days</option>
                        <option value="14">Expires in 14 days</option>
                        <option value="30">Expires in 30 days</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          {processedRows.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
               No users found matching filters.
            </div>
          ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center">User / Email <SortIcon column="name" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('company')}>
                    <div className="flex items-center">Company <SortIcon column="company" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('planTier')}>
                    <div className="flex items-center">Plan <SortIcon column="planTier" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('status')}>
                     <div className="flex items-center">Status <SortIcon column="status" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('validUntil')}>
                     <div className="flex items-center">Valid Until <SortIcon column="validUntil" /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 group select-none" onClick={() => handleSort('daysLeft')}>
                     <div className="flex items-center">Days Left <SortIcon column="daysLeft" /></div>
                </th>
                 <th className="px-6 py-4 text-gray-400">
                     <div className="flex items-center">Details</div>
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedRows.map((row) => (
                <tr key={row.user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{row.user.name}</div>
                    <div className="text-gray-500 text-xs">{row.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {row.company}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white">
                        <div className={`w-2 h-2 rounded-full ${row.planTier === PlanTier.FREE ? 'bg-gray-800' : row.planTier === PlanTier.BUDGET ? 'bg-amber-500' : row.planTier === PlanTier.COST_CONTROL ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                        {row.planTier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.status === SubscriptionStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                      row.status === SubscriptionStatus.TRIAL ? 'bg-blue-100 text-blue-800' :
                      row.status === SubscriptionStatus.PAST_DUE ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.status === SubscriptionStatus.ACTIVE ? 'Active' : row.status === SubscriptionStatus.TRIAL ? 'Trial' : row.status === SubscriptionStatus.PAST_DUE ? 'Past Due' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {row.validUntil ? new Date(row.validUntil).toLocaleDateString() : '—'}
                    {row.license?.adminValidUntilOverride && <span className="ml-1 text-orange-500" title="Admin Override Active">*</span>}
                  </td>
                  <td className="px-6 py-4">
                      {row.daysLeft > -9000 ? (
                        <span className={`font-mono font-bold ${
                            row.daysLeft < 0 ? 'text-red-600' : 
                            row.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                            {row.daysLeft} d
                        </span>
                      ) : (
                          <span className="text-gray-300">—</span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 space-y-1">
                      <div title="Billing Cycle">{row.billingCycle !== 'none' ? row.billingCycle : '-'}</div>
                      <div className="truncate max-w-[120px]" title={row.project}>{row.project}</div>
                      <div className="font-mono text-[10px] text-gray-400" title="Stripe Subscription ID">
                          {row.stripeId ? row.stripeId.substring(0, 12) + '...' : row.status === SubscriptionStatus.ACTIVE ? 'Syncing...' : '-'}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handleUserClick(row)}
                        className="text-brand-600 hover:text-brand-800 font-medium text-xs border border-brand-200 hover:bg-brand-50 px-3 py-1.5 rounded transition-colors"
                    >
                        Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Slide-over Panel for Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeDetails}></div>
           <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
               <button onClick={closeDetails} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
                 <X className="w-5 h-5 text-gray-500" />
               </button>
               
               <div className="mb-8">
                  <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-2xl mb-4">
                      {selectedUser.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  
                  <div className="flex gap-2 mt-4 items-center">
                     <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">{selectedUser.id}</span>
                     {selectedUser.billingAddress?.companyName && (
                         <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                             <Building className="w-3 h-3"/> {selectedUser.billingAddress.companyName}
                         </span>
                     )}
                  </div>
               </div>

               <div className="space-y-8">
                   <section>
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Subscription Details</h3>
                       <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                           <div className="flex justify-between">
                               <span className="text-sm text-gray-500">Plan</span>
                               <span className="font-medium">{selectedUserLicense?.planTier}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-sm text-gray-500">Status</span>
                               <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedUserLicense?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                                   {selectedUserLicense?.status?.toUpperCase()}
                               </span>
                           </div>
                           <div className="flex justify-between items-center">
                               <span className="text-sm text-gray-500">Valid Until</span>
                               <div className="text-right">
                                   <div className="font-medium">{selectedUserLicense?.validUntil ? new Date(selectedUserLicense.validUntil).toLocaleDateString() : 'N/A'}</div>
                                   {selectedUserLicense?.validUntil && (
                                       <div className={`text-xs font-bold ${calculateDaysLeft(selectedUserLicense.validUntil) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                           {calculateDaysLeft(selectedUserLicense.validUntil)} days left
                                       </div>
                                   )}
                               </div>
                           </div>
                           {selectedUserLicense?.adminValidUntilOverride && (
                               <div className="flex justify-between bg-orange-50 p-2 rounded border border-orange-100 mt-2">
                                   <span className="text-sm text-orange-700 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Admin Override</span>
                                   <span className="text-xs text-orange-600 italic">{selectedUserLicense.adminOverrideReason || 'No reason provided'}</span>
                               </div>
                           )}
                           {selectedUserLicense?.billingProjectName && (
                               <div className="flex justify-between">
                                   <span className="text-sm text-gray-500">Billing Project</span>
                                   <span className="font-medium">{selectedUserLicense.billingProjectName}</span>
                               </div>
                           )}
                           <div className="flex justify-between">
                               <span className="text-sm text-gray-500">Stripe ID</span>
                               <span className="font-mono text-xs">{selectedUserLicense?.stripeSubscriptionId || 'N/A'}</span>
                           </div>
                       </div>
                   </section>

                   <section>
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Admin Actions</h3>
                       <p className="text-xs text-gray-500 mb-4">Manual override of license validity. Writes to audit logs.</p>
                       
                       <div className="space-y-4">
                           <div className="space-y-1">
                               <label className="text-xs font-bold text-gray-500">Reason for Override (Required)</label>
                               <input 
                                    type="text" 
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    placeholder="e.g. Good will extension, Payment issue fix..."
                                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                               />
                           </div>

                           <div className="flex flex-col gap-2">
                               <label className="text-xs font-bold text-gray-500">Quick Adjustments (Days)</label>
                               <div className="grid grid-cols-4 gap-2">
                                   <button onClick={() => setManualAdjustment(prev => prev - 7)} className="py-2 bg-gray-50 border border-gray-200 rounded text-xs font-bold hover:bg-gray-100">-7</button>
                                   <button onClick={() => setManualAdjustment(prev => prev - 1)} className="py-2 bg-gray-50 border border-gray-200 rounded text-xs font-bold hover:bg-gray-100">-1</button>
                                   <button onClick={() => setManualAdjustment(prev => prev + 1)} className="py-2 bg-gray-50 border border-gray-200 rounded text-xs font-bold hover:bg-gray-100">+1</button>
                                   <button onClick={() => setManualAdjustment(prev => prev + 7)} className="py-2 bg-gray-50 border border-gray-200 rounded text-xs font-bold hover:bg-gray-100">+7</button>
                               </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                    onClick={() => { setManualAdjustment(14); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-xs transition-colors"
                               >
                                   <CalendarPlus className="w-3 h-3 text-green-600" />
                                   Set +14 Days
                               </button>
                               
                               <button 
                                    onClick={() => { setManualAdjustment(30); }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-xs transition-colors"
                               >
                                   <CalendarPlus className="w-3 h-3 text-green-600" />
                                   Set +30 Days
                               </button>
                           </div>

                           <div className="pt-2 border-t border-gray-100 mt-2">
                               <label className="text-xs font-bold text-gray-500 mb-1 block">Total Adjustment (Days)</label>
                               <div className="flex gap-2">
                                   <input 
                                        type="number" 
                                        value={manualAdjustment}
                                        onChange={(e) => setManualAdjustment(parseInt(e.target.value) || 0)}
                                        className="w-24 p-2 border border-gray-300 rounded text-sm font-mono text-center"
                                   />
                                   <div className="flex-1 flex flex-col justify-center text-xs text-gray-500">
                                       <span>New Date Preview:</span>
                                       <span className="font-bold text-gray-900">{previewNewDate.toLocaleDateString()}</span>
                                   </div>
                               </div>
                           </div>
                           
                           <button 
                                onClick={() => extendLicense(manualAdjustment)}
                                disabled={modifying || manualAdjustment === 0}
                                className="w-full py-3 bg-brand-600 text-white rounded-lg font-bold text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                           >
                               Apply Override
                           </button>

                           {/* MANUAL FIX PLACEHOLDER */}
                           <div className="pt-4 border-t border-gray-100">
                                <button className="w-full py-2 bg-gray-50 text-gray-400 border border-dashed border-gray-300 rounded text-xs hover:bg-gray-100 hover:text-gray-600 transition-colors flex items-center justify-center gap-2">
                                    <History className="w-3 h-3"/> View Audit Logs (Future Feature)
                                </button>
                           </div>
                       </div>
                   </section>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
// ... rest of the file (SystemHealth, MarketingInsights, Main Component) stays the same
const SystemHealth: React.FC = () => {
    const [statuses, setStatuses] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    const runChecks = async () => {
        setLoading(true);
        setStatuses([]); 
        
        const results = await Promise.all([
            liveSystemService.checkDatabaseConnection(),
            liveSystemService.checkAuthService(),
            liveSystemService.checkStripe(),
            liveSystemService.checkEmail(),
            liveSystemService.checkRealtime()
        ]);

        setStatuses(results);
        setLastChecked(new Date());
        setLoading(false);
    };

    useEffect(() => {
        runChecks();
    }, []);

    const overallStatus = statuses.every(s => s.status === 'operational') ? 'operational' : statuses.some(s => s.status === 'down') ? 'down' : 'degraded';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <AdminTabs />
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
                    <p className="text-gray-500">Live monitoring of system components and external APIs.</p>
                </div>
                <button 
                    onClick={runChecks} 
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Checks
                </button>
            </div>

            {/* Overall Status Banner */}
            <div className={`p-6 rounded-xl border flex items-center gap-6 ${
                overallStatus === 'operational' ? 'bg-green-50 border-green-200' : 
                overallStatus === 'down' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
                 <div className={`p-4 rounded-full ${
                     overallStatus === 'operational' ? 'bg-green-100 text-green-600' : 
                     overallStatus === 'down' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                 }`}>
                     <Activity className="w-8 h-8" />
                 </div>
                 <div>
                     <h2 className={`text-xl font-bold ${
                         overallStatus === 'operational' ? 'text-green-900' : 
                         overallStatus === 'down' ? 'text-red-900' : 'text-yellow-900'
                     }`}>
                         {overallStatus === 'operational' ? 'All Systems Operational' : overallStatus === 'down' ? 'System Critical' : 'Partially Degraded'}
                     </h2>
                     <p className="text-sm opacity-80 mt-1">
                         Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
                     </p>
                 </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {statuses.map((status, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-lg ${
                                status.status === 'operational' ? 'bg-green-50 text-green-600' : 
                                status.status === 'configuring' ? 'bg-blue-50 text-blue-600' :
                                'bg-red-50 text-red-600'
                            }`}>
                                {status.service.includes('DB') ? <Database className="w-5 h-5"/> : 
                                 status.service.includes('Stripe') ? <CreditCard className="w-5 h-5"/> :
                                 status.service.includes('Auth') ? <Lock className="w-5 h-5"/> :
                                 <Server className="w-5 h-5"/>}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{status.service}</h3>
                                {status.message && <p className="text-sm text-gray-500 font-medium">{status.message}</p>}
                                {status.details && (
                                    <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-600 font-mono whitespace-pre-wrap">
                                        {status.details}
                                    </div>
                                )}
                                {status.actionLink && (
                                    <a href={status.actionLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                                        Open Supabase Settings <ExternalLink className="w-3 h-3"/>
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                status.status === 'operational' ? 'bg-green-100 text-green-800' : 
                                status.status === 'configuring' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {status.status.toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1">
                                <Clock className="w-3 h-3" /> {status.latency}ms
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarketingInsights: React.FC = () => {
    const { loading, users, licenses } = useAdminData();

    // 1. Growth Data
    const growthData = useMemo(() => {
        const monthCounts: Record<string, number> = {};
        users.forEach(u => {
            const date = new Date(u.registeredAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthCounts[key] = (monthCounts[key] || 0) + 1;
        });

        const sortedKeys = Object.keys(monthCounts).sort();
        let cumulative = 0;
        return sortedKeys.map(key => {
            cumulative += monthCounts[key];
            return {
                name: key,
                newUsers: monthCounts[key],
                totalUsers: cumulative
            };
        });
    }, [users]);

    // 2. Metrics
    const metrics = useMemo(() => {
        const total = users.length || 1;
        const active = licenses.filter(l => l.status === SubscriptionStatus.ACTIVE).length;
        const churned = licenses.filter(l => l.status === SubscriptionStatus.CANCELED).length;
        
        let totalRevenue = 0;
        licenses.forEach(l => {
             if (l.status === SubscriptionStatus.ACTIVE) {
                 if (l.planTier === PlanTier.BUDGET) totalRevenue += 39; 
                 if (l.planTier === PlanTier.COST_CONTROL) totalRevenue += 59;
                 if (l.planTier === PlanTier.PRODUCTION) totalRevenue += 69;
             }
        });
        const arpu = active > 0 ? (totalRevenue / active).toFixed(2) : "0.00";

        return {
            churnRate: ((churned / total) * 100).toFixed(1),
            conversionRate: ((active / total) * 100).toFixed(1),
            arpu: arpu
        };
    }, [users, licenses]);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading insights...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <AdminTabs />
            
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketing Insights</h1>
                    <p className="text-gray-500">Growth trends and actionable customer segments.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">Estimated Monthly Revenue</div>
                    <div className="text-2xl font-bold text-gray-900">~€{(parseFloat(metrics.arpu) * parseInt(metrics.conversionRate) / 100 * users.length).toFixed(0)}</div>
                </div>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-brand-600 rounded">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Avg. Revenue / User</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">€{metrics.arpu}</div>
                    <p className="text-xs text-green-600 flex items-center mt-2">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Based on active plans
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded">
                            <Target className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{metrics.conversionRate}%</div>
                    <p className="text-xs text-gray-400 mt-2">
                        Active Users / Total Signups
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded">
                            <UserX className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Churn Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{metrics.churnRate}%</div>
                    <p className="text-xs text-orange-600 mt-2">
                        Canceled subscriptions
                    </p>
                </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">User Acquisition Growth</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0093D0" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#0093D0" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickMargin={10} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="totalUsers" stroke="#0093D0" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route index element={<DashboardOverview />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="marketing" element={<MarketingInsights />} />
      <Route path="system" element={<SystemHealth />} />
    </Routes>
  );
};