
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { User, License, PlanTier, SubscriptionStatus } from '../../../types';
import { AlertTriangle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FormField } from '../../../components/ui/FormField';
import { H3, H5, Small } from '../../../components/ui/Typography';

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

    let dateLabel = "Admin override (UTC)";
    let dateHint = "Sets licenses.admin_valid_until_override.";

    if (isStripe) {
        dateLabel = "Extend Stripe billing (UTC)";
        dateHint = "Updates Stripe (next invoice shifts). No local override.";
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <div className="mb-6">
                    <H3>License Control</H3>
                    <H5 className="mt-1 truncate">{user.email}</H5>
                </div>
                
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 flex gap-3">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <Small className="font-bold text-red-600">{errorMsg}</Small>
                    </div>
                )}

                <div className="space-y-4">
                    <FormField label="Plan (Tier)">
                        <Select value={tier} onChange={e => setTier(e.target.value as PlanTier)}>
                            {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </FormField>

                    <FormField label="Status">
                        <Select value={status} onChange={e => setStatus(e.target.value as SubscriptionStatus)}>
                            <option value="active">Active / Paid</option>
                            <option value="trial">Trial</option>
                            <option value="past_due">Past Due</option>
                            <option value="canceled">Canceled</option>
                            <option value="none">None (Free)</option>
                        </Select>
                    </FormField>

                    <FormField label={dateLabel} hint={dateHint}>
                        <Input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} />
                    </FormField>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave} isLoading={updating} icon={<Check className="w-4 h-4" />} className="flex-1">
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};
