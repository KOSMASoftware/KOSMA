import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { X, Loader2, Search, AlertCircle, Check, Clock } from 'lucide-react';
import { MarketingJobRecipient } from '../../../types';

export const JobRecipientsModal: React.FC<{ jobId: string, onClose: () => void }> = ({ jobId, onClose }) => {
    const [recipients, setRecipients] = useState<MarketingJobRecipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchRecipients = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('marketing_job_recipients')
                .select('*')
                .eq('job_id', jobId)
                .order('status', { ascending: true }); // Failed/Queued first usually
            
            if (!error && data) {
                setRecipients(data as MarketingJobRecipient[]);
            }
            setLoading(false);
        };
        fetchRecipients();
    }, [jobId]);

    const filtered = recipients.filter(r => r.email.toLowerCase().includes(search.toLowerCase()));

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'sent': return <Check className="w-4 h-4 text-green-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'skipped': return <AlertCircle className="w-4 h-4 text-gray-400" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Job Recipients</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {jobId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-6 h-6 text-gray-400"/></button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search email..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-500 font-bold text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Info / Error</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(r => (
                                    <tr key={r.user_id} className="hover:bg-gray-50/50">
                                        <td className="px-8 py-4 font-bold text-gray-700 text-sm">{r.email}</td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(r.status)}
                                                <span className="text-xs font-bold uppercase">{r.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-mono text-red-600 max-w-xs truncate">
                                            {r.error || r.skip_reason || '-'}
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs text-gray-400 font-mono">
                                            {r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No recipients found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};