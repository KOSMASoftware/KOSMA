
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MarketingJob } from '../../types';
import { Loader2, Plus, RefreshCw, List, Users, Mail, Filter, ChevronDown, MousePointer, Eye, AlertCircle, Ban, XCircle } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { CRMView } from './components/CRMView';
import { AnalyticsView } from './components/AnalyticsView';
import { AutomationsList } from './components/AutomationsList';
import { SegmentsMonitor } from './components/SegmentsMonitor';
import { JobRecipientsModal } from './components/JobRecipientsModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { H3, H5, Label, Small, Paragraph } from '../../components/ui/Typography';
import { useSearchParams } from 'react-router-dom';

export const MarketingView: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'automations' | 'segments' | 'campaigns' | 'crm' | 'emails'>('automations');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobs, setJobs] = useState<MarketingJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);

    // --- Email Events State ---
    const [emailEvents, setEmailEvents] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [eventCursor, setEventCursor] = useState<string | null>(null);
    const [eventFilters, setEventFilters] = useState({
        days: 7,
        type: 'all',
        search: ''
    });

    // --- INIT ---
    useEffect(() => {
        // 1. Check URL Params for Tab
        const tabParam = searchParams.get('tab');
        if (tabParam === 'emails') setActiveTab('emails');
        else if (tabParam === 'campaigns') setActiveTab('campaigns');

        // 2. Check URL Params for Filters (days)
        const daysParam = searchParams.get('days');
        if (daysParam) {
            setEventFilters(prev => ({ ...prev, days: parseInt(daysParam, 10) || 7 }));
        }
    }, [searchParams]);

    // Initial Load for Campaigns
    const fetchJobs = async () => {
        setLoadingJobs(true);
        const { data } = await supabase
            .from('marketing_jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Added limit for safety
        if (data) setJobs(data as MarketingJob[]);
        setLoadingJobs(false);
    };

    useEffect(() => { 
        if (activeTab === 'campaigns') fetchJobs();
        if (activeTab === 'emails') loadEmailEvents(true);
    }, [activeTab]);

    // --- EMAIL EVENTS LOGIC ---
    const loadEmailEvents = async (reset = false) => {
        if (reset) {
            setEventsLoading(true);
            setEmailEvents([]);
            setEventCursor(null);
        }

        try {
            const { data, error } = await supabase.functions.invoke('admin-email-events-list', {
                body: {
                    days: eventFilters.days,
                    limit: 50,
                    cursor: reset ? null : eventCursor,
                    event_type: eventFilters.type === 'all' ? null : eventFilters.type,
                    q: eventFilters.search || null
                }
            });

            if (error) throw error;

            if (data) {
                // FIXED: Use data.items instead of data.events
                setEmailEvents(prev => reset ? (data.items || []) : [...prev, ...(data.items || [])]);
                setEventCursor(data.next_cursor || null);
            }
        } catch (err) {
            console.error('Failed to load email events', err);
        } finally {
            setEventsLoading(false);
        }
    };

    // Smart Polling for Campaigns
    useEffect(() => {
        if (activeTab !== 'campaigns') return;

        const hasActiveJobs = jobs.some(j => ['scheduled', 'running'].includes(j.status));
        let intervalId: any;

        if (hasActiveJobs) {
            intervalId = setInterval(async () => {
                const { data } = await supabase
                    .from('marketing_jobs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);
                
                if (data) setJobs(data as MarketingJob[]);
            }, 5000);
        }

        return () => { if (intervalId) clearInterval(intervalId); };
    }, [activeTab, jobs]);

    const handleRetry = async (jobId: string) => {
        if (!confirm("Retry all failed recipients for this job?")) return;
        try {
            await supabase.functions.invoke('marketing-retry', { body: { job_id: jobId } });
            alert("Retry queued.");
            fetchJobs();
        } catch (e: any) { alert("Error: " + e.message); }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'open': return <Eye className="w-3.5 h-3.5 text-green-500" />;
            case 'click': return <MousePointer className="w-3.5 h-3.5 text-purple-500" />;
            case 'bounce': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
            case 'complaint': return <Ban className="w-3.5 h-3.5 text-red-600" />;
            case 'unsub': return <XCircle className="w-3.5 h-3.5 text-gray-500" />;
            default: return <Mail className="w-3.5 h-3.5 text-blue-500" />;
        }
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
                <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl shadow-inner flex-wrap justify-center gap-1">
                    {(['automations', 'segments', 'campaigns', 'emails', 'crm'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => { setActiveTab(tab); setSearchParams({}); }} 
                            className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                                activeTab === tab 
                                ? 'bg-white text-gray-900 shadow-md transform scale-105' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                            }`}
                        >
                            {tab.replace('emails', 'Email Events')}
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
                        <H3>Campaign Manager</H3>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-brand-500 transition-all shadow-lg"><Plus className="w-4 h-4" /> New Campaign</button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-x-auto relative">
                        <table className="min-w-[900px] w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3"><H5>Name & Template</H5></th>
                                    <th className="px-6 py-3"><H5>Segment</H5></th>
                                    <th className="px-6 py-3"><H5>Status</H5></th>
                                    <th className="px-6 py-3"><H5>Progress</H5></th>
                                    <th className="px-6 py-3 text-right w-[120px] sticky right-0 bg-gray-50 z-20 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)]"><H5>Actions</H5></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingJobs ? (
                                    <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500"/></td></tr>
                                ) : jobs.map(job => {
                                    const raw = job.stats as any;
                                    const counts = raw?.counts ?? raw ?? {};
                                    const sent = counts.sent || 0;
                                    const failed = counts.failed || 0;
                                    const queued = counts.queued || 0;
                                    const total = counts.total || (sent + failed + queued) || 1;

                                    return (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-3">
                                                <Label className="text-gray-900 block">{job.template_name}</Label>
                                                <Small className="text-gray-400 font-mono mt-1 block">{new Date(job.created_at).toLocaleString()}</Small>
                                                {job.dry_run && <H5 className="inline-block mt-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px]">DRY RUN</H5>}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">{job.segment_key}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <H5 className={`inline-block px-3 py-1 rounded-full text-[10px] ${job.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{job.status.replace(/_/g, ' ')}</H5>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="text-xs font-medium">
                                                    <div className="flex gap-3 mb-1"><span className="text-green-600">Sent: {sent}</span><span className={failed > 0 ? "text-red-500 font-bold" : "text-gray-400"}>Fail: {failed}</span></div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${job.status === 'done_with_errors' ? 'bg-amber-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (sent / total) * 100)}%` }} /></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 transition-colors z-20 shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)]">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost"
                                                        className="h-8 w-8 px-0 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all shadow-sm"
                                                        onClick={() => setSelectedJobId(job.id)} 
                                                        title="View Recipients"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </Button>
                                                    {(job.status === 'failed' || job.status === 'done_with_errors') && (
                                                        <Button 
                                                            variant="ghost"
                                                            className="h-8 w-8 px-0 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 hover:border-amber-200 transition-all shadow-sm"
                                                            onClick={() => handleRetry(job.id)} 
                                                            title="Retry Failed"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </Button>
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

            {/* 4. Email Events Tab (NEW) */}
            {activeTab === 'emails' && (
                <div>
                    {/* Filters */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <Label className="mb-2 block text-xs">Zeitraum</Label>
                                <Select 
                                    value={eventFilters.days} 
                                    onChange={e => setEventFilters({...eventFilters, days: parseInt(e.target.value)})}
                                >
                                    <option value={7}>Letzte 7 Tage</option>
                                    <option value={30}>Letzte 30 Tage</option>
                                    <option value={90}>Letzte 90 Tage</option>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block text-xs">Event Type</Label>
                                <Select 
                                    value={eventFilters.type}
                                    onChange={e => setEventFilters({...eventFilters, type: e.target.value})}
                                >
                                    <option value="all">Alle Events</option>
                                    <option value="open">Open</option>
                                    <option value="click">Click</option>
                                    <option value="bounce">Bounce</option>
                                    <option value="unsub">Unsubscribe</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="delivered">Delivered</option>
                                </Select>
                            </div>
                            <div className="md:col-span-1">
                                <Label className="mb-2 block text-xs">Suche</Label>
                                <Input 
                                    placeholder="Email, Event Key..."
                                    value={eventFilters.search}
                                    onChange={e => setEventFilters({...eventFilters, search: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && loadEmailEvents(true)}
                                />
                            </div>
                            <div>
                                <Button onClick={() => loadEmailEvents(true)} className="w-full" icon={<Filter className="w-4 h-4"/>}>
                                    Filtern
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3"><H5>Zeit</H5></th>
                                    <th className="px-6 py-3"><H5>Event</H5></th>
                                    <th className="px-6 py-3"><H5>Empfänger</H5></th>
                                    <th className="px-6 py-3"><H5>Template / Key</H5></th>
                                    <th className="px-6 py-3 text-right"><H5>Details</H5></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {emailEvents.map((evt, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 group transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <Small className="font-mono text-gray-500">
                                                {new Date(evt.occurred_at).toLocaleString()}
                                            </Small>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                {getEventIcon(evt.event_type)}
                                                <Label className="text-sm capitalize">{evt.event_type}</Label>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-sm font-medium text-gray-900">{evt.to_email}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">{evt.template_name || 'System'}</span>
                                                {evt.event_key && <span className="text-[10px] text-gray-400 font-mono">{evt.event_key}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {evt.url && (
                                                <a href={evt.url} target="_blank" rel="noreferrer" className="text-xs text-brand-500 hover:underline truncate max-w-[200px] inline-block" title={evt.url}>
                                                    Link Target
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {emailEvents.length === 0 && !eventsLoading && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">Keine Events gefunden.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Load More */}
                        {(eventCursor || eventsLoading) && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => loadEmailEvents(false)} 
                                    isLoading={eventsLoading}
                                    disabled={!eventCursor}
                                    icon={<ChevronDown className="w-4 h-4" />}
                                >
                                    {eventsLoading ? 'Lade Daten...' : 'Mehr laden'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 5. CRM Tab */}
            {activeTab === 'crm' && <CRMView />}

            {/* Modals */}
            {isCreateModalOpen && <CreateCampaignModal onClose={() => setIsCreateModalOpen(false)} onCreated={() => { fetchJobs(); setActiveTab('campaigns'); }} />}
            {selectedJobId && <JobRecipientsModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
        </div>
    );
};
