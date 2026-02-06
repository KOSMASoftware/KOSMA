import React, { useEffect, useState } from 'react';
import { Zap, Clock, Users, Mail, Activity, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

const AUTOMATIONS = [
    { 
        name: "Signup / Aktivierung", 
        audience: "Noch nie eingeloggt", 
        trigger: "bestehend", 
        emails: "signup_reminder_1, signup_reminder_2, signup_reminder_3" 
    },
    { 
        name: "Trial", 
        audience: "Trial aktiv", 
        trigger: "bestehend", 
        emails: "trial_activation, trial_reminder, trial_expired" 
    },
    { 
        name: "Inaktivität", 
        audience: "Eingeloggt, aber inaktiv", 
        trigger: "bestehend", 
        emails: "inactivity_*" 
    },
    { 
        name: "Konto‑Löschung – Warnung 1", 
        audience: "Nie gekauft + ≥11 Monate keine Aktivität", 
        trigger: "Datum", 
        emails: "account_deletion_warning_1" 
    },
    { 
        name: "Konto‑Löschung – Warnung 2", 
        audience: "Nie gekauft + ≥12 Monate keine Aktivität", 
        trigger: "Datum", 
        emails: "account_deletion_warning_2" 
    },
    { 
        name: "Konto‑Löschung – Aktion", 
        audience: "Nie gekauft + ≥12 Monate keine Aktivität", 
        trigger: "Frist abgelaufen", 
        emails: "ACTION: account-delete-job" 
    },
    { 
        name: "Monats → Jahres‑Upsell", 
        audience: "Aktive Monatskunden, ≥3 Perioden", 
        trigger: "bestehend", 
        emails: "monthly_to_yearly_offer" 
    },
    { 
        name: "Kündigung", 
        audience: "Gekündigt", 
        trigger: "Kündigung", 
        emails: "cancellation_confirmation" 
    },
    { 
        name: "Reaktivierung", 
        audience: "Gekündigt", 
        trigger: "bestehend", 
        emails: "reactivation_offer" 
    },
    { 
        name: "Tipps & Tricks", 
        audience: "Alle", 
        trigger: "1×/Monat", 
        emails: "monthly_tips" 
    }
];

interface AutomationStats {
    lastRun: string | null;
    lastSent: string | null;
    sent7d: number;
}

export const AutomationsList: React.FC = () => {
    const [statsMap, setStatsMap] = useState<Record<string, AutomationStats>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // 1. Fetch recent jobs (Last 50) for "Last Run"
                const { data: jobs } = await supabase
                    .from('marketing_jobs')
                    .select('template_name, created_at, status')
                    .order('created_at', { ascending: false })
                    .limit(100);

                // 2. Fetch recent messages (Last 7 days) for "Last Sent" & "Volume"
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                const { data: messages } = await supabase
                    .from('email_messages')
                    .select('template_name, sent_at')
                    .gte('sent_at', sevenDaysAgo.toISOString())
                    .order('sent_at', { ascending: false });

                // 3. Map Data to Automation Config
                const newStats: Record<string, AutomationStats> = {};

                AUTOMATIONS.forEach(auto => {
                    // Normalize keys from config string (e.g. "signup_1, signup_2")
                    const keys = auto.emails.split(',').map(k => k.trim());
                    
                    // Match Logic: Check if any key matches the record's template_name
                    // We also handle wildcard '*' simple matching
                    const isMatch = (dbName: string) => {
                        if (!dbName) return false;
                        return keys.some(k => {
                            if (k.endsWith('*')) return dbName.startsWith(k.replace('*', ''));
                            return dbName === k;
                        });
                    };

                    // Find metrics
                    const lastJob = jobs?.find(j => isMatch(j.template_name));
                    const matchingMessages = messages?.filter(m => isMatch(m.template_name)) || [];
                    const lastMsg = matchingMessages[0]; // Ordered desc

                    newStats[auto.name] = {
                        lastRun: lastJob?.created_at || null,
                        lastSent: lastMsg?.sent_at || null,
                        sent7d: matchingMessages.length
                    };
                });

                setStatsMap(newStats);
            } catch (e) {
                console.error("Error loading automation stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const formatTime = (iso: string | null) => {
        if (!iso) return '—';
        const date = new Date(iso);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        return isToday 
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AUTOMATIONS.map((auto, idx) => {
                    const stat = statsMap[auto.name] || { lastRun: null, lastSent: null, sent7d: 0 };
                    
                    return (
                        <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group hover:border-brand-200 transition-all">
                            {/* Card Body */}
                            <div className="p-6 pb-2">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-16 h-16 text-brand-500" />
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className="text-lg font-black text-gray-900 mb-4 pr-8 leading-tight">{auto.name}</h4>
                                    
                                    <div className="flex items-start gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                        <span className="text-xs text-gray-600 font-mono break-all">{auto.emails}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{auto.audience}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>Trigger: {auto.trigger}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Live Status Bar */}
                            <div className="mt-auto bg-gray-50/80 border-t border-gray-100 p-3 px-6 grid grid-cols-3 gap-2 text-[10px] text-gray-500 font-medium">
                                <div className="flex flex-col items-start">
                                    <span className="uppercase text-[9px] font-black text-gray-400 tracking-wider mb-0.5 flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> Last Run
                                    </span>
                                    <span className={stat.lastRun ? "text-gray-900 font-bold" : "text-gray-400"}>
                                        {formatTime(stat.lastRun)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center border-l border-gray-200 pl-2">
                                    <span className="uppercase text-[9px] font-black text-gray-400 tracking-wider mb-0.5 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Last Mail
                                    </span>
                                    <span className={stat.lastSent ? "text-gray-900 font-bold" : "text-gray-400"}>
                                        {formatTime(stat.lastSent)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end border-l border-gray-200 pl-2">
                                    <span className="uppercase text-[9px] font-black text-gray-400 tracking-wider mb-0.5 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> 7d Vol
                                    </span>
                                    <span className={stat.sent7d > 0 ? "text-brand-600 font-black" : "text-gray-400"}>
                                        {stat.sent7d > 0 ? stat.sent7d : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};