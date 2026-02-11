
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { X, Loader2, Search, AlertCircle, Check, Clock } from 'lucide-react';
import { MarketingJobRecipient } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { H3, H5, Label, Small } from '../../../components/ui/Typography';

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
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <H3>Job Recipients</H3>
                        <H5 className="mt-1">ID: {jobId}</H5>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400"/></button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input 
                            placeholder="Search email..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
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
                                    <th className="px-6 py-3"><H5>Email</H5></th>
                                    <th className="px-6 py-3"><H5>Status</H5></th>
                                    <th className="px-6 py-3"><H5>Info / Error</H5></th>
                                    <th className="px-6 py-3 text-right"><H5>Time</H5></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(r => (
                                    <tr key={r.user_id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3">
                                            <Label className="text-gray-700">{r.email}</Label>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(r.status)}
                                                <Label className="text-xs uppercase">{r.status}</Label>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Small className="font-mono text-red-600 max-w-xs truncate block">
                                                {r.error || r.skip_reason || '-'}
                                            </Small>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Small className="text-gray-400 font-mono">
                                                {r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : '-'}
                                            </Small>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic"><Small>No recipients found.</Small></td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
