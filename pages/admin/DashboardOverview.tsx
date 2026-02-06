import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminData } from './hooks/useAdminData';
import { AdminTabs } from './components/AdminTabs';

export const DashboardOverview: React.FC = () => {
    const { loading, stats } = useAdminData();
    if (loading) return <div className="p-8 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-brand-500" /></div>;
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <AdminTabs />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nutzer Gesamt</p><h3 className="text-4xl font-black text-gray-900">{stats.totalUsers}</h3></div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktive Abos</p><h3 className="text-4xl font-black text-green-600">{stats.activeLicenses}</h3></div>
            </div>
        </div>
    );
};