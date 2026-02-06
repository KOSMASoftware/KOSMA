import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';

interface OverviewStats {
    total_users: number;
    active_subscriptions: number;
    trial_active: number;
    no_plan: number;
    emails_7d_sent: number;
    emails_7d_total: number;
}

export const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase.functions.invoke('admin-overview-stats', { 
                    body: {} 
                });

                if (error) throw error;
                if (data && typeof data === 'object') {
                    setStats(data as OverviewStats);
                } else {
                    throw new Error("Invalid data format received from backend.");
                }
            } catch (err: any) {
                console.error("Stats fetch error:", err);
                setError(err.message || "Failed to load statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <AdminTabs />
                <div className="p-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-4">Loading KPI Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <AdminTabs />
                <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center gap-3 text-red-600 max-w-2xl mx-auto mt-10">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <span className="font-bold">{error}</span>
                </div>
            </div>
        );
    }

    // Safe access
    const s = stats || {
        total_users: 0,
        active_subscriptions: 0,
        trial_active: 0,
        no_plan: 0,
        emails_7d_sent: 0,
        emails_7d_total: 0
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Row 1 */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{s.total_users}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Subscriptions</p>
                    <h3 className="text-5xl font-black text-green-600 tracking-tighter">{s.active_subscriptions}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trial Active</p>
                    <h3 className="text-5xl font-black text-blue-600 tracking-tighter">{s.trial_active}</h3>
                </div>

                {/* Row 2 */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Plan (Free)</p>
                    <h3 className="text-5xl font-black text-gray-400 tracking-tighter">{s.no_plan}</h3>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Emails Sent (7d)</p>
                    <div>
                        <h3 className="text-5xl font-black text-brand-600 tracking-tighter">{s.emails_7d_sent}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-2">... of {s.emails_7d_total} total</p>
                    </div>
                </div>

                {/* Empty Placeholder */}
                <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 border-dashed flex items-center justify-center h-44">
                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest opacity-50">Reserved</span>
                </div>
            </div>
        </div>
    );
};