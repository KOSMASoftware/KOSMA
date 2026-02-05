

import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useNavigate, useSearchParams, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, Project, Invoice, MarketingJob, EmailMessage, EmailEvent } from '../types';
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
  LockKeyhole, Network, Cable, MessageSquare, MonitorPlay, Send, MousePointer2, User as UserIcon
} from 'lucide-react';

// --- HELPERS ---

/**
 * Berechnet die verbleibende Zeit der Lizenz als Badge
 * Uses purely the pre-calculated lic.validUntil from the hook logic.
 */
const getRemainingTimeBadge = (lic: License | undefined) => {
    if (!lic || lic.planTier === PlanTier.FREE) {
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase rounded border border-gray-200">Unbegrenzt</span>;
    }
    
    // Simplification: logic now relies solely on the correctly mapped validUntil
    const validUntilDate = lic.validUntil;
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

    if (lic.status === SubscriptionStatus.TRIAL) {
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full">Trial</span>;
    }

    const hasStripeSub = !!lic.stripeSubscriptionId?.startsWith('sub_');

    if (!hasStripeSub) {
      if (lic.status === SubscriptionStatus.CANCELED) {
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full">Gekündigt</span>;
      }
      return <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-full">Keine Stripe-Info</span>;
    }

    if (lic.status === SubscriptionStatus.PAST_DUE) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">Zahlung offen</span>;
    }
    if (lic.status === SubscriptionStatus.ACTIVE) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Bezahlt</span>;
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
                    setLicenses((licData as any[]).map((l: any) => {
                        // Calculate validUntil based on priority: Stripe > Trial > Admin Override
                        let computedValidUntil: string | null = null;
                        
                        if (l.stripe_subscription_id) {
                            computedValidUntil = l.current_period_end;
                        } else if (l.status === 'trial') {
                            computedValidUntil = l.trial_ends_at;
                        } else {
                            computedValidUntil = l.admin_valid_until_override;
                        }

                        return {
                            id: l.id, 
                            userId: l.user_id, 
                            productName: l.product_name, 
                            planTier: l.plan_tier as PlanTier, 
                            billingCycle: l.billing_cycle || 'none',
                            status: l.status as SubscriptionStatus, 
                            validUntil: computedValidUntil,
                            licenseKey: l.license_key, 
                            billingProjectName: l.billing_project_name, 
                            stripeSubscriptionId: l.stripe_subscription_id,
                            stripeCustomerId: l.stripe_customer_id, 
                            cancelAtPeriodEnd: l.cancel_at_period_end, 
                            adminValidUntilOverride: l.admin_valid_until_override,
                            currentPeriodEnd: l.current_period_end,
                            trialEndsAt: l.trial_ends_at,
                            pendingDowngradePlan: l.pending_downgrade_plan,
                            pendingDowngradeCycle: l.pending_downgrade_cycle,
                            pendingDowngradeAt: l.pending_downgrade_at
                        };
                    }));
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
                            <option value="active">Bezahlt</option>
                            <option value="trial">Trial (Production)</option>
                            <option value="past_due">Zahlung abgelehnt</option>
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

// --- MARKETING WIZARD COMPONENT ---

interface PreviewData {
    count_total: number;
    count_excluded_unsub: number;
    count_excluded_bounce: number;
    sample: any[];
}

const CreateCampaignModal: React.FC<{ onClose: () => void, onCreated: () => void }> = ({ onClose, onCreated }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [segmentKey, setSegmentKey] = useState('all_users');
    const [templateName, setTemplateName] = useState('');
    const [eventKey, setEventKey] = useState('');
    const [runAt, setRunAt] = useState('');
    const [dryRun, setDryRun] = useState(false);

    const SEGMENT_KEYS = [
        'all_users', 'trial_active', 'monthly_active', 'yearly_active', 'monthly_3_periods',
        'monthly_to_yearly_offer', 'cancelled_or_expired', 'inactivity_short', 'inactivity_long',
        'reactivation_offer', 'cancellation_confirmation', 'monthly_tips',
        'deletion_warning_30d', 'deletion_warning_7d', 'deletion_due', 'never_logged_in'
    ];

    useEffect(() => {
        const loadTemplates = async () => {
            setLoadingTemplates(true);
            try {
                const { data, error } = await supabase.functions.invoke('marketing-templates');
                if (error) throw error;
                
                // Response structure: { success: true, data: { success: true, data: [...] } }
                // Edge function usually returns body in 'data'. 
                // If the Elastic payload is in data.data, we use that.
                // Fallback to data.templates if structure varies.
                const tplList =
                    data?.data?.data ||
                    data?.data ||
                    data?.templates ||
                    [];
                setTemplates(Array.isArray(tplList) ? tplList : []);
            } catch (err: any) {
                console.error("Failed to load templates", err);
                // Fallback / Silent fail for UI
            } finally {
                setLoadingTemplates(false);
            }
        };
        loadTemplates();
    }, []);

    const handlePreview = async () => {
        setCalculating(true);
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('marketing-preview', {
                body: { segment_key: segmentKey }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            
            // Backend returns: count_total, count_excluded_unsub, count_excluded_bounce, sample
            setPreviewData({
                count_total: data.count_total || 0,
                count_excluded_unsub: data.count_excluded_unsub || 0,
                count_excluded_bounce: data.count_excluded_bounce || 0,
                sample: data.sample || []
            });
            setStep(2);
        } catch (err: any) {
            setError(err.message || "Preview failed");
        } finally {
            setCalculating(false);
        }
    };

    const handleCreate = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                segment_key: segmentKey,
                template_name: templateName,
                event_key: eventKey || templateName, // Default to template name if empty
                run_at: runAt ? new Date(runAt).toISOString() : null, // Immediate if null
                dry_run: dryRun
            };

            const { data, error } = await supabase.functions.invoke('marketing-create-job', {
                body: payload
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || "Creation failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Campaign Wizard</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-900"/></button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Segment</label>
                                <select 
                                    value={segmentKey} 
                                    onChange={e => setSegmentKey(e.target.value)} 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                                >
                                    {SEGMENT_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Run At (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    value={runAt} 
                                    onChange={e => setRunAt(e.target.value)} 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Leave empty to run immediately.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Template</label>
                            {loadingTemplates ? (
                                <div className="p-4 bg-gray-50 rounded-xl text-gray-400 text-sm italic">Loading Elastic Templates...</div>
                            ) : (
                                <select 
                                    value={templateName} 
                                    onChange={e => {
                                        setTemplateName(e.target.value);
                                        if(!eventKey) setEventKey(e.target.value); // Auto-fill event key
                                    }} 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                                >
                                    <option value="">-- Select Template --</option>
                                    {templates.map((t: any, idx: number) => (
                                        <option key={idx} value={t.name || t}>{t.name || t}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Event Key (Tracking)</label>
                            <input 
                                type="text" 
                                value={eventKey} 
                                onChange={e => setEventKey(e.target.value)} 
                                placeholder="e.g. newsletter_jan_24"
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <input 
                                type="checkbox" 
                                id="dryRun"
                                checked={dryRun}
                                onChange={e => setDryRun(e.target.checked)}
                                className="w-5 h-5 accent-brand-500 rounded"
                            />
                            <label htmlFor="dryRun" className="text-sm font-bold text-gray-700 cursor-pointer">Dry Run (No emails sent, only DB log)</label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                onClick={handlePreview} 
                                disabled={calculating || !templateName}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-brand-500 transition-all disabled:opacity-50 shadow-xl"
                            >
                                {calculating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                                Preview Audience
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && previewData && (
                    <div className="space-y-8">
                        <div className="p-6 bg-brand-50 border border-brand-100 rounded-2xl flex items-center gap-6">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Users className="w-8 h-8 text-brand-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-brand-900">{previewData.count_total} Recipients</h4>
                                <p className="text-sm font-medium text-brand-700">Target audience size based on '{segmentKey}'</p>
                                {(previewData.count_excluded_unsub > 0 || previewData.count_excluded_bounce > 0) && (
                                    <p className="text-[10px] mt-2 font-bold text-brand-600/60 uppercase">
                                        Excluded: {previewData.count_excluded_unsub} Unsub · {previewData.count_excluded_bounce} Bounced
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sample Recipients</h5>
                            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2 max-h-40 overflow-y-auto font-mono text-xs text-gray-600">
                                {previewData.sample.map((u: any, i: number) => (
                                    <div key={i}>{u.email} ({u.id})</div>
                                ))}
                                {previewData.sample.length === 0 && <div>No users found in sample.</div>}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleCreate}
                                disabled={submitting}
                                className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-xl disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                                {runAt ? 'Schedule Campaign' : 'Launch Now'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MARKETING VIEW COMPONENTS ---

const MarketingInsights: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'crm' | 'analytics'>('campaigns');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Data States
    const [jobs, setJobs] = useState<MarketingJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    
    const fetchJobs = async () => {
        setLoadingJobs(true);
        const { data } = await supabase
            .from('marketing_jobs')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setJobs(data as MarketingJob[]);
        setLoadingJobs(false);
    };

    useEffect(() => {
        if (activeTab === 'campaigns') fetchJobs();
    }, [activeTab]);

    const handleRetry = async (jobId: string) => {
        if (!confirm("Retry all failed recipients for this job?")) return;
        try {
            const { error } = await supabase.functions.invoke('marketing-retry', {
                body: { job_id: jobId }
            });
            if (error) throw error;
            alert("Retry queued.");
            fetchJobs();
        } catch (e: any) {
            alert("Error: " + e.message);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            {/* Sub-Navigation */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
                    {(['campaigns', 'crm', 'analytics'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            {activeTab === 'campaigns' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Campaign Manager</h2>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-brand-500 transition-all shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> New Campaign
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Template</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Segment</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingJobs ? (
                                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500"/></td></tr>
                                ) : jobs.map(job => {
                                    // Parse stats structure: { counts: { sent, failed, ... } }
                                    const stats = (job.stats as any)?.counts || {};
                                    const sent = stats.sent || 0;
                                    const failed = stats.failed || 0;
                                    // For progress bar, we can estimate total from counts or use stats.total if available.
                                    // Assuming total_count might be stored, or sum of sent+failed+queued+skipped
                                    const total = stats.total || (sent + failed + (stats.queued || 0) + (stats.skipped || 0)) || 1;

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900">{job.template_name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">{new Date(job.created_at).toLocaleString()}</div>
                                                {job.dry_run && <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold rounded">DRY RUN</span>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                                                    {job.segment_key}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    job.status === 'done' ? 'bg-green-100 text-green-700' :
                                                    job.status === 'running' ? 'bg-brand-100 text-brand-700 animate-pulse' :
                                                    job.status === 'scheduled' ? 'bg-gray-100 text-gray-600' :
                                                    job.status === 'done_with_errors' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {job.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-medium">
                                                    <div className="flex gap-3 mb-1">
                                                        <span className="text-green-600">Sent: {sent}</span>
                                                        <span className={failed > 0 ? "text-red-500 font-bold" : "text-gray-400"}>Fail: {failed}</span>
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${job.status === 'done_with_errors' ? 'bg-amber-500' : 'bg-brand-500'}`}
                                                            style={{ width: `${Math.min(100, (sent / total) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {(job.status === 'failed' || job.status === 'done_with_errors') && (
                                                    <button 
                                                        onClick={() => handleRetry(job.id)}
                                                        className="p-2 text-brand-500 hover:bg-brand-50 rounded-xl transition-colors" 
                                                        title="Retry failed recipients"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {jobs.length === 0 && !loadingJobs && (
                            <div className="p-12 text-center text-gray-400 font-medium italic">No campaigns found.</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'crm' && <CRMView />}
            
            {activeTab === 'analytics' && <AnalyticsView />}

            {isCreateModalOpen && (
                <CreateCampaignModal 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onCreated={() => {
                        fetchJobs();
                        setActiveTab('campaigns');
                    }} 
                />
            )}
        </div>
    );
};

// --- CRM Sub-Component ---
const CRMView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!email) return;
        setLoading(true);
        try {
            // Fetch Messages (Outbound)
            const { data: messages } = await supabase
                .from('email_messages')
                .select('*')
                .eq('to_email', email);

            // Fetch Events (Inbound/Tracking)
            const { data: events } = await supabase
                .from('email_events')
                .select('*')
                .eq('to_email', email);

            // Merge & Sort
            const combined = [
                ...(messages || []).map(m => ({ ...m, type: 'outbound', date: new Date(m.sent_at) })),
                ...(events || []).map(e => ({ ...e, type: 'inbound', date: new Date(e.occurred_at) }))
            ].sort((a, b) => b.date.getTime() - a.date.getTime());

            setTimeline(combined);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-10">
                <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 flex items-center border border-gray-100 focus-within:ring-2 ring-brand-500 transition-all">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search user email..." 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-transparent p-4 outline-none font-bold text-gray-900"
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-8 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-brand-500 transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Search Timeline"}
                    </button>
                </div>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
                {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                                item.type === 'outbound' ? 'bg-blue-50 text-blue-600' : 
                                item.event_type === 'open' ? 'bg-green-50 text-green-600' :
                                item.event_type === 'bounce' ? 'bg-red-50 text-red-600' :
                                'bg-gray-50 text-gray-500'
                            }`}>
                                {item.type === 'outbound' ? <Send className="w-4 h-4" /> : 
                                 item.event_type === 'open' ? <Eye className="w-4 h-4" /> :
                                 item.event_type === 'click' ? <MousePointer2 className="w-4 h-4" /> :
                                 <Activity className="w-4 h-4" />}
                            </div>
                            {idx < timeline.length - 1 && <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {item.date.toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                    item.type === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {item.type === 'outbound' ? 'Sent Message' : `Event: ${item.event_type}`}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">
                                {item.template_name || item.event_key || 'Unknown Event'}
                            </h4>
                            {item.status === 'failed' && (
                                <p className="text-xs text-red-500 font-bold mt-2">Delivery Failed</p>
                            )}
                        </div>
                    </div>
                ))}
                {timeline.length === 0 && !loading && email && (
                    <div className="text-center text-gray-400 italic py-12">No history found.</div>
                )}
            </div>
        </div>
    );
};

// --- Analytics Sub-Component ---
const AnalyticsView: React.FC = () => {
    // Placeholder for Analytics MVP
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <Send className="w-12 h-12 text-brand-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">--</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Sent</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-green-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">-- %</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Open Rate</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-red-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">-- %</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Bounce Rate</p>
            </div>
            <div className="col-span-full text-center text-gray-400 text-sm italic mt-8">
                Analytics Module is coming in next release.
            </div>
        </div>
    );
};

// --- USERS VIEW & SYSTEM HEALTH VIEWS REMAIN UNCHANGED (Just re-exporting existing components in same file) ---
// ... (The rest of AdminDashboard.tsx remains largely the same, I just replaced MarketingInsights)

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
            
            // Updated Status Filter Logic
            const matchesStatus = statusFilter === 'all' || (() => {
                if (lic?.status !== statusFilter) return false;

                // For active and trial, ensure the date is valid and >= today (UTC day start)
                if (statusFilter === 'active' || statusFilter === 'trial') {
                    if (!lic?.validUntil) return false;

                    const validUntilDate = new Date(lic.validUntil);
                    const now = new Date();
                    const todayUTC = new Date(Date.UTC(
                        now.getUTCFullYear(),
                        now.getUTCMonth(),
                        now.getUTCDate()
                    ));

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

    const companies = useMemo(() => {
        const set = new Set(users.map(u => u.billingAddress?.companyName).filter(Boolean));
        return Array.from(set);
    }, [users]);

    const handleDelete = async (u: User) => {
        if (u.stripeCustomerId) {
            alert("LOESCHEN NICHT ERLAUBT: Dieser Nutzer hat ein verknuepftes Stripe-Konto. Bitte kuendige zuerst das Abo ueber das Stripe Dashboard, falls noetig.");
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
                            <option value="active">Bezahlt</option>
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
