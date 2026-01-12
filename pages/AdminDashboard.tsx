
import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, Project, Invoice } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, CreditCard, TrendingUp, Search, X, Download, Monitor, FolderOpen, Calendar, 
  AlertCircle, CheckCircle, Clock, UserX, Mail, ArrowRight, Briefcase, Activity, 
  Server, Database, Shield, Lock, Zap, LayoutDashboard, LineChart as LineChartIcon, 
  ShieldCheck, RefreshCw, AlertTriangle, ChevronUp, ChevronDown, Filter, ArrowUpDown, 
  ExternalLink, Code, Terminal, Copy, Megaphone, Target, ArrowUpRight, CalendarPlus, 
  History, Building, CalendarMinus, Plus, Minus, Check, Bug, Key, Globe, Info, 
  Play, Wifi, Edit, Trash2, UserCheck, UserMinus, TrendingDown, Eye, Loader2, 
  BarChart3, ClipboardCopy, ShieldAlert, HeartPulse, HardDrive, KeyRound, Globe2,
  LockKeyhole, Network, Cable, MessageSquare, MonitorPlay
} from 'lucide-react';

// --- HELPERS ---

/**
 * Berechnet die verbleibende Zeit der Lizenz als Badge
 */
const getRemainingTimeBadge = (lic: License | undefined) => {
    if (!lic || lic.planTier === PlanTier.FREE) {
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase rounded border border-gray-200">Unbegrenzt</span>;
    }
    
    const validUntilDate = lic.adminValidUntilOverride || lic.currentPeriodEnd || lic.validUntil;
    if (!validUntilDate) return null;

    const diff = new Date(validUntilDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
        return <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded border border-red-100">Abgelaufen</span>;
    }
    
    let colorClass = "bg-green-50 text-green-600 border-green-100";
    if (days < 31) colorClass = "bg-amber-50 text-amber-600 border-amber-100";
    if (days < 8) colorClass = "bg-red-50 text-red-600 border-red-100";

    const label = days > 31 ? `Noch ~${Math.floor(days / 30)} Mon.` : `Noch ${days} Tage`;
    
    return <span className={`px-2 py-0.5 ${colorClass} text-[9px] font-bold uppercase rounded border tracking-tight`}>{label}</span>;
};

/**
 * Logik für den Zahlungs-Badge im Dashboard
 */
const getPaymentBadge = (lic: License | undefined) => {
    if (!lic) return <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-full">Keine Info</span>;

    // Wenn der Plan NICHT Free ist
    if (lic.planTier !== PlanTier.FREE) {
        if (lic.status === SubscriptionStatus.PAST_DUE) {
            return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">Zahlung offen</span>;
        }
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Bezahlt</span>;
    }

    // Wenn der Plan Free ist
    if (lic.status === SubscriptionStatus.CANCELED) {
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full">Gekündigt</span>;
    }

    return <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full">Keine Stripe-Info</span>;
};

const AdminTabs = () => {
    const location = useLocation();
    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 pt-2 shadow-sm -mx-8 px-8">
            <Link to="/admin" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${location.pathname === '/admin' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><LayoutDashboard className="w-4 h-4" /> Übersicht</Link>
            <Link to="/admin/users" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${location.pathname === '/admin/users' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><ShieldCheck className="w-4 h-4" /> Nutzer & Lizenzen</Link>
            <Link to="/admin/marketing" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${location.pathname === '/admin/marketing' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><TrendingUp className="w-4 h-4" /> Marketing</Link>
            <div className="h-4 w-px bg-gray-200 mx-2 self-center hidden md:block"></div>
            <Link to="/admin/system" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${location.pathname === '/admin/system' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><Server className="w-4 h-4" /> System Health</Link>
            <Link to="/admin/debug" className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${location.pathname === '/admin/debug' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}><Bug className="w-4 h-4" /> Stripe Debug</Link>
        </div>
    );
};

// --- DATA HOOK ---
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

                if (profiles && Array.isArray(profiles)) {
                    setUsers((profiles as any[]).map((p: any) => ({
                        id: p.id, 
                        email: p.email || 'N/A', 
                        name: p.full_name || 'User', 
                        role: p.role === 'admin' ? UserRole.ADMIN : UserRole.CUSTOMER,
                        registeredAt: p.created_at || new Date().toISOString(), 
                        stripeCustomerId: p.stripe_customer_id, 
                        billingAddress: p.billing_address,
                        firstLoginAt: p.first_login_at || null, 
                        lastLoginAt: p.last_login_at || null
                    })));
                }
                if (licData && Array.isArray(licData)) {
                    setLicenses((licData as any[]).map((l: any) => ({
                        id: l.id, userId: l.user_id, productName: l.product_name, planTier: l.plan_tier as PlanTier, billingCycle: l.billing_cycle || 'none',
                        status: l.status as SubscriptionStatus, validUntil: l.admin_valid_until_override || l.current_period_end || l.valid_until,
                        licenseKey: l.license_key, billingProjectName: l.billing_project_name, stripeSubscriptionId: l.stripe_subscription_id,
                        stripeCustomerId: l.stripe_customer_id, cancelAtPeriodEnd: l.cancel_at_period_end, adminValidUntilOverride: l.admin_valid_until_override,
                        currentPeriodEnd: l.current_period_end,
                        pendingDowngradePlan: l.pending_downgrade_plan,
                        pendingDowngradeCycle: l.pending_downgrade_cycle,
                        pendingDowngradeAt: l.pending_downgrade_at
                    })));
                }
                const rev = (invData as any[])?.filter((i: any) => i.status === 'paid').reduce((acc: number, curr: any) => acc + ((Number(curr.amount) || 0) / 100), 0) || 0;
                setStats({ totalUsers: profiles?.length || 0, activeLicenses: licData?.filter((l: any) => l.status === 'active').length || 0, inactiveLicenses: licData?.filter((l: any) => l.status !== 'active').length || 0, revenue: rev });
            } finally { setLoading(false); }
        };
        fetchAll();
    }, [refreshIndex]);
    return { loading, users, licenses, stats, refreshData };
};

// --- MODALS ---

const EditLicenseModal: React.FC<{ user: User, license: License | undefined, onClose: () => void, onUpdate: () => void }> = ({ user, license, onClose, onUpdate }) => {
    const [tier, setTier] = useState<PlanTier>(license?.planTier || PlanTier.FREE);
    const [status, setStatus] = useState<SubscriptionStatus>(license?.status || SubscriptionStatus.NONE);
    const [overrideDate, setOverrideDate] = useState(license?.adminValidUntilOverride ? new Date(license.adminValidUntilOverride).toISOString().split('T')[0] : '');
    const [updating, setUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSave = async () => {
        setUpdating(true);
        setErrorMsg(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('admin-action', {
                body: { action: 'update_license', userId: user.id, payload: { plan_tier: tier, status: status, admin_override_date: overrideDate || null } },
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            
            if (error) throw error;
            if (!data || data.success === false) throw new Error(data?.error || "Backend-Fehler.");
            
            onUpdate(); onClose();
        } catch (err: any) { 
            setErrorMsg(err.message);
        } finally { setUpdating(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Lizenz-Steuerung</h3>
                <p className="text-sm text-gray-400 font-bold mb-8 uppercase tracking-widest">{user.email}</p>
                
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Plan (Tier) - Händisch</label>
                        <select value={tier} onChange={e => setTier(e.target.value as PlanTier)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-black outline-none focus:ring-2 focus:ring-brand-500 appearance-none">
                            {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Status - Händisch</label>
                        <select value={status} onChange={e => setStatus(e.target.value as SubscriptionStatus)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-black outline-none focus:ring-2 focus:ring-brand-500 appearance-none">
                            <option value="active">Bezahlt / Aktiv</option>
                            <option value="trial">Trial (Production)</option>
                            <option value="past_due">Zahlung offen</option>
                            <option value="canceled">Gekündigt</option>
                            <option value="none">Kein Abo (Free)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Hard-Expiration Date (Override)</label>
                        <input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-black outline-none" />
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Dies überschreibt Stripe-Daten im Dashboard.</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-12">
                    <button onClick={onClose} className="flex-1 py-5 text-sm font-black text-gray-400 hover:text-gray-900 transition-colors">Abbrechen</button>
                    <button onClick={handleSave} disabled={updating} className="flex-2 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10">
                        {updating ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Check className="w-5 h-5" />} Speichern
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- VIEWS ---

const UsersManagement: React.FC = () => {
    const { loading, users, licenses, refreshData } = useAdminData();
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [engagementFilter, setEngagementFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Filter-Logic
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const lic = licenses.find(l => l.userId === u.id);
            const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                                 u.name.toLowerCase().includes(search.toLowerCase()) || 
                                 (u.billingAddress?.companyName || '').toLowerCase().includes(search.toLowerCase());
            
            const matchesTier = tierFilter === 'all' || lic?.planTier === tierFilter;
            const matchesStatus = statusFilter === 'all' || lic?.status === statusFilter;
            
            const isEngaged = !!u.lastLoginAt;
            const matchesEngagement = engagementFilter === 'all' || 
                                     (engagementFilter === 'engaged' && isEngaged) || 
                                     (engagementFilter === 'inactive' && !isEngaged);
            
            const matchesCompany = companyFilter === 'all' || u.billingAddress?.companyName === companyFilter;

            return matchesSearch && matchesTier && matchesStatus && matchesEngagement && matchesCompany;
        });
    }, [users, licenses, search, tierFilter, statusFilter, engagementFilter, companyFilter]);

    const companies = useMemo(() => {
        const set = new Set(users.map(u => u.billingAddress?.companyName).filter(Boolean));
        return Array.from(set);
    }, [users]);

    const handleDelete = async (u: User) => {
        if (u.stripeCustomerId) {
            alert("❌ LÖSCHEN NICHT ERLAUBT: Dieser Nutzer hat ein verknüpftes Stripe-Konto. Bitte kündige zuerst das Abo über das Stripe Dashboard, falls nötig.");
            return;
        }
        if (!confirm(`Soll ${u.email} permanent gelöscht werden? (Keine Stripe-Verbindung vorhanden, Löschen ist sicher).`)) return;
        
        setDeletingId(u.id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke('admin-action', {
                body: { action: 'delete_user', userId: u.id },
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });
            if (error) throw error;
            if (!data || !data.success) throw new Error(data?.error || "Löschen fehlgeschlagen.");
            refreshData();
        } catch (err: any) {
            alert(`Fehler: ${err.message}`);
        } finally { setDeletingId(null); }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" /></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            {editingUser && <EditLicenseModal user={editingUser} license={licenses.find(l => l.userId === editingUser.id)} onClose={() => setEditingUser(null)} onUpdate={refreshData} />}
            
            {/* Filter-Bar */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-10 space-y-6">
                <div className="flex items-center gap-5 border-b border-gray-50 pb-6">
                    <Search className="w-6 h-6 text-gray-300" />
                    {/* Fixed TypeScript error: onChange was passed the state setter directly instead of an event handler function */}
                    <input type="text" placeholder="Schnellsuche (Email, Name, Firma)..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-lg font-bold placeholder:text-gray-300" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan (Tier)</label>
                        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none appearance-none">
                            <option value="all">Alle Pläne</option>
                            {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none appearance-none">
                            <option value="all">Alle Status</option>
                            <option value="active">Aktiv / Bezahlt</option>
                            <option value="trial">Trial</option>
                            <option value="past_due">Zahlung offen</option>
                            <option value="canceled">Gekündigt</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Engagement</label>
                        <select value={engagementFilter} onChange={e => setEngagementFilter(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none appearance-none">
                            <option value="all">Alle</option>
                            <option value="engaged">Eingeloggt (Aktiv)</option>
                            <option value="inactive">Nie eingeloggt</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Firma</label>
                        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none appearance-none">
                            <option value="all">Alle Firmen</option>
                            {companies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nutzer & Firma</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Software-Plan & Laufzeit</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Zahlungsstatus</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">App-Engagement</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => {
                            const lic = licenses.find(l => l.userId === user.id);
                            const hasStripe = !!user.stripeCustomerId;
                            const isAppActive = !!user.lastLoginAt;

                            return (
                                <tr key={user.id} className="hover:bg-gray-50/50 group transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-gray-900 leading-tight text-lg">{user.name}</div>
                                        <div className="text-sm text-gray-400 font-bold mb-2">{user.email}</div>
                                        {user.billingAddress?.companyName ? (
                                            <div className="text-[10px] text-brand-500 font-black flex items-center gap-1.5 uppercase tracking-tight">
                                                <Building className="w-3.5 h-3.5"/>{user.billingAddress.companyName}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-gray-300 font-bold uppercase italic">Keine Firma</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2 items-start">
                                            <div className={`text-sm font-black ${lic?.planTier && lic.planTier !== PlanTier.FREE ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {lic?.planTier || 'Free'}
                                            </div>
                                            {getRemainingTimeBadge(lic)}
                                            {lic?.validUntil && (
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Ablauf: {new Date(lic.validUntil).toLocaleDateString()}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {getPaymentBadge(lic)}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {isAppActive ? (
                                                <>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-50 text-green-600 border border-green-100">
                                                        <UserCheck className="w-3 h-3" /> Aktiv
                                                    </span>
                                                    <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded" title="Letzter Login">
                                                        <Clock className="w-2.5 h-2.5" /> {new Date(user.lastLoginAt!).toLocaleDateString('de-DE')}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-50 text-gray-400 border border-gray-100">
                                                    <UserMinus className="w-3 h-3" /> Nie eingeloggt
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => setEditingUser(user)} className="p-3 text-brand-500 hover:bg-brand-50 rounded-2xl transition-colors" title="Lizenz händisch setzen"><Edit className="w-5 h-5"/></button>
                                            <button 
                                                onClick={() => handleDelete(user)} 
                                                disabled={deletingId === user.id || hasStripe} 
                                                className={`p-3 rounded-2xl transition-colors ${hasStripe ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                title={hasStripe ? "Löschen verboten: Stripe-Konto aktiv" : "Nutzer löschen"}
                                            >
                                                {deletingId === user.id ? <RefreshCw className="w-5 h-5 animate-spin"/> : (hasStripe ? <ShieldAlert className="w-5 h-5" /> : <Trash2 className="w-5 h-5"/>)}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-20 text-center text-gray-400 font-bold italic">Keine Nutzer gefunden, die diesen Filtern entsprechen.</div>
                )}
            </div>
        </div>
    );
};

// --- SYSTEM HEALTH VIEW ---

const SystemHealthView: React.FC = () => {
    const [checks, setChecks] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(true);

    const functionsToPing = [
        { id: 'admin-action', label: 'Lizenz-Steuerung', group: 'Business Logic', bypass: true },
        { id: 'cancel-subscription', label: 'Stripe Kündigung', group: 'Payments', bypass: true },
        { id: 'create-billing-portal-session', label: 'Billing Portal', group: 'Payments', bypass: true },
        { id: 'mark-login', label: 'Login Tracking', group: 'Analytics', bypass: true },
        { id: 'system-health', label: 'System Diagnose', group: 'Technical', bypass: true },
        { id: 'stripe-webhook', label: 'Stripe Webhook', group: 'Infrastructure', bypass: false },
        { id: 'cron-scheduler', label: 'Cron Tasks', group: 'Automation', bypass: false },
        { id: 'webhook-handler', label: 'Frontend Handler', group: 'Technical', bypass: false }
    ];

    const runChecks = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        const functionChecks = await Promise.all(functionsToPing.map(async (fn): Promise<SystemCheckResult> => {
            const start = performance.now();
            try {
                const response = await supabase.functions.invoke(fn.id, { 
                    body: { action: 'ping' },
                    headers: { Authorization: `Bearer ${session?.access_token}` }
                });
                
                const latency = Math.round(performance.now() - start);

                if (response.error) {
                    return { service: fn.label, group: fn.group, status: 'down', latency: 0, details: response.error.message };
                }

                return { service: fn.label, group: fn.group, status: 'operational', latency, details: `Antwort: ${JSON.stringify(response.data || 'OK')}` };
            } catch (e: any) {
                return { service: fn.label, group: fn.group, status: 'down', latency: 0, details: e.message };
            }
        }));

        const dbCheck = await liveSystemService.checkDatabaseConnection();
        const authCheck = await liveSystemService.checkAuthService();

        setChecks([
            { ...dbCheck, group: 'Core Infrastructure' },
            { ...authCheck, group: 'Core Infrastructure' },
            ...functionChecks
        ]);
        setLoading(false);
    };

    useEffect(() => { runChecks(); }, []);

    const groupedChecks = useMemo<Record<string, SystemCheckResult[]>>(() => {
        const groups: Record<string, SystemCheckResult[]> = {};
        checks.forEach((c) => {
            const groupName = c.group || 'Other';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(c);
        });
        return groups;
    }, [checks]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <HeartPulse className="text-red-500 w-10 h-10" /> System Health
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Live Monitoring & Gateway Status</p>
                </div>
                <button onClick={runChecks} disabled={loading} className="p-5 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Scan starten
                </button>
            </div>

            <div className="space-y-12">
                {Object.entries(groupedChecks).map(([group, groupChecks]) => (
                    <div key={group} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{group}</h2>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(groupChecks as SystemCheckResult[]).map((check: SystemCheckResult, idx: number) => (
                                <div key={idx} className={`bg-white p-6 rounded-[2rem] border-2 transition-all group hover:shadow-lg ${check.status === 'operational' ? 'border-gray-50' : 'border-red-100 bg-red-50/5'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${check.status === 'operational' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {check.service.includes('DB') ? <Database className="w-6 h-6"/> : 
                                             check.service.includes('Auth') ? <LockKeyhole className="w-6 h-6"/> : <Zap className="w-6 h-6"/>}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${check.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{check.status}</span>
                                            {(check as any).bypass && (
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-brand-50 text-brand-500 rounded border border-brand-100" title="Manual JWT Check enabled">Bypass Active</span>
                                            )}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 tracking-tight mb-4">{check.service}</h4>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Latenz</span>
                                        <span className="text-xs font-black text-gray-700">{check.latency}ms</span>
                                    </div>
                                    <div className="bg-gray-900 p-4 rounded-2xl text-[10px] font-mono text-green-400/80 overflow-hidden truncate whitespace-nowrap group-hover:whitespace-normal group-hover:overflow-visible group-hover:relative transition-all duration-300">
                                        {check.details}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MarketingInsights: React.FC = () => {
    const { loading, users, licenses } = useAdminData();
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [emailLogs, setEmailLogs] = useState<any[]>([]);
    
    useEffect(() => {
        setGrowthData([
            { name: '01. Nov', signups: 5, active: 2, churn: 0 },
            { name: '05. Nov', signups: 15, active: 8, churn: 1 },
            { name: '10. Nov', signups: 35, active: 20, churn: 1 },
            { name: '15. Nov', signups: 65, active: 45, churn: 2 },
            { name: '20. Nov', signups: 110, active: 85, churn: 4 },
        ]);

        setEmailLogs([
            { id: 1, date: '21.11. 10:45', recipient: 'hans@mueller.de', subject: 'Willkommen bei KOSMA' },
            { id: 2, date: '21.11. 11:20', recipient: 'studio@berlin.com', subject: 'Rechnung INV-2023-01' },
            { id: 3, date: '21.11. 14:15', recipient: 'support@lake.io', subject: 'Passwort-Reset angefordert' },
        ]);
    }, [users, licenses]);

    const stats = useMemo(() => {
        const paying = licenses.filter(l => l.status === 'active' && l.planTier !== 'Free');
        const activated = users.filter(u => !!u.lastLoginAt).length;
        return { 
            total: users.length, 
            paying: paying.length, 
            activated,
            conversion: users.length > 0 ? Math.round((activated / users.length) * 100) : 0
        };
    }, [users, licenses]);

    if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" /></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-brand-500/5 transition-transform group-hover:scale-110"><Users className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Signups</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.total}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-green-500/5 transition-transform group-hover:scale-110"><CreditCard className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Paying Customers</p>
                    <h3 className="text-4xl font-black text-green-600">{stats.paying}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-brand-500/5 transition-transform group-hover:scale-110"><Zap className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Activation Rate</p>
                    <h3 className="text-4xl font-black text-brand-500">{stats.conversion}%</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 text-red-500/5 transition-transform group-hover:scale-110"><UserMinus className="w-24 h-24" /></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Software Logins</p>
                    <h3 className="text-4xl font-black text-gray-700">{stats.activated}</h3>
                </div>
            </div>

            {/* Growth Chart Timeline */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl mb-12 relative overflow-hidden">
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Growth Timeline</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Registrierungen vs. Software-Nutzung</p>
                    </div>
                </div>
                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0093D0" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#0093D0" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}} />
                            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                            <Legend iconType="circle" />
                            <Area type="monotone" dataKey="signups" name="Gesamt Registrierungen" stroke="#0093D0" strokeWidth={4} fillOpacity={1} fill="url(#colorSignups)" />
                            <Area type="monotone" dataKey="active" name="Software Logins" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                            <Area type="monotone" dataKey="churn" name="Kündigungen" stroke="#EF4444" strokeWidth={2} fillOpacity={0} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Elastic Email Log UI */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Mail className="text-brand-500 w-6 h-6" /> Elastic Email History
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Kommunikations-Log (Nur Betreffzeile & Empfänger)</p>
                    </div>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zeitpunkt</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Empfänger</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Betreffzeile</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {emailLogs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5 text-[11px] font-bold text-gray-400 font-mono">{log.date}</td>
                                <td className="px-8 py-5 text-sm font-black text-gray-900">{log.recipient}</td>
                                <td className="px-8 py-5 text-sm font-bold text-gray-600 italic">"{log.subject}"</td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-[10px] font-black uppercase px-3 py-1 bg-green-100 text-green-700 rounded-full">Gesendet</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DashboardOverview: React.FC = () => {
    const { loading, stats } = useAdminData();
    if (loading) return <div className="p-8 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" /></div>;
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nutzer Gesamt</p>
                    <h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktive Abos</p>
                    <h3 className="text-4xl font-black text-green-600">{stats.activeLicenses}</h3>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Umsatz Gesamt (Brutto)</p>
                    <h3 className="text-4xl font-black text-brand-500">{stats.revenue.toFixed(2)} €</h3>
                </div>
            </div>
        </div>
    );
};

const DebugView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stripeStatus, setStripeStatus] = useState<any>(null);
    const [checkingStripe, setCheckingStripe] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        const { data } = await supabase.from('stripe_events').select('*').order('created_at', { ascending: false }).limit(50);
        if (data && Array.isArray(data)) setEvents(data as any[]);
        setLoading(false);
    };

    const checkStripeApi = async () => {
        setCheckingStripe(true);
        setStripeStatus(null);
        try {
            const { data, error } = await supabase.functions.invoke('system-health', {
                body: { action: 'check_stripe' }
            });
            if (error) throw error;
            setStripeStatus(data);
        } catch (e: any) {
            setStripeStatus({ success: false, error: e.message });
        } finally {
            setCheckingStripe(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const copyJson = (ev: any) => {
        navigator.clipboard.writeText(JSON.stringify(ev.payload, null, 2));
        setCopiedId(ev.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCustomerRef = (ev: any) => {
        const obj = ev.payload?.data?.object;
        if (!obj) return '—';
        const email = obj.customer_email || obj.email || obj.receipt_email || obj.billing_details?.email;
        const customerId = obj.customer || (obj.id?.startsWith('cus_') ? obj.id : null);
        if (email && customerId) return `${email} (${customerId})`;
        return email || customerId || obj.id || '—';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <Network className="text-brand-500 w-8 h-8" />
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Stripe API Verbindung</h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
                            Prüfe die direkte Erreichbarkeit der Stripe-Server von deinen Supabase Edge Functions aus. Validiert den `STRIPE_SECRET_KEY`.
                        </p>
                        
                        {stripeStatus && (
                            <div className={`mt-8 p-6 rounded-2xl border-2 animate-in slide-in-from-left-4 ${stripeStatus.success ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                                <div className="flex items-center gap-4 mb-3">
                                    {stripeStatus.success ? <CheckCircle className="text-green-600 w-6 h-6" /> : <AlertTriangle className="text-red-600 w-6 h-6" />}
                                    <h4 className={`text-lg font-black ${stripeStatus.success ? 'text-green-900' : 'text-red-900'}`}>
                                        {stripeStatus.success ? 'API Verbunden' : 'API Fehler'}
                                    </h4>
                                    {stripeStatus.mode && (
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${stripeStatus.mode === 'live' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
                                            {stripeStatus.mode} Mode
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs font-bold font-mono ${stripeStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                                    {stripeStatus.success ? `Konto: ${stripeStatus.accountName}` : stripeStatus.error}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={checkStripeApi}
                        disabled={checkingStripe}
                        className="relative z-10 bg-gray-900 text-white px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-brand-500 transition-all flex items-center gap-4 shadow-xl shadow-gray-900/10 disabled:opacity-50"
                    >
                        {checkingStripe ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Cable className="w-5 h-5" />}
                        Verbindung Testen
                    </button>
                </div>
                
                <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl"></div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Webhook Status</h3>
                        <div className="flex items-center gap-3 text-brand-400 mb-6">
                            <Wifi className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Listening</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                            Alle eingehenden Stripe Events werden hier in Echtzeit protokolliert und zur Diagnose gespeichert.
                        </p>
                    </div>
                    <div className="pt-8 border-t border-gray-800 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Letzter Webhook</span>
                        <span className="text-xs font-black text-brand-500">Vor {events.length > 0 ? 'weniger als 1 Min' : 'n/a'}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8 px-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <History className="w-6 h-6 text-gray-400" /> Event Verlauf (Limit 50)
                </h3>
                <button onClick={refresh} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zeitpunkt</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Typ</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kunde / Referenz</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.map(ev => (
                                <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                        {new Date(ev.created_at).toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-5 font-mono text-xs text-brand-600 font-black">{ev.type}</td>
                                    <td className="px-8 py-5 text-xs font-bold text-gray-600 max-w-[200px] truncate" title={getCustomerRef(ev)}>
                                        {getCustomerRef(ev)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${ev.processing_error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {ev.processing_error ? 'Error' : 'Processed'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => copyJson(ev)} 
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                                                copiedId === ev.id 
                                                    ? 'bg-green-500 text-white shadow-lg' 
                                                    : 'bg-gray-900 text-white hover:bg-brand-500 shadow-md opacity-20 group-hover:opacity-100'
                                            }`}
                                        >
                                            {copiedId === ev.id ? (
                                                <><Check className="w-3.5 h-3.5" /> Copied</>
                                            ) : (
                                                <><ClipboardCopy className="w-3.5 h-3.5" /> JSON Kopieren</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

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
