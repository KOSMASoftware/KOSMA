
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Search, Loader2, Send, Eye, MousePointer, Activity } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { H4, H5, Small } from '../../../components/ui/Typography';

export const CRMView: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const { data: messages } = await supabase.from('email_messages').select('*').eq('to_email', email);
            const { data: events } = await supabase.from('email_events').select('*').eq('to_email', email);

            const combined = [
                ...(messages || []).map(m => ({ ...m, type: 'outbound', date: new Date(m.sent_at) })),
                ...(events || []).map(e => ({ ...e, type: 'inbound', date: new Date(e.occurred_at) }))
            ].sort((a, b) => b.date.getTime() - a.date.getTime());

            setTimeline(combined);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <FormField label="Search User">
                            <Input 
                                placeholder="user@example.com" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </FormField>
                    </div>
                    <Button onClick={handleSearch} isLoading={loading} icon={<Search className="w-4 h-4" />}>
                        Search Timeline
                    </Button>
                </div>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
                {timeline.map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${
                                item.type === 'outbound' ? 'bg-blue-50 text-blue-600' : 
                                item.event_type === 'open' ? 'bg-green-50 text-green-600' :
                                item.event_type === 'bounce' ? 'bg-red-50 text-red-600' :
                                'bg-gray-50 text-gray-500'
                            }`}>
                                {item.type === 'outbound' ? <Send className="w-4 h-4" /> : 
                                 item.event_type === 'open' ? <Eye className="w-4 h-4" /> :
                                 item.event_type === 'click' ? <MousePointer className="w-4 h-4" /> :
                                 <Activity className="w-4 h-4" />}
                            </div>
                            {idx < timeline.length - 1 && <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>}
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <H5>{item.date.toLocaleString()}</H5>
                                <H5 className={`px-2 py-0.5 rounded ${item.type === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {item.type === 'outbound' ? 'Sent Message' : `Event: ${item.event_type}`}
                                </H5>
                            </div>
                            <H4 className="mb-1">{item.template_name || item.event_key || 'Unknown Event'}</H4>
                            {item.status === 'failed' && <Small className="text-red-500 font-bold mt-2">Delivery Failed</Small>}
                        </div>
                    </div>
                ))}
                {timeline.length === 0 && !loading && (
                    <div className="text-center text-gray-400 py-10">
                        <Small className="italic">No events found for this email.</Small>
                    </div>
                )}
            </div>
        </div>
    );
};
