import React, { useState, useMemo } from 'react';
import { Loader2, Search, Edit, Trash2, RefreshCw, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PlanTier, SubscriptionStatus, License, User } from '../../types';
import { useAdminData } from './hooks/useAdminData';
import { AdminTabs } from './components/AdminTabs';
import { EditLicenseModal } from './components/EditLicenseModal';

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
            
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-10 space-y-6">
                {/* Search Bar */}
                <div className="flex items-center gap-5 border-b border-gray-50 pb-6">
                    <Search className="w-6 h-6 text-gray-300" />
                    <input type="text" placeholder="Schnellsuche (Name, Email, Firma)..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-lg font-bold placeholder:text-gray-300" />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Plan Filter */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Plan</label>
                        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-brand-500 transition-all">
                            <option value="all">Alle Pläne</option>
                            {Object.values(PlanTier).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-brand-500 transition-all">
                            <option value="all">Alle Status</option>
                            <option value="active">Bezahlt</option>
                            <option value="trial">Trial</option>
                            <option value="past_due">Zahlung offen</option>
                            <option value="canceled">Gekündigt</option>
                        </select>
                    </div>

                    {/* Engagement Filter */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Engagement</label>
                        <select value={engagementFilter} onChange={e => setEngagementFilter(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-brand-500 transition-all">
                            <option value="all">Alle</option>
                            <option value="engaged">Eingeloggt (Aktiv)</option>
                            <option value="inactive">Nie eingeloggt</option>
                        </select>
                    </div>

                    {/* Company Filter */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Firma</label>
                        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl font-bold text-sm outline-none border border-transparent focus:border-brand-500 transition-all">
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
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nutzer</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
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
                                        <div className="font-black text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-400 font-bold">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-6"><div className="flex flex-col gap-2 items-start"><div className="text-sm font-black">{lic?.planTier || 'Free'}</div>{getRemainingTimeBadge(lic)}</div></td>
                                    <td className="px-8 py-6 text-center">{getPaymentBadge(lic)}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => setEditingUser(user)} className="p-3 text-brand-500 hover:bg-brand-50 rounded-2xl transition-colors"><Edit className="w-5 h-5"/></button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                disabled={deletingId === user.id || hasStripe}
                                                className={`p-3 rounded-2xl transition-colors ${
                                                  hasStripe ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                                                }`}
                                                title={hasStripe ? "Löschen verboten: Stripe-Konto aktiv" : "Nutzer löschen"}
                                              >
                                                {deletingId === user.id ? <RefreshCw className="w-5 h-5 animate-spin"/> :
                                              (hasStripe ? <ShieldAlert className="w-5 h-5" /> : <Trash2 className="w-5 h-5"/>)}
                                            </button>
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