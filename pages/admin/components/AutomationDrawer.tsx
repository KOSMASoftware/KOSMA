
import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Search, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { AutomationDef } from '../data/automationCatalog';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface AutomationDrawerProps {
    automation: AutomationDef;
    onClose: () => void;
}

// Helper to generate deep link to Elastic Email Editor
const getElasticTemplateUrl = (templateName: string) => {
    try {
        const token = `!!!${templateName}`;
        const encoded = btoa(token).replace(/=+$/g, "");
        return `https://app.elasticemail.com/marketing/templates/new/editor/${encoded}?page=1&perPage=25`;
    } catch (e) {
        return '#';
    }
};

export const AutomationDrawer: React.FC<AutomationDrawerProps> = ({ automation, onClose }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    const fetchLogs = async () => {
        if (!automation.templateName) return;
        
        setLoading(true);
        try {
            let query = supabase
                .from('email_messages')
                .select('*')
                .eq('template_name', automation.templateName)
                .order('sent_at', { ascending: false })
                .limit(50);

            if (searchEmail) {
                query = query.ilike('to_email', `%${searchEmail}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setLogs(data || []);
        } catch (e) {
            console.error("Fetch Logs Error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [automation, searchEmail]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer Panel */}
            <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{automation.name}</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                automation.type === 'transactional' ? 'bg-blue-100 text-blue-700' : 
                                automation.type === 'journey' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {automation.type}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <span>{automation.id} • {automation.templateName || 'No Template'}</span>
                            {automation.templateName && (
                                <a 
                                    href={getElasticTemplateUrl(automation.templateName)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-brand-500 transition-colors"
                                    title="Edit Template in Elastic Email"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Configuration Section */}
                <div className="p-6 border-b border-gray-100 grid grid-cols-3 gap-6 bg-white">
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Trigger</span>
                        <p className="text-sm font-bold text-gray-900">{automation.trigger}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Frequency</span>
                        <p className="text-sm font-bold text-gray-900">{automation.frequency}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dedupe Key</span>
                        <p className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 break-all">{automation.dedupe}</p>
                    </div>
                    <div className="col-span-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Condition</span>
                        <p className="text-sm font-medium text-gray-700 bg-amber-50/50 border border-amber-100 px-3 py-2 rounded-lg">
                            {automation.condition}
                        </p>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            Letzte 50 Sendungen <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{logs.length}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="relative w-48">
                                <Search className="w-3 h-3 absolute left-3 top-2.5 text-gray-400" />
                                <Input 
                                    className="h-8 pl-8 text-xs bg-gray-50 border-gray-200" 
                                    placeholder="Filter email..."
                                    value={searchEmail}
                                    onChange={e => setSearchEmail(e.target.value)}
                                />
                            </div>
                            <Button variant="ghost" onClick={() => fetchLogs()} className="h-8 w-8 px-0" disabled={loading}>
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {!automation.templateName ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                <AlertCircle className="w-10 h-10 mb-4 opacity-20" />
                                <p className="text-sm font-bold">No Email Logs</p>
                                <p className="text-xs">This automation is a system job or action that does not send emails via the standard provider.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50">Time</th>
                                        <th className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50">Recipient</th>
                                        <th className="px-6 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest sticky top-0 bg-gray-50 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 group">
                                            <td className="px-6 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                                                {new Date(log.sent_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-xs font-bold text-gray-900">{log.to_email}</div>
                                                <div className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]" title={log.event_key}>
                                                    {log.event_key || '-'}
                                                </div>
                                                {log.status === 'failed' && log.meta?.error && (
                                                    <div className="mt-1 text-[10px] text-red-600 font-mono bg-red-50 p-1 rounded border border-red-100 truncate max-w-[200px]">
                                                        {log.meta.error}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                                    log.status === 'sent' 
                                                        ? 'bg-green-50 text-green-700 border-green-100' 
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    {log.status === 'sent' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-400 text-sm italic">Keine Einträge gefunden (letzte 50).</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
