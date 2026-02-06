import React from 'react';
import { Send, Eye, AlertCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <Send className="w-12 h-12 text-brand-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">--</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Sent</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-green-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">-- %</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Open Rate</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-red-200 mb-4" />
                <h3 className="text-3xl font-black text-gray-900">-- %</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Bounce Rate</p>
            </div>
        </div>
    );
};