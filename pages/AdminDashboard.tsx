import React, { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { liveSystemService, SystemCheckResult } from '../services/liveSystemService';
import { License, SubscriptionStatus, User, UserRole, PlanTier, MarketingJob } from '../types';
import { 
  Users, CreditCard, TrendingUp, Search, X, AlertTriangle, CheckCircle, 
  Clock, UserCheck, UserMinus, Server, Database, Zap, LayoutDashboard, 
  ShieldCheck, RefreshCw, Edit, Trash2, ShieldAlert, 
  Activity, Wifi, History, ClipboardCopy, Check,
  Loader2, Plus, Send, Eye, AlertCircle, MousePointer, 
  Building, Lock, Bug, Play
} from 'lucide-react';

// --- HELPERS ---

const getRemainingTimeBadge = (lic: License | undefined) => {
    if (!lic || lic.planTier === PlanTier.FREE) {
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] font-bold uppercase rounded border border-gray-200">Unbegrenzt</span>;
    }
    
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
    const isActive = (path: string) => location.pathname === path;
    const baseClass = "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all";
    const activeClass = "border-brand-500 text-brand-600";
    const inactiveClass = "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300";

    return (
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8 bg-white sticky top-0 z-10 pt-2 shadow-sm -mx-8 px-8">
            <Link to="/admin" className={`${baseClass} ${isActive('/admin') ? activeClass : inactiveClass}`}><LayoutDashboard className="w-4 h-4" /> Übersicht</Link>
            <Link to="/admin/users" className={`${baseClass} ${isActive('/admin/users') ? activeClass : inactiveClass}`}><ShieldCheck className="w-4 h-4" /> Nutzer & Lizenzen</Link>
            <Link to="/admin/marketing" className={`${baseClass} ${isActive('/admin/marketing') ? activeClass : inactiveClass}`}><TrendingUp className="w-4 h-4" /> Marketing</Link>
            <div className="h-4 w-px bg-gray-200 mx-2 self-center hidden md:block"></div>
            <Link to="/admin/system" className={`${baseClass} ${isActive('/admin/system') ? activeClass : inactiveClass}`}><Server className="w-4 h-4" /> System Health</Link>
            <Link to="/admin/debug" className={`${baseClass} ${isActive('/admin/debug') ? activeClass : inactiveClass}`}><Bug className="w-4 h-4" /> Stripe Debug</Link>
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
                const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
                if (pError) console.error("Profiles error:", pError);

                const { data: licData, error: lError } = await supabase.from('licenses').select('*');
                if (lError) console.error("Licenses error:", lError);

                const { data: invData } = await supabase.from('invoices').select('amount, status');

                if (profiles && Array.isArray(profiles)) {
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
                
                if (licData && Array.isArray(licData)) {
                    setLicenses(licData.map((l: any) => {
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
            } catch(e) {
                console.error("[AdminData] Crash:", e);
            } finally { 
                setLoading(false); 
            }
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
                
                const tplList =
                    data?.data?.data ??
                    data?.data ??
                    data?.templates ??
                    [];
                setTemplates(Array.isArray(tplList) ? tplList : []);
            } catch (err: any) {
                console.error("Failed to load templates", err);
                setError("Templates konnten nicht geladen werden.");
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
                event_key: eventKey || templateName,
                run_at: runAt ? new Date(runAt).toISOString() : null,
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
                                <>
                                    <select 
                                        value={templateName} 
                                        onChange={e => {
                                            setTemplateName(e.target.value);
                                            if(!eventKey) setEventKey(e.target.value);
                                        }} 
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                                    >
                                        <option value="">-- Select Template --</option>
                                        {templates.map((t: any, idx: number) => {
                                            const label = t?.Name || t?.name || t?.template_name || String(t);
                                            return (
                                                <option key={idx} value={label}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {!loadingTemplates && templates.length === 0 && (
                                        <div className="p-4 text-xs text-gray-400">Keine Templates gefunden.</div>
                                    )}
                                </>
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

// --- SUB-VIEWS ---

const CRMView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const { data: messages } = await supabase.from('email_messages').select('*').eq('to_email', email);
            const { data: events } = await supabase.from('email_events').select('*').eq('to_email', email);

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
                    <button onClick={handleSearch} disabled={loading} className="px-8 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-brand-500 transition-all">
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
                                 item.event_type === 'click' ? <MousePointer className="w-4 h-4" /> :
                                 <Activity className="w-4 h-4" />}
                            </div>
                            {idx < timeline.length - 1 && <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.date.toLocaleString()}</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.type === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {item.type === 'outbound' ? 'Sent Message' : `Event: ${item.event_type}`}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{item.template_name || item.event_key || 'Unknown Event'}</h4>
                            {item.status === 'failed' && <p className="text-xs text-red-500 font-bold mt-2">Delivery Failed</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsView: React.FC = () => {
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
        </div>
    );
};

const MarketingInsights: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'crm' | 'analytics'>('campaigns');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

    useEffect(() => { if (activeTab === 'campaigns') fetchJobs(); }, [activeTab]);

    const handleRetry = async (jobId: string) => {
        if (!confirm("Retry all failed recipients for this job?")) return;
        try {
            await supabase.functions.invoke('marketing-retry', { body: { job_id: jobId } });
            alert("Retry queued.");
            fetchJobs();
        } catch (e: any) { alert("Error: " + e.message); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl">
                    {(['campaigns', 'crm', 'analytics'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {activeTab === 'campaigns' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Campaign Manager</h2>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-brand-500 transition-all shadow-lg"><Plus className="w-4 h-4" /> New Campaign</button>
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
                                    const stats = (job.stats as any)?.counts || {};
                                    const sent = stats.sent || 0;
                                    const failed = stats.failed || 0;
                                    const total = stats.total || (sent + failed + (stats.queued || 0)) || 1;

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900">{job.template_name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">{new Date(job.created_at).toLocaleString()}</div>
                                                {job.dry_run && <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold rounded">DRY RUN</span>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">{job.segment_key}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{job.status.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-medium">
                                                    <div className="flex gap-3 mb-1"><span className="text-green-600">Sent: {sent}</span><span className={failed > 0 ? "text-red-500 font-bold" : "text-gray-400"}>Fail: {failed}</span></div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${job.status === 'done_with_errors' ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (sent / total) * 100)}%` }} /></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {(job.status === 'failed' || job.status === 'done_with_errors') && (
                                                    <button onClick={() => handleRetry(job.id)} className="p-2 text-brand-500 hover:bg-brand-50 rounded-xl transition-colors"><RefreshCw className="w-4 h-4" /></button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'crm' && <CRMView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {isCreateModalOpen && <CreateCampaignModal onClose={() => setIsCreateModalOpen(false)} onCreated={() => { fetchJobs(); setActiveTab('campaigns'); }} />}
        </div>
    );
};

const UsersManagement: React.FC = () => {
    const { loading, users, licenses, refreshData } = useAdminData();
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const lic = licenses.find(l => l.userId === u.id);
            const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase());
            const matchesTier = tierFilter === 'all' || lic?.planTier === tierFilter;
            return matchesSearch && matchesTier;
        });
    }, [users, licenses, search, tierFilter]);

    const handleDelete = async (u: User) => {
        if (u.stripeCustomerId) { alert("LOESCHEN NICHT ERLAUBT: Stripe-Konto aktiv."); return; }
        if (!confirm(`Soll ${u.email} permanent gelöscht werden?`)) return;
        setDeletingId(u.id);
        try {
            await supabase.functions.invoke('admin-action', { body: { action: 'delete_user', userId: u.id } });
            refreshData();
        } catch (err: any) { alert(`Fehler: ${err.message}`); } finally { setDeletingId(null); }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" /></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            {editingUser && <EditLicenseModal user={editingUser} license={licenses.find(l => l.userId === editingUser.id)} onClose={() => setEditingUser(null)} onUpdate={refreshData} />}
            
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-10 space-y-6">
                <div className="flex items-center gap-5 border-b border-gray-50 pb-6">
                    <Search className="w-6 h-6 text-gray-300" />
                    <input type="text" placeholder="Schnellsuche..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-lg font-bold placeholder:text-gray-300" />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nutzer</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => {
                            const lic = licenses.find(l => l.userId === user.id);
                            return (
                                <tr key={user.id} className="hover:bg-gray-50/50 group transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-400 font-bold">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-6"><div className="flex flex-col gap-2 items-start"><div className="text-sm font-black">{lic?.planTier || 'Free'}</div>{getRemainingTimeBadge(lic)}</div></td>
                                    <td className="px-8 py-6 text-center">{getPaymentBadge(lic)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => setEditingUser(user)} className="p-3 text-brand-500 hover:bg-brand-50 rounded-2xl transition-colors"><Edit className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(user)} disabled={deletingId === user.id} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SystemHealthView: React.FC = () => {
    const [checks, setChecks] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(true);

    const runChecks = async () => {
        setLoading(true);
        const results = await Promise.all([
            liveSystemService.checkDatabaseConnection(),
            liveSystemService.checkAuthService()
        ]);
        setChecks(results);
        setLoading(false);
    };

    useEffect(() => { runChecks(); }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div><h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4"><Activity className="text-red-500 w-10 h-10" /> System Health</h1></div>
                <button onClick={runChecks} disabled={loading} className="p-5 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-brand-500 transition-all"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Scan starten</button>
            </div>
            <div className="space-y-6">
                {checks.map((check, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${check.status === 'operational' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{check.status === 'operational' ? <CheckCircle className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}</div>
                            <div><div className="font-bold text-gray-900">{check.service}</div><div className="text-xs text-gray-500">{check.details || check.message}</div></div>
                        </div>
                        <div className="text-right"><div className="text-xs font-black uppercase tracking-widest">{check.status}</div><div className="text-xs text-gray-400 font-mono mt-1">{check.latency}ms</div></div>
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
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nutzer Gesamt</p><h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3></div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktive Abos</p><h3 className="text-4xl font-black text-green-600">{stats.activeLicenses}</h3></div>
            </div>
        </div>
    );
};

const DebugView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = async () => {
        setLoading(true);
        const { data } = await supabase.from('stripe_events').select('*').order('created_at', { ascending: false }).limit(20);
        if (data) setEvents(data);
        setLoading(false);
    };

    useEffect(() => { refresh(); }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex justify-between items-center mb-8 px-4"><h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><History className="w-6 h-6 text-gray-400" /> Stripe Logs</h3><button onClick={refresh} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button></div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th><th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th><th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Data</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.map(ev => (
                            <tr key={ev.id} className="hover:bg-gray-50/50"><td className="px-8 py-5 font-mono text-xs text-brand-600 font-black">{ev.type}</td><td className="px-8 py-5 text-xs font-bold text-gray-600">{new Date(ev.created_at).toLocaleString()}</td><td className="px-8 py-5 text-right"><button onClick={() => navigator.clipboard.writeText(JSON.stringify(ev.payload))} className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"><ClipboardCopy className="w-3 h-3 inline mr-1"/> JSON</button></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    // Debug log to verify component mount
    useEffect(() => { console.log("[AdminDashboard] Mounting..."); }, []);

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