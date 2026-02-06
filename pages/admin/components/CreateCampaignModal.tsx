import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { AlertTriangle, X, Loader2, Search, Users, Send } from 'lucide-react';

interface PreviewData {
    count_total: number;
    count_excluded_unsub: number;
    count_excluded_bounce: number;
    sample: any[];
}

export const CreateCampaignModal: React.FC<{ onClose: () => void, onCreated: () => void }> = ({ onClose, onCreated }) => {
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