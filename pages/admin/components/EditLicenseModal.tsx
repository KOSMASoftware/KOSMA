import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { User, License, PlanTier, SubscriptionStatus } from '../../../types';
import { AlertTriangle, RefreshCw, Check } from 'lucide-react';

export const EditLicenseModal: React.FC<{ user: User, license: License | undefined, onClose: () => void, onUpdate: () => void }> = ({ user, license, onClose, onUpdate }) => {
    const [tier, setTier] = useState<PlanTier>(license?.planTier || PlanTier.FREE);
    const [status, setStatus] = useState<SubscriptionStatus>(license?.status || SubscriptionStatus.NONE);
    // Initialize date based on priority: Stripe -> Trial -> Admin Override
    const initialDate = license?.currentPeriodEnd || license?.trialEndsAt || license?.adminValidUntilOverride || '';
    const [overrideDate, setOverrideDate] = useState(initialDate ? new Date(initialDate).toISOString().split('T')[0] : '');
    const [updating, setUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const isStripe = !!license?.stripeSubscriptionId;
    const isTrial = status === 'trial';

    let dateLabel = "Admin override valid until (UTC)";
    let dateHint = "Sets licenses.admin_valid_until_override.";

    if (isStripe) {
        dateLabel = "Extend Stripe billing until (UTC)";
        dateHint = "This updates Stripe (next invoice shifts). No local override date is stored.";
    } else if (isTrial) {
        dateLabel = "Trial ends at (UTC)";
        dateHint = "Sets licenses.trial_ends_at.";
    }

    const handleSave = async () => {
        if (isStripe && !overrideDate) {
            setErrorMsg("Date required for Stripe extension");
            return;
        }

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
                            <option value="trial">Trial</option>
                            <option value="past_due">Zahlung abgelehnt</option>
                            <option value="canceled">Gekündigt</option>
                            <option value="none">Kein Abo (Free)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">{dateLabel}</label>
                        <input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-black outline-none" />
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{dateHint}</p>
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