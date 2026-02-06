import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Users, Loader2, RefreshCw } from 'lucide-react';

const SEGMENTS = [
    'never_logged_in',
    'never_purchased',
    'trial_active',
    'trial_ending_3d',
    'inactivity_short',
    'inactivity_long',
    'monthly_3_periods',
    'yearly_active',
    'cancelled_or_expired',
    'deletion_warning_30d',
    'deletion_warning_7d',
    'monthly_tips',
    'opened',
    'clicked',
    'never_opened',
    'unsubscribed',
    'bounce'
];

interface PreviewData {
    count_total: number;
    sample: any[];
}

export const SegmentsMonitor: React.FC = () => {
    const [selectedSegment, setSelectedSegment] = useState<string>(SEGMENTS[0]);
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);

    const loadSegmentData = async (key: string) => {
        setLoading(true);
        setData(null);
        try {
            const { data: res, error } = await supabase.functions.invoke('marketing-preview', {
                body: { segment_key: key }
            });
            if (error) throw error;
            if (res.error) throw new Error(res.error);
            
            setData({
                count_total: res.count_total || 0,
                sample: res.sample || []
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Load initial on mount or selection change
    React.useEffect(() => {
        loadSegmentData(selectedSegment);
    }, [selectedSegment]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
            {/* Sidebar List */}
            <div className="w-full lg:w-1/3 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Available Segments</h3>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {SEGMENTS.map(seg => (
                        <button
                            key={seg}
                            onClick={() => setSelectedSegment(seg)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                selectedSegment === seg 
                                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {seg}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col relative">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedSegment}</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Live Database Query</p>
                    </div>
                    <button 
                        onClick={() => loadSegmentData(selectedSegment)} 
                        disabled={loading}
                        className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
                        <p className="text-xs font-black uppercase tracking-widest">Calculating Audience...</p>
                    </div>
                ) : data ? (
                    <div className="flex-1 flex flex-col gap-8">
                        {/* KPI Card */}
                        <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 flex items-center gap-6">
                            <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-500">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-brand-900">{data.count_total}</h3>
                                <p className="text-sm font-bold text-brand-700 opacity-80">Active Recipients</p>
                            </div>
                        </div>

                        {/* Sample Table */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Random Sample (Max 10)</h4>
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex-1">
                                <div className="overflow-y-auto h-full">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100/50 text-[10px] font-black uppercase text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">User ID</th>
                                                <th className="px-6 py-3">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs font-medium text-gray-600 divide-y divide-gray-100">
                                            {data.sample.length > 0 ? data.sample.map((u, i) => (
                                                <tr key={i} className="hover:bg-white transition-colors">
                                                    <td className="px-6 py-3 font-mono">{u.id}</td>
                                                    <td className="px-6 py-3">{u.email}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={2} className="p-6 text-center italic opacity-50">No users found in this segment.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};