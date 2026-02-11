
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Zap, Route, Server, Search, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { AUTOMATION_CATALOG, AutomationDef } from '../data/automationCatalog';
import { AutomationDrawer } from './AutomationDrawer';
import { Button } from '../../../components/ui/Button';
import { H5, Label, Small } from '../../../components/ui/Typography';

interface AutomationStats {
    sent_7d: number;
    failed_7d: number;
    last_sent_at: string | null;
    last_failed_at: string | null;
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

export const AutomationsList: React.FC = () => {
    const [statsMap, setStatsMap] = useState<Record<string, AutomationStats>>({});
    const [loading, setLoading] = useState(true);
    const [selectedAuto, setSelectedAuto] = useState<AutomationDef | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch consolidated stats from backend function
                const { data, error } = await supabase.functions.invoke('admin-overview-stats', {
                    body: {} // default loads 7d
                });

                if (error) throw error;
                
                if (data && data.automation_stats) {
                    setStatsMap(data.automation_stats);
                }
            } catch (e) {
                console.error("Failed to load automation stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'transactional': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'journey': return <Route className="w-4 h-4 text-purple-500" />;
            default: return <Server className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusIndicator = (stat: AutomationStats | undefined, type: string) => {
        if (!stat && type === 'job') return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 block" title="No Data (System Job)" />;
        
        // Logic: Red if failures > 0, Green if sent > 0, Gray if inactive
        if (stat?.failed_7d && stat.failed_7d > 0) return <span className="w-2.5 h-2.5 rounded-full bg-red-500 block shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Errors detected" />;
        if (stat?.sent_7d && stat.sent_7d > 0) return <span className="w-2.5 h-2.5 rounded-full bg-green-500 block shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Active" />;
        
        return <span className="w-2.5 h-2.5 rounded-full bg-gray-200 block" title="Inactive (7d)" />;
    };

    const filteredList = AUTOMATION_CATALOG.filter(auto => 
        auto.name.toLowerCase().includes(search.toLowerCase()) || 
        auto.trigger.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search automations..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-shadow"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <H5 className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</H5>
                    <H5 className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Error</H5>
                    <H5 className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Idle</H5>
                </div>
            </div>

            {/* Master Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center"></th>
                            <th className="px-6 py-4"><H5>Automation</H5></th>
                            <th className="px-6 py-4"><H5>Trigger & Frequency</H5></th>
                            <th className="px-6 py-4"><H5>Last Sent</H5></th>
                            <th className="px-6 py-4"><H5>7d Volume</H5></th>
                            <th className="px-6 py-4 text-right"><H5>Action</H5></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredList.map(auto => {
                            const stat = statsMap[auto.templateName || ''] || { sent_7d: 0, failed_7d: 0, last_sent_at: null, last_failed_at: null };
                            
                            return (
                                <tr key={auto.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            {getStatusIndicator(stat, auto.type)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                auto.type === 'transactional' ? 'bg-blue-50 text-blue-600' :
                                                auto.type === 'journey' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {getTypeIcon(auto.type)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Label>{auto.name}</Label>
                                                    {auto.templateName && (
                                                        <a 
                                                            href={getElasticTemplateUrl(auto.templateName)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-gray-300 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Open Template in Elastic Email"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                <H5 className="mt-0.5">{auto.type}</H5>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Label className="text-xs text-gray-700 block">{auto.trigger}</Label>
                                        <H5 className="mt-0.5">{auto.frequency}</H5>
                                    </td>
                                    <td className="px-6 py-4">
                                        {stat.last_sent_at ? (
                                            <Small className="font-mono">
                                                {new Date(stat.last_sent_at).toLocaleDateString()} <span className="text-gray-400">{new Date(stat.last_sent_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            </Small>
                                        ) : (
                                            <Small className="text-gray-300 italic">—</Small>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 w-24">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-green-600">{stat.sent_7d}</span>
                                                <span className={stat.failed_7d > 0 ? "text-red-600" : "text-gray-300"}>{stat.failed_7d}</span>
                                            </div>
                                            {/* Mini Bar Chart */}
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, (stat.sent_7d / (stat.sent_7d + stat.failed_7d + 1)) * 100)}%` }}></div>
                                                <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (stat.failed_7d / (stat.sent_7d + stat.failed_7d + 1)) * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button 
                                            variant="secondary" 
                                            className="h-8 px-3 text-xs" 
                                            onClick={() => setSelectedAuto(auto)}
                                        >
                                            Inspect
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Drawer Overlay */}
            {selectedAuto && (
                <AutomationDrawer 
                    automation={selectedAuto} 
                    onClose={() => setSelectedAuto(null)} 
                />
            )}
        </div>
    );
};
