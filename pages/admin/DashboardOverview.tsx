
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';
import { H2, H3, H5, Small } from '../../components/ui/Typography';

interface OverviewStats {
    total_users: number;
    active_subscriptions: number;
    trial_active: number;
    no_plan: number;
    emails_7d_sent: number;
    emails_7d_total: number;
    budget_licenses: number;
    cost_control_licenses: number;
    production_licenses: number;
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
                    <H5 className="mt-4">Loading KPI Data...</H5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <AdminTabs />
                <div className="p-8 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-3 text-red-600 max-w-2xl mx-auto mt-10">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <H3 className="text-red-600">{error}</H3>
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
        emails_7d_total: 0,
        budget_licenses: 0,
        cost_control_licenses: 0,
        production_licenses: 0
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Row 1: High Level */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Total Users</H5>
                    <H2>{s.total_users}</H2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Active Subscriptions</H5>
                    <H2>{s.active_subscriptions}</H2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Trial Active</H5>
                    <H2 className="text-blue-600">{s.trial_active}</H2>
                </div>

                {/* Row 2: License Tiers */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Plan: Budget</H5>
                    <H2 className="text-amber-500">{s.budget_licenses}</H2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Plan: Cost Control</H5>
                    <H2 className="text-purple-600">{s.cost_control_licenses}</H2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Plan: Production</H5>
                    <H2 className="text-green-600">{s.production_licenses}</H2>
                </div>

                {/* Row 3: Misc & Health */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>No Plan (Free)</H5>
                    <H2 className="text-gray-400">{s.no_plan}</H2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
                    <H5>Emails Sent (7d)</H5>
                    <div>
                        <H2 className="text-brand-600">{s.emails_7d_sent}</H2>
                        <Small className="mt-2">... of {s.emails_7d_total} total</Small>
                    </div>
                </div>

                {/* Empty Placeholder */}
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed flex items-center justify-center min-h-[140px]">
                    <H5 className="text-gray-300 opacity-50">Reserved</H5>
                </div>
            </div>
        </div>
    );
};
