
import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, Project, Invoice } from '../types';
import { 
  Users, CreditCard, TrendingUp, Search, X, Download, Monitor, FolderOpen, Calendar, 
  AlertCircle, CheckCircle, Clock, UserX, Mail, ArrowRight, Briefcase, Activity, 
  Server, Database, Shield, Lock, Zap, LayoutDashboard, LineChart as LineChartIcon, 
  ShieldCheck, RefreshCw, AlertTriangle, ChevronUp, ChevronDown, Filter, ArrowUpDown, 
  ExternalLink, Code, Terminal, Copy, Megaphone, Target, ArrowUpRight, CalendarPlus, 
  History, Building, CalendarMinus, Plus, Minus, Check, Bug, Key, Globe, Info, 
Play, Wifi, Edit, Trash2, UserCheck, UserMinus, TrendingDown, Eye, Loader2, 
BarChart3, ClipboardCopy, ShieldAlert, HeartPulse, HardDrive, KeyRound, Globe2
} from 'lucide-react';

// --- HELPERS ---
const getLicenseLabel = (status: SubscriptionStatus) => {
    switch (status) {
        case SubscriptionStatus.ACTIVE: return 'Bezahlt';
        case SubscriptionStatus.TRIAL: return 'Trial (14 Tage)';
        case SubscriptionStatus.PAST_DUE: return 'Zahlung offen';
        case SubscriptionStatus.CANCELED: return 'Gekündigt / Abgelaufen';
        case SubscriptionStatus.NONE: return 'Free User';
        default: return 'Unbekannt';
    }
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

                if (profiles) {
                    setUsers(profiles.map((p: any) => ({
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
                if (licData) {
                    setLicenses(licData.map((l: any) => ({
                        id: l.id, userId: l.user_id, productName: l.product_name, planTier: l.plan_tier as PlanTier, billingCycle: l.billing_cycle || 'none',
                        status: l.status as SubscriptionStatus, validUntil: l.admin_valid_until_override || l.current_period_end || l.valid_until,
                        licenseKey: l.license_key, billingProjectName: l.billing_project_name, stripeSubscriptionId: l.stripe_subscription_id,
                        stripeCustomerId: l.stripe_customer_id, cancelAtPeriodEnd: l.cancel_at_period_end, adminValidUntilOverride: l.admin_valid_until_override
                    })));
                }
                const rev = invData?.filter((i: any) => i.status === 'paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
                setStats({ totalUsers: profiles?.length || 0, activeLicenses: licData?.filter(l => l.status === 'active').length || 0, inactiveLicenses: licData?.filter(l => l.status !== 'active').length || 0, revenue: rev });
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
            
            const isEngaged = !!u.firstLoginAt;
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
                            <option value="inactive">Nie eingeloggt (Lead)</option>
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
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lizenz / Plan</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stripe</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => {
                            const lic = licenses.find(l => l.userId === user.id);
                            const hasStripe = !!user.stripeCustomerId;
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
                                        <div className="text-sm font-black text-gray-700 mb-1">{lic?.planTier || 'Free'}</div>
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                                            lic?.status === 'active' ? 'bg-green-100 text-green-700' : 
                                            lic?.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>{getLicenseLabel(lic?.status || SubscriptionStatus.NONE)}</span>
                                        {lic?.validUntil && (
                                            <div className="text-[10px] text-gray-400 font-bold mt-2">Gültig bis: {new Date(lic.validUntil).toLocaleDateString()}</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className={`inline-flex items-center justify-center p-2 rounded-xl ${hasStripe ? 'text-brand-500 bg-brand-50 shadow-sm' : 'text-gray-200'}`} title={hasStripe ? `Stripe ID: ${user.stripeCustomerId}` : 'Keine Stripe-Verbindung'}>
                                            <CreditCard className="w-6 h-6" />
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
    const [checks, setChecks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [heartbeatStatus, setHeartbeatStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
    const [heartbeatLog, setHeartbeatLog] = useState<string[]>([]);

    // Diese IDs entsprechen jetzt 1:1 den Slugs in Supabase
    const functionsToPing = [
        { id: 'admin-action', label: 'Lizenz-Steuerung (admin-action)', desc: 'Schreibt Lizenzen händisch in DB' },
        { id: 'cancel-subscription', label: 'Kündigungs-Dienst (cancel-subscription)', desc: 'Storniert Stripe Abonnements' },
        { id: 'create-billing-portal-session', label: 'Billing-Portal (create-billing-portal-session)', desc: 'Erzeugt Stripe Portal Links' },
        { id: 'stripe-webhook', label: 'Stripe-Empfänger (stripe-webhook)', desc: 'Verarbeitet Zahlungs-Events' },
        { id: 'webhook-handler', label: 'Frontend-Handler (webhook-handler)', desc: 'Verarbeitet Redirects nach Kauf' },
        { id: 'system-health', label: 'Diagnose-Kern (system-health)', desc: 'Prüft API Keys & Secrets' },
        { id: 'mark-login', label: 'Login-Tracker (mark-login)', desc: 'Aktualisiert last_login_at' },
        { id: 'cron-scheduler', label: 'Zeit-Steuerung (cron-scheduler)', desc: 'Beendet Testphasen automatisch' }
    ];

    const runChecks = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        const functionChecks = await Promise.all(functionsToPing.map(async (fn) => {
            const start = performance.now();
            try {
                const response = await supabase.functions.invoke(fn.id, { 
                    body: { action: 'ping' },
                    headers: { Authorization: `Bearer ${session?.access_token}` }
                });
                
                const latency = Math.round(performance.now() - start);

                if (response.error) {
                    const errorMsg = response.error.message;
                    if (errorMsg.includes('404')) {
                        return { service: fn.label, status: 'down', latency: 0, details: `FEHLER 404: Slug '${fn.id}' nicht gefunden.` };
                    }
                    return { service: fn.label, status: 'degraded', latency, details: `Fehler: ${errorMsg}` };
                }

                if (response.data && response.data.success === false) {
                    return { service: fn.label, status: 'degraded', latency, details: `AUTH ERROR: ${response.data.error}` };
                }

                return { service: fn.label, status: 'operational', latency, details: `BEREIT. Antwort: ${JSON.stringify(response.data || 'OK')}` };
            } catch (e: any) {
                return { service: fn.label, status: 'down', latency: 0, details: `Crash: ${e.message}` };
            }
        }));

        const dbCheck = await liveSystemService.checkDatabaseConnection();
        const authCheck = await liveSystemService.checkAuthService();

        setChecks([dbCheck, authCheck, ...functionChecks]);
        setLoading(false);
    };

    const runHeartbeat = async () => {
        setHeartbeatStatus('running');
        setHeartbeatLog(["Diagnose Sequenz gestartet...", "Prüfe Klarnamen-Slugs..."]);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Kein Auth-Token gefunden.");
            
            setHeartbeatLog(prev => [...prev, "Schritt 1: Ping gegen 'admin-action'..."]);
            const response = await supabase.functions.invoke('admin-action', { 
                body: { action: 'ping' },
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            
            if (response.error) throw new Error(`CORS/Netzwerk-Fehler bei 'admin-action': ${response.error.message}`);
            setHeartbeatLog(prev => [...prev, "✅ 'admin-action' erreichbar."]);
            
            setHeartbeatLog(prev => [...prev, "Schritt 2: Ping gegen 'system-health'..."]);
            const hResponse = await supabase.functions.invoke('system-health', { 
                body: { action: 'ping' }
            });
            if (hResponse.error) throw new Error(`Slug 'system-health' nicht erreichbar.`);
            setHeartbeatLog(prev => [...prev, "✅ 'system-health' erreichbar."]);

            setHeartbeatStatus('success');
            setHeartbeatLog(prev => [...prev, "Diagnose abgeschlossen. Alle Slugs sind synchron."]);
        } catch (err: any) {
            setHeartbeatLog(prev => [...prev, `❌ FEHLER: ${err.message}`]);
            setHeartbeatStatus('error');
        }
    };

    useEffect(() => { runChecks(); }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <ShieldCheck className="text-brand-500 w-10 h-10" /> Statusbericht (Klarnamen)
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Standardisiertes Slug-Mapping</p>
                </div>
                <button onClick={runChecks} disabled={loading} className="p-5 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-brand-500 transition-all shadow-xl shadow-gray-900/10">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Scan ausführen
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {checks.map((check, idx) => (
                        <div key={idx} className={`bg-white p-6 rounded-[1.5rem] border-2 transition-all shadow-sm ${check.status === 'operational' ? 'border-gray-50' : 'border-red-100 bg-red-50/10'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${check.status === 'operational' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {check.service.includes('DB') ? <Database className="w-5 h-5"/> : 
                                         check.service.includes('Auth') ? <Lock className="w-5 h-5"/> : <Zap className="w-5 h-5"/>}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{check.service}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{functionsToPing.find(f => f.label === check.service)?.desc || 'Basis-Dienst'}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${check.status === 'operational' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{check.status}</span>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-green-400 font-mono text-[10px] leading-relaxed shadow-inner overflow-x-auto">
                                {check.details || 'Warte auf Rückmeldung...'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Slug-Isolation</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Synchronitäts-Check</p>

                        <div className="space-y-3 mb-10">
                            {heartbeatLog.map((log, i) => (
                                <div key={i} className={`flex items-start gap-3 text-xs font-bold font-mono p-3 rounded-xl ${log.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                                    <Terminal className="w-3.5 h-3.5 shrink-0"/>
                                    <span className="leading-tight">{log}</span>
                                </div>
                            ))}
                        </div>

                        <button onClick={runHeartbeat} disabled={heartbeatStatus === 'running'} className="w-full py-6 rounded-[2rem] bg-brand-500 text-white font-black uppercase tracking-widest hover:bg-brand-600 shadow-xl shadow-brand-500/10">
                            Check Slugs
                        </button>
                    </div>
                </div>
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
            </div>
        </div>
    );
};

const MarketingInsights: React.FC = () => {
    const { loading, users, licenses } = useAdminData();
    const stats = useMemo(() => {
        const paying = licenses.filter(l => l.status === 'active' && l.planTier !== 'Free');
        const inactiveLeads = users.filter(u => !u.firstLoginAt);
        const churned = licenses.filter(l => l.status === 'canceled');
        return { payingCount: paying.length, inactiveCount: inactiveLeads.length, churnedCount: churned.length };
    }, [users, licenses]);
    if (loading) return null;
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white p-10 rounded-[2.5rem] border-t-8 border-green-500 shadow-xl shadow-green-500/5">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Zahlende Kunden</p>
                    <h3 className="text-5xl font-black text-gray-900">{stats.payingCount}</h3>
                </div>
            </div>
        </div>
    );
};

const DebugView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        const { data } = await supabase.from('stripe_events').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) setEvents(data);
        setLoading(false);
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
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stripe Webhook Debugger</h1>
                    <div className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Logs</div>
                </div>
                <button onClick={refresh} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
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
