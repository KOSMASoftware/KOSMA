import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { AlertTriangle, X, Search, Users, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/ui/FormField';

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
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Campaign Wizard</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><X className="w-5 h-5"/></button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold flex gap-3">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Segment">
                                <Select value={segmentKey} onChange={e => setSegmentKey(e.target.value)}>
                                    {SEGMENT_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                                </Select>
                            </FormField>
                            
                            <FormField label="Run At (Optional)" hint="Leave empty to run immediately.">
                                <Input 
                                    type="datetime-local" 
                                    value={runAt} 
                                    onChange={e => setRunAt(e.target.value)} 
                                />
                            </FormField>
                        </div>

                        <FormField label="Template">
                            {loadingTemplates ? (
                                <div className="h-10 flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm italic">Loading Templates...</div>
                            ) : (
                                <Select 
                                    value={templateName} 
                                    onChange={e => {
                                        setTemplateName(e.target.value);
                                        if(!eventKey) setEventKey(e.target.value);
                                    }} 
                                >
                                    <option value="">-- Select Template --</option>
                                    {templates.map((t: any, idx: number) => {
                                        const label = t?.Name || t?.name || t?.template_name || String(t);
                                        return <option key={idx} value={label}>{label}</option>;
                                    })}
                                </Select>
                            )}
                        </FormField>

                        <FormField label="Event Key (Tracking)" hint="Used for analytics aggregation.">
                            <Input 
                                type="text" 
                                value={eventKey} 
                                onChange={e => setEventKey(e.target.value)} 
                                placeholder="e.g. newsletter_jan_24"
                            />
                        </FormField>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                            <input 
                                type="checkbox" 
                                id="dryRun"
                                checked={dryRun}
                                onChange={e => setDryRun(e.target.checked)}
                                className="w-4 h-4 accent-brand-500 rounded"
                            />
                            <label htmlFor="dryRun" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Dry Run (Database log only, no emails)</label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                onClick={handlePreview} 
                                disabled={!templateName} 
                                isLoading={calculating}
                                icon={<Search className="w-4 h-4" />}
                            >
                                Preview Audience
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && previewData && (
                    <div className="space-y-6">
                        <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-brand-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-brand-900">{previewData.count_total} Recipients</h4>
                                <p className="text-xs font-medium text-brand-700">Target audience size based on '{segmentKey}'</p>
                                {(previewData.count_excluded_unsub > 0 || previewData.count_excluded_bounce > 0) && (
                                    <p className="text-[10px] mt-1 font-bold text-brand-600/60 uppercase">
                                        Excluded: {previewData.count_excluded_unsub} Unsub · {previewData.count_excluded_bounce} Bounced
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sample Recipients</h5>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-1 max-h-32 overflow-y-auto font-mono text-xs text-gray-600">
                                {previewData.sample.map((u: any, i: number) => (
                                    <div key={i}>{u.email} ({u.id})</div>
                                ))}
                                {previewData.sample.length === 0 && <div>No users found in sample.</div>}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                            <Button 
                                onClick={handleCreate} 
                                isLoading={submitting} 
                                className="flex-[2] bg-green-600 hover:bg-green-700"
                                icon={<Send className="w-4 h-4" />}
                            >
                                {runAt ? 'Schedule Campaign' : 'Launch Now'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};