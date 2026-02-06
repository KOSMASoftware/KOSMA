import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Send, Eye, MousePointer, AlertCircle } from 'lucide-react';

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
                // Note: This is a rough aggregate. For precise unique rates, we'd need distinct counts.
                const { data: eventCounts } = await supabase.rpc('get_marketing_stats'); 
                // Fallback if RPC doesn't exist (using multiple queries for safety in this prototype)
                
                // We'll use direct counts for simplicity in this prototype phase
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
                <h3 className="text-2xl font-black text-gray-900">{loading ? '-' : stats.sent}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Sent</p>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-green-50 text-green-600 rounded-full">
                    <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">{loading ? '-' : calculateRate(stats.opens, stats.sent)}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Open Rate</p>
                <span className="text-[9px] text-gray-400 mt-1">({stats.opens} events)</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-purple-50 text-purple-600 rounded-full">
                    <MousePointer className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">{loading ? '-' : calculateRate(stats.clicks, stats.sent)}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Click Rate</p>
                <span className="text-[9px] text-gray-400 mt-1">({stats.clicks} events)</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-full">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">{loading ? '-' : calculateRate(stats.bounces, stats.sent)}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Bounce Rate</p>
                <span className="text-[9px] text-gray-400 mt-1">({stats.bounces} events)</span>
            </div>
        </div>
    );
};