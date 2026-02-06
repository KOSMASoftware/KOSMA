import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MarketingJob } from '../../types';
import { Loader2, Plus, RefreshCw, List, Users } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { CRMView } from './components/CRMView';
import { AnalyticsView } from './components/AnalyticsView';
import { AutomationsList } from './components/AutomationsList';
import { SegmentsMonitor } from './components/SegmentsMonitor';
import { JobRecipientsModal } from './components/JobRecipientsModal';

export const MarketingView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'automations' | 'segments' | 'campaigns' | 'crm'>('automations');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<MarketingJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    
    const fetchJobs = async () => {
        setLoadingJobs(true);
        const { data } = await supabase
            .from('marketing_jobs')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setJobs(data as MarketingJob[]);
        setLoadingJobs(false);
    };

    useEffect(() => { if (activeTab === 'campaigns') fetchJobs(); }, [activeTab]);

    const handleRetry = async (jobId: string) => {
        if (!confirm("Retry all failed recipients for this job?")) return;
        try {
            await supabase.functions.invoke('marketing-retry', { body: { job_id: jobId } });
            alert("Retry queued.");
            fetchJobs();
        } catch (e: any) { alert("Error: " + e.message); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            
            {/* Global Analytics Header */}
            <div className="mb-12">
                <AnalyticsView />
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                    {(['automations', 'segments', 'campaigns', 'crm'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                ? 'bg-white text-gray-900 shadow-md transform scale-105' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. Automations Tab */}
            {activeTab === 'automations' && <AutomationsList />}

            {/* 2. Segments Tab */}
            {activeTab === 'segments' && <SegmentsMonitor />}

            {/* 3. Campaigns Tab */}
            {activeTab === 'campaigns' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Campaign Manager</h2>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-brand-500 transition-all shadow-lg"><Plus className="w-4 h-4" /> New Campaign</button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name & Template</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Segment</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingJobs ? (
                                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500"/></td></tr>
                                ) : jobs.map(job => {
                                    const stats = (job.stats as any)?.counts || {};
                                    const sent = stats.sent || 0;
                                    const failed = stats.failed || 0;
                                    const total = stats.total || (sent + failed + (stats.queued || 0)) || 1;

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-gray-900">{job.template_name}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">{new Date(job.created_at).toLocaleString()}</div>
                                                {job.dry_run && <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold rounded">DRY RUN</span>}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">{job.segment_key}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${job.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{job.status.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-xs font-medium">
                                                    <div className="flex gap-3 mb-1"><span className="text-green-600">Sent: {sent}</span><span className={failed > 0 ? "text-red-500 font-bold" : "text-gray-400"}>Fail: {failed}</span></div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${job.status === 'done_with_errors' ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (sent / total) * 100)}%` }} /></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setSelectedJobId(job.id)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors" title="View Recipients">
                                                        <List className="w-4 h-4" />
                                                    </button>
                                                    {(job.status === 'failed' || job.status === 'done_with_errors') && (
                                                        <button onClick={() => handleRetry(job.id)} className="p-2 text-brand-500 hover:bg-brand-50 rounded-xl transition-colors" title="Retry Failed">
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. CRM Tab */}
            {activeTab === 'crm' && <CRMView />}

            {/* Modals */}
            {isCreateModalOpen && <CreateCampaignModal onClose={() => setIsCreateModalOpen(false)} onCreated={() => { fetchJobs(); setActiveTab('campaigns'); }} />}
            {selectedJobId && <JobRecipientsModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
        </div>
    );
};