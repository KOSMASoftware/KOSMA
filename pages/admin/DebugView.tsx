
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { History, RefreshCw, ClipboardCopy, Trash2 } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';
import { H3, H5, Label, Small } from '../../components/ui/Typography';

export const DebugView: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [customerEmails, setCustomerEmails] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [cleanupLoading, setCleanupLoading] = useState(false);

    // 1. Helper: Payload robust parsen
    const parsePayload = (payload: any) => {
        if (typeof payload === 'string') {
            try {
                return JSON.parse(payload);
            } catch (e) {
                return {}; 
            }
        }
        return payload;
    };

    // 2. Helper: Customer ID extrahieren
    const getCustomerId = (payload: any): string | null => {
        const p = parsePayload(payload);
        const obj = p?.data?.object;
        if (!obj) return null;

        if (typeof obj.customer === 'string') return obj.customer;
        if (typeof obj.customer_id === 'string') return obj.customer_id;
        if (obj.customer_details && typeof obj.customer_details.customer === 'string') {
            return obj.customer_details.customer;
        }
        return null;
    };

    const refresh = async () => {
        setLoading(true);
        try {
            // 1. Events laden
            const { data: eventData } = await supabase
                .from('stripe_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (eventData) {
                setEvents(eventData);

                // 2. Customer IDs sammeln
                const customerIds = Array.from(new Set(
                    eventData.map(ev => getCustomerId(ev.payload)).filter(Boolean)
                )) as string[];

                // 3. Batch Lookup für Emails
                if (customerIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('email, stripe_customer_id')
                        .in('stripe_customer_id', customerIds);
                    
                    if (profiles) {
                        const emailMap = Object.fromEntries(
                            profiles.map(p => [p.stripe_customer_id, p.email])
                        );
                        setCustomerEmails(emailMap);
                    }
                }
            }
        } catch (e) {
            console.error("Debug fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async () => {
        if (!confirm("Möchtest du wirklich alle Logs löschen, die älter als 30 Tage sind?")) return;
        
        setCleanupLoading(true);
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - 30);
            
            const { error } = await supabase
                .from('stripe_events')
                .delete()
                .lt('created_at', dateThreshold.toISOString());

            if (error) throw error;
            
            alert("Alte Logs erfolgreich gelöscht.");
            refresh();
        } catch (e: any) {
            console.error("Cleanup error:", e);
            alert("Fehler beim Löschen: " + e.message);
        } finally {
            setCleanupLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    // 4. Anzeige-Logik
    const getDisplayInfo = (rawPayload: any) => {
        const p = parsePayload(rawPayload);
        const cid = getCustomerId(p);

        // A) Treffer in DB-Map?
        if (cid && customerEmails[cid]) {
            return customerEmails[cid];
        }

        // B) Fallback: Felder im Payload suchen
        const obj = p?.data?.object;
        if (!obj) return '—';
        
        return obj.customer_email || 
               obj.receipt_email || 
               obj.email || 
               obj.customer_details?.email || 
               obj.billing_details?.email || 
               cid || // Fallback auf ID (cus_...)
               '—';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex justify-between items-center mb-8 px-4">
                <H3 className="flex items-center gap-3">
                    <History className="w-6 h-6 text-gray-400" /> Stripe Logs
                </H3>
                <div className="flex gap-3">
                    <button 
                        onClick={handleCleanup} 
                        disabled={cleanupLoading || loading}
                        className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        <Trash2 className={`w-4 h-4 ${cleanupLoading ? 'animate-spin' : ''}`} />
                        Cleanup &gt;30d
                    </button>
                    <button 
                        onClick={refresh} 
                        disabled={loading}
                        className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3"><H5>Type</H5></th>
                            <th className="px-6 py-3"><H5>Email / Customer</H5></th>
                            <th className="px-6 py-3"><H5>Time</H5></th>
                            <th className="px-6 py-3 text-right"><H5>Data</H5></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.map(ev => {
                            const displayInfo = getDisplayInfo(ev.payload);
                            const isResolvedEmail = displayInfo.includes('@');

                            return (
                                <tr key={ev.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-3 font-mono text-xs text-brand-600 font-black">{ev.type}</td>
                                    <td className="px-6 py-3">
                                        <Label className={isResolvedEmail ? "text-gray-900 text-xs" : "text-gray-400 font-mono text-xs"}>
                                            {displayInfo}
                                        </Label>
                                    </td>
                                    <td className="px-6 py-3"><Label className="text-gray-600 text-xs">{new Date(ev.created_at).toLocaleString()}</Label></td>
                                    <td className="px-6 py-3 text-right">
                                        <H5 onClick={() => navigator.clipboard.writeText(JSON.stringify(parsePayload(ev.payload)))} className="cursor-pointer bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 inline-flex items-center text-[10px]">
                                            <ClipboardCopy className="w-3 h-3 inline mr-1"/> JSON
                                        </H5>
                                    </td>
                                </tr>
                            );
                        })}
                        {events.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400 italic">Keine Logs gefunden.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
