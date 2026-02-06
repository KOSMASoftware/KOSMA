import React, { useState, useEffect } from 'react';
import { liveSystemService, SystemCheckResult } from '../../services/liveSystemService';
import { Activity, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { AdminTabs } from './components/AdminTabs';

export const SystemHealthView: React.FC = () => {
    const [checks, setChecks] = useState<SystemCheckResult[]>([]);
    const [loading, setLoading] = useState(true);

    const runChecks = async () => {
        setLoading(true);
        const results = await Promise.all([
            liveSystemService.checkDatabaseConnection(),
            liveSystemService.checkAuthService()
        ]);
        setChecks(results);
        setLoading(false);
    };

    useEffect(() => { runChecks(); }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div><h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4"><Activity className="text-red-500 w-10 h-10" /> System Health</h1></div>
                <button onClick={runChecks} disabled={loading} className="p-5 bg-gray-900 text-white rounded-[1.5rem] flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-brand-500 transition-all"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Scan starten</button>
            </div>
            <div className="space-y-6">
                {checks.map((check, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${check.status === 'operational' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{check.status === 'operational' ? <CheckCircle className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}</div>
                            <div><div className="font-bold text-gray-900">{check.service}</div><div className="text-xs text-gray-500">{check.details || check.message}</div></div>
                        </div>
                        <div className="text-right"><div className="text-xs font-black uppercase tracking-widest">{check.status}</div><div className="text-xs text-gray-400 font-mono mt-1">{check.latency}ms</div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};