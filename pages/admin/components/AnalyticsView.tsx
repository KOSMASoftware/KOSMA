
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Send, Eye, MousePointer, AlertCircle } from 'lucide-react';
import { H3, H5, Small } from '../../../components/ui/Typography';

export const AnalyticsView: React.FC = () => {
    const [stats, setStats] = useState({ sent: 0, opens: 0, clicks: 0, bounces: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // 1. Total Sent (from messages)
                const { count: sentCount } = await supabase
                    .from('email_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'sent');

                // 2. Events (opens, clicks, bounces)
                const { count: openCount } = await supabase
                    .from('email_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'open');

                const { count: clickCount } = await supabase
                    .from('email_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'click');

                const { count: bounceCount } = await supabase
                    .from('email_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'bounce');

                setStats({
                    sent: sentCount || 0,
                    opens: openCount || 0,
                    clicks: clickCount || 0,
                    bounces: bounceCount || 0
                });
            } catch (e) {
                console.error("Analytics fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const calculateRate = (part: number, total: number) => {
        if (!total || total === 0) return '0.0%';
        return ((part / total) * 100).toFixed(1) + '%';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-blue-50 text-blue-600 rounded-full">
                    <Send className="w-6 h-6" />
                </div>
                <H3>{loading ? '-' : stats.sent}</H3>
                <H5 className="mt-1">Total Sent</H5>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-green-50 text-green-600 rounded-full">
                    <Eye className="w-6 h-6" />
                </div>
                <H3>{loading ? '-' : calculateRate(stats.opens, stats.sent)}</H3>
                <H5 className="mt-1">Open Rate</H5>
                <Small className="mt-1">({stats.opens} events)</Small>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-purple-50 text-purple-600 rounded-full">
                    <MousePointer className="w-6 h-6" />
                </div>
                <H3>{loading ? '-' : calculateRate(stats.clicks, stats.sent)}</H3>
                <H5 className="mt-1">Click Rate</H5>
                <Small className="mt-1">({stats.clicks} events)</Small>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-full">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <H3>{loading ? '-' : calculateRate(stats.bounces, stats.sent)}</H3>
                <H5 className="mt-1">Bounce Rate</H5>
                <Small className="mt-1">({stats.bounces} events)</Small>
            </div>
        </div>
    );
};
