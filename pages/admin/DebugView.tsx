import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { History, RefreshCw, ClipboardCopy } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';

export const DebugView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = async () => {
        setLoading(true);
        const { data } = await supabase.from('stripe_events').select('*').order('created_at', { ascending: false }).limit(20);
        if (data) setEvents(data);
        setLoading(false);
    };

    useEffect(() => { refresh(); }, []);

    const getEmailOrCustomer = (payload: any) => {
        const obj = payload?.data?.object;
        if (!obj) return '—';
        
        return obj.customer_email || 
               obj.receipt_email || 
               obj.email || 
               obj.customer_details?.email || 
               obj.billing_details?.email || 
               obj.customer || 
               '—';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex justify-between items-center mb-8 px-4"><h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><History className="w-6 h-6 text-gray-400" /> Stripe Logs</h3><button onClick={refresh} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button></div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email / Customer</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.map(ev => (
                            <tr key={ev.id} className="hover:bg-gray-50/50">
                                <td className="px-8 py-5 font-mono text-xs text-brand-600 font-black">{ev.type}</td>
                                <td className="px-8 py-5 text-xs font-bold text-gray-700">{getEmailOrCustomer(ev.payload)}</td>
                                <td className="px-8 py-5 text-xs font-bold text-gray-600">{new Date(ev.created_at).toLocaleString()}</td>
                                <td className="px-8 py-5 text-right">
                                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify(ev.payload))} className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200">
                                        <ClipboardCopy className="w-3 h-3 inline mr-1"/> JSON
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};