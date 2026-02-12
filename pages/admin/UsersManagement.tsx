
import React, { useState, useEffect } from 'react';
import { Loader2, Search, Pencil, Trash, Lock, ChevronDown, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PlanTier, SubscriptionStatus, License, User } from '../../types';
import { AdminTabs } from './components/AdminTabs';
import { EditLicenseModal } from './components/EditLicenseModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FormField } from '../../components/ui/FormField';
import { H5, Label, Small } from '../../components/ui/Typography';
import { useSearchParams } from 'react-router-dom';

// --- HELPERS (Local to this view) ---

const getRemainingTimeBadge = (lic: License | undefined) => {
    if (!lic || lic.planTier === PlanTier.FREE) {
        return <H5 className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded border border-gray-200 inline-block text-[9px] leading-tight">Unbegrenzt</H5>;
    }
    
    const validUntilDate = lic.validUntil;
    if (!validUntilDate) return null;

    const diff = new Date(validUntilDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
        return <H5 className="px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 inline-block text-[9px] leading-tight">Abgelaufen</H5>;
    }
    
    let colorClass = "bg-green-50 text-green-600 border-green-100";
    if (days < 31) colorClass = "bg-amber-50 text-amber-600 border-amber-100";
    if (days < 8) colorClass = "bg-red-50 text-red-600 border-red-100";

    const label = days > 31 ? `Noch ~${Math.floor(days / 30)} Mon.` : `Noch ${days} Tage`;
    
    return <H5 className={`px-2 py-0.5 ${colorClass} rounded border inline-block text-[9px] leading-tight`}>{label}</H5>;
};

const getPaymentBadge = (lic: License | undefined) => {
    if (!lic) return <H5 className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded border border-gray-200 inline-block text-[9px]">Keine Info</H5>;

    if (lic.status === SubscriptionStatus.TRIAL) {
        return <H5 className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 inline-block text-[9px]">Trial</H5>;
    }

    const hasStripeSub = !!lic.stripeSubscriptionId?.startsWith('sub_');

    if (!hasStripeSub) {
      if (lic.status === SubscriptionStatus.CANCELED) {
        return <H5 className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-100 inline-block text-[9px]">Gekündigt</H5>;
      }
      return <H5 className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 inline-block text-[9px]">Keine Stripe-Info</H5>;
    }

    if (lic.status === SubscriptionStatus.PAST_DUE) {
      return <H5 className="px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100 inline-block text-[9px]">Zahlung offen</H5>;
    }
    if (lic.status === SubscriptionStatus.ACTIVE) {
      return <H5 className="px-2 py-0.5 bg-green-50 text-green-700 rounded border border-green-100 inline-block text-[9px]">Bezahlt</H5>;
    }
    return <H5 className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 inline-block text-[9px]">Keine Stripe-Info</H5>;
};

export const UsersManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    
    // Pagination & Data State
    const [items, setItems] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        plan: searchParams.get('plan') || 'all',
        status: searchParams.get('status') || 'all',
        engagement: 'all',
        company: ''
    });
    
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Initial Load & Filter Changes
    useEffect(() => {
        loadUsers(true);
    }, [filters]);

    const loadUsers = async (reset = false) => {
        setLoading(true);
        if (reset) {
            setItems([]);
            setCursor(null);
        }

        try {
            const { data, error } = await supabase.functions.invoke('admin-users-list', {
                body: {
                    q: filters.q || null,
                    plan: filters.plan === 'all' ? null : filters.plan,
                    status: filters.status === 'all' ? null : filters.status,
                    engagement: filters.engagement === 'all' ? null : filters.engagement,
                    company: filters.company || null,
                    limit: 50,
                    cursor: reset ? null : cursor
                }
            });

            if (error) throw error;

            if (data) {
                setItems(prev => reset ? (data.items || []) : [...prev, ...(data.items || [])]);
                setCursor(data.next_cursor || null);
            }
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (user.stripeCustomerId) { alert("LOESCHEN NICHT ERLAUBT: Stripe-Konto aktiv."); return; }
        if (!confirm(`Soll ${user.email} permanent gelöscht werden?`)) return;
        setDeletingId(user.id);
        try {
            await supabase.functions.invoke('admin-action', { body: { action: 'delete_user', userId: user.id } });
            // Reload list instead of full refresh
            loadUsers(true);
        } catch (err: any) { alert(`Fehler: ${err.message}`); } finally { setDeletingId(null); }
    };

    // Helper to extract user and license objects from flattened or nested item
    const getItemData = (item: any) => {
        // Backend returns mixed data. We construct objects for the UI helpers.
        const user: User = {
            id: item.id || item.user_id,
            email: item.email,
            name: item.full_name || item.name || 'User',
            role: item.role,
            registeredAt: item.created_at,
            stripeCustomerId: item.stripe_customer_id,
            lastLoginAt: item.last_login_at,
            billingAddress: item.billing_address
        };

        const licData = item.license || item;
        
        let validUntil = licData.validUntil || licData.valid_until;
        // Priority logic logic usually handled by backend view/function, 
        // but if raw data comes back, we might need to pick:
        if (licData.stripe_subscription_id) validUntil = licData.current_period_end;
        else if (licData.status === 'trial') validUntil = licData.trial_ends_at;
        else if (licData.admin_valid_until_override) validUntil = licData.admin_valid_until_override;

        const license: License = {
            id: licData.license_id || licData.id || 'temp',
            userId: user.id,
            productName: 'KOSMA',
            planTier: licData.plan_tier || PlanTier.FREE,
            billingCycle: licData.billing_cycle || 'none',
            status: licData.status || SubscriptionStatus.NONE,
            validUntil: validUntil,
            licenseKey: licData.license_key,
            stripeSubscriptionId: licData.stripe_subscription_id,
            stripeCustomerId: licData.stripe_customer_id,
            adminValidUntilOverride: licData.admin_valid_until_override,
            currentPeriodEnd: licData.current_period_end,
            trialEndsAt: licData.trial_ends_at
        };

        return { user, license };
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            {editingItem && (
                <EditLicenseModal 
                    user={editingItem.user} 
                    license={editingItem.license} 
                    onClose={() => setEditingItem(null)} 
                    onUpdate={() => loadUsers(true)} 
                />
            )}
            
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Search - Takes up more space */}
                    <div className="md:col-span-4">
                        <FormField label="Search">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <Input 
                                    placeholder="Name, Email..." 
                                    value={filters.q} 
                                    onChange={e => setFilters({...filters, q: e.target.value})}
                                    className="pl-9"
                                />
                            </div>
                        </FormField>
                    </div>

                    {/* Filters - Compact */}
                    <div className="md:col-span-2">
                        <FormField label="Plan">
                            <Select value={filters.plan} onChange={e => setFilters({...filters, plan: e.target.value})}>
                                <option value="all">Alle</option>
                                {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField label="Status">
                            <Select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                                <option value="all">Alle</option>
                                <option value="active">Bezahlt</option>
                                <option value="trial">Trial</option>
                                <option value="past_due">Offen</option>
                                <option value="canceled">Gekündigt</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField label="Engagement">
                            <Select value={filters.engagement} onChange={e => setFilters({...filters, engagement: e.target.value})}>
                                <option value="all">Alle</option>
                                <option value="engaged">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField label="Firma (Text)">
                            <Input 
                                placeholder="Firma..." 
                                value={filters.company} 
                                onChange={e => setFilters({...filters, company: e.target.value})} 
                            />
                        </FormField>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => loadUsers(true)} icon={<Filter className="w-4 h-4" />}>
                        Filter anwenden
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3"><H5>Nutzer</H5></th>
                                <th className="px-6 py-3"><H5>Plan</H5></th>
                                <th className="px-6 py-3 text-center"><H5>Status</H5></th>
                                <th className="px-6 py-3 text-right sticky right-0 bg-gray-50/50 z-10 w-[110px] shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.1)]"><H5>Aktionen</H5></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map(item => {
                                const { user, license } = getItemData(item);
                                const hasStripe = !!user.stripeCustomerId;
                                
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 group transition-colors">
                                        <td className="px-6 py-3">
                                            <Label className="block text-gray-900">{user.name}</Label>
                                            <Small className="text-gray-400 font-mono mt-0.5 block">{user.email}</Small>
                                            {user.billingAddress?.companyName && <Small className="text-gray-500 block font-bold">{user.billingAddress.companyName}</Small>}
                                        </td>
                                        <td className="px-6 py-3 align-middle">
                                            <div className="flex flex-col gap-1 items-start">
                                                <Label className="text-xs text-gray-700">{license?.planTier || 'Free'}</Label>
                                                {getRemainingTimeBadge(license)}
                                                <Small className="text-gray-400 font-medium mt-0.5">
                                                    Gültig bis: {license?.validUntil ? new Date(license.validUntil).toLocaleDateString('de-DE') : '—'}
                                                </Small>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center align-middle">
                                            {getPaymentBadge(license)}
                                        </td>
                                        <td className="px-6 py-3 text-right align-middle sticky right-0 bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.1)]">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit Button: Blue Theme */}
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-8 w-8 px-0 rounded-md border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all"
                                                    onClick={() => setEditingItem({ user, license })}
                                                    title="Lizenz bearbeiten"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                
                                                {/* Delete Button: Red Theme (Active) / Gray (Disabled) */}
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={deletingId === user.id || hasStripe}
                                                    className={`h-8 w-8 px-0 rounded-md transition-all ${
                                                      hasStripe 
                                                        ? 'border border-gray-100 bg-gray-50 text-gray-300 opacity-60 cursor-not-allowed' 
                                                        : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                    title={hasStripe ? "Löschen verboten: Stripe-Konto aktiv" : "Nutzer löschen"}
                                                >
                                                    {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin"/> :
                                                  (hasStripe ? <Lock className="w-4 h-4" /> : <Trash className="w-4 h-4" />)}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-400 font-medium italic">
                                        <Small>Keine Nutzer gefunden.</Small>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Load More */}
                {(cursor || loading) && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <Button 
                            variant="secondary" 
                            onClick={() => loadUsers(false)} 
                            isLoading={loading}
                            disabled={!cursor}
                            icon={<ChevronDown className="w-4 h-4" />}
                        >
                            {loading ? 'Lade Daten...' : 'Mehr laden'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
