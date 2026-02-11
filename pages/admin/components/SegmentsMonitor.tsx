
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Users, Loader2, RefreshCw } from 'lucide-react';
import { H2, H3, H4, H5, Label, Small } from '../../../components/ui/Typography';

const SEGMENT_GROUPS = [
    {
        title: 'Kundenstatus',
        keys: ['all_users', 'paying_monthly', 'paying_yearly', 'trial_active', 'no_plan']
    },
    {
        title: 'Risiko',
        keys: ['past_due', 'cancelled_or_expired']
    },
    {
        title: 'Aktivität',
        keys: ['never_logged_in']
    },
    {
        title: 'Kommunikation',
        keys: ['unsubscribed', 'bounce']
    }
];

const INITIAL_SEGMENT = 'all_users';

interface PreviewData {
    count_total: number;
    sample: any[];
}

export const SegmentsMonitor: React.FC = () => {
    const [selectedSegment, setSelectedSegment] = useState<string>(INITIAL_SEGMENT);
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
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Sidebar List */}
            <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <H5>Segment Groups</H5>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-6">
                    {SEGMENT_GROUPS.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            <H5 className="px-2 mb-2">{group.title}</H5>
                            <div className="space-y-1">
                                {group.keys.map(seg => (
                                    <button
                                        key={seg}
                                        onClick={() => setSelectedSegment(seg)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
                    ))}
                </div>
            </div>

            {/* Main Preview Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col relative">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <H2>{selectedSegment}</H2>
                        <H5 className="mt-1">Live Database Query</H5>
                    </div>
                    <button 
                        onClick={() => loadSegmentData(selectedSegment)} 
                        disabled={loading}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
                        <H5>Calculating Audience...</H5>
                    </div>
                ) : data ? (
                    <div className="flex-1 flex flex-col gap-6">
                        {/* KPI Card */}
                        <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex items-center gap-6">
                            <div className="p-3 bg-white rounded-xl shadow-sm text-brand-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <H3 className="text-brand-900">{data.count_total}</H3>
                                <Label className="text-brand-700 opacity-80">Active Recipients</Label>
                            </div>
                        </div>

                        {/* Sample Table */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <H5 className="mb-4">Users in Segment</H5>
                            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-1">
                                <div className="overflow-y-auto h-full">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100/50">
                                            <tr>
                                                <th className="px-6 py-3"><H5 className="text-[10px]">User ID</H5></th>
                                                <th className="px-6 py-3"><H5 className="text-[10px]">Email</H5></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.sample.length > 0 ? data.sample.map((u, i) => (
                                                <tr key={i} className="hover:bg-white transition-colors">
                                                    <td className="px-6 py-3"><Small className="font-mono">{u.user_id || u.id}</Small></td>
                                                    <td className="px-6 py-3"><Small>{u.email}</Small></td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={2} className="p-6 text-center italic opacity-50"><Small>No users found in this segment.</Small></td></tr>
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
