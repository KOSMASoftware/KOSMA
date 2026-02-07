import React, { useState, useMemo } from 'react';
import { Loader2, Search, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PlanTier, SubscriptionStatus, License, User } from '../../types';
import { useAdminData } from './hooks/useAdminData';
import { AdminTabs } from './components/AdminTabs';
import { EditLicenseModal } from './components/EditLicenseModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FormField } from '../../components/ui/FormField';

// --- HELPERS (Local to this view) ---

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
    if (!lic) return <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded border border-gray-200">Keine Info</span>;

    if (lic.status === SubscriptionStatus.TRIAL) {
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">Trial</span>;
    }

    const hasStripeSub = !!lic.stripeSubscriptionId?.startsWith('sub_');

    if (!hasStripeSub) {
      if (lic.status === SubscriptionStatus.CANCELED) {
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-100">Gekündigt</span>;
      }
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-200">Keine Stripe-Info</span>;
    }

    if (lic.status === SubscriptionStatus.PAST_DUE) {
      return <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded border border-red-100">Zahlung offen</span>;
    }
    if (lic.status === SubscriptionStatus.ACTIVE) {
      return <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-100">Bezahlt</span>;
    }
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-200">Keine Stripe-Info</span>;
};

export const UsersManagement: React.FC = () => {
    const { loading, users, licenses, refreshData } = useAdminData();
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [engagementFilter, setEngagementFilter] = useState<string>('all');
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const companies = useMemo(() => {
        const set = new Set(users.map(u => u.billingAddress?.companyName).filter(Boolean));
        return Array.from(set).sort();
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            // 1. Hide Admins
            if (u.role === 'admin') return false;

            const lic = licenses.find(l => l.userId === u.id);
            
            // Search
            const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || 
                                  u.name.toLowerCase().includes(search.toLowerCase()) ||
                                  (u.billingAddress?.companyName || '').toLowerCase().includes(search.toLowerCase());

            // Tier
            const matchesTier = tierFilter === 'all' || lic?.planTier === tierFilter;

            // Status Logic with enhanced 'Active' check
            const matchesStatus = statusFilter === 'all' || (() => {
                if (statusFilter === 'active') {
                    // Must be active AND have a Stripe Sub ID
                    if (lic?.status !== 'active') return false;
                    if (!lic?.stripeSubscriptionId?.startsWith('sub_')) return false;
                    
                    // Also check date validity
                    if (!lic?.validUntil) return false;
                    const validUntilDate = new Date(lic.validUntil);
                    const now = new Date();
                    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                    return validUntilDate.getTime() >= todayUTC.getTime();
                }

                if (lic?.status !== statusFilter) return false;

                // For 'trial', check dates
                if (statusFilter === 'trial') {
                    if (!lic?.validUntil) return false;
                    const validUntilDate = new Date(lic.validUntil);
                    const now = new Date();
                    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
                    return validUntilDate.getTime() >= todayUTC.getTime();
                }

                return true;
            })();

            // Engagement Logic
            const isEngaged = !!u.lastLoginAt;
            const matchesEngagement = engagementFilter === 'all' ||
                (engagementFilter === 'engaged' && isEngaged) ||
                (engagementFilter === 'inactive' && !isEngaged);

            // Company
            const matchesCompany = companyFilter === 'all' || u.billingAddress?.companyName === companyFilter;

            return matchesSearch && matchesTier && matchesStatus && matchesEngagement && matchesCompany;
        });
    }, [users, licenses, search, tierFilter, statusFilter, engagementFilter, companyFilter]);

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
                                    placeholder="Name, Email, Firma..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                    className="pl-9"
                                />
                            </div>
                        </FormField>
                    </div>

                    {/* Filters - Compact */}
                    <div className="md:col-span-2">
                        <FormField label="Plan">
                            <Select value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
                                <option value="all">Alle</option>
                                {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField label="Status">
                            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                            <Select value={engagementFilter} onChange={e => setEngagementFilter(e.target.value)}>
                                <option value="all">Alle</option>
                                <option value="engaged">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField label="Firma">
                            <Select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
                                <option value="all">Alle</option>
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </FormField>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl">
                <div className="overflow-x-auto rounded-2xl">
                    <table className="min-w-[900px] w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nutzer</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right sticky right-0 bg-gray-50/50 z-10 w-[110px] shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.1)]">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => {
                                const lic = licenses.find(l => l.userId === user.id);
                                const hasStripe = !!user.stripeCustomerId;
                                
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 group transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-bold text-sm text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-400 font-mono mt-0.5">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-3 align-middle">
                                            <div className="flex flex-col gap-1 items-start">
                                                <div className="text-xs font-bold text-gray-700">{lic?.planTier || 'Free'}</div>
                                                {getRemainingTimeBadge(lic)}
                                                <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                    Gültig bis: {lic?.validUntil ? new Date(lic.validUntil).toLocaleDateString('de-DE') : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center align-middle">
                                            {getPaymentBadge(lic)}
                                        </td>
                                        <td className="px-6 py-3 text-right align-middle sticky right-0 bg-white group-hover:bg-gray-50 transition-colors z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.1)]">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    className="h-8 w-8 p-0 rounded-lg bg-gray-900 border border-gray-900 hover:bg-gray-800" 
                                                    onClick={() => setEditingUser(user)}
                                                    title="Lizenz bearbeiten"
                                                >
                                                    <Edit className="w-5 h-5" color="#ffffff" />
                                                </Button>
                                                
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={deletingId === user.id || hasStripe}
                                                    className={`h-8 w-8 p-0 rounded-lg ${
                                                      hasStripe ? 'cursor-not-allowed bg-white border border-gray-100' : 'bg-red-600 border border-red-700 hover:bg-red-700'
                                                    }`}
                                                    title={hasStripe ? "Löschen verboten: Stripe-Konto aktiv" : "Nutzer löschen"}
                                                >
                                                    {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin text-white"/> :
                                                  (hasStripe ? <ShieldAlert className="w-5 h-5" color="#9CA3AF" /> : <Trash2 className="w-5 h-5" color="#ffffff" />)}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-400 text-sm font-medium italic">
                        Keine Nutzer gefunden.
                    </div>
                )}
            </div>
        </div>
    );
};