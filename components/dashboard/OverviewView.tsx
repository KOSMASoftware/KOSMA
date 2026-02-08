import React, { useMemo } from 'react';
import { User, License, Invoice } from '../../types';
import { Zap, FileText, Download, ChevronRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardTabs } from './DashboardTabs';

export const OverviewView: React.FC<{ user: User, licenses: License[], invoices: Invoice[] }> = ({ user, licenses, invoices }) => {
    const activeLicense = licenses[0];
    const daysRemaining = useMemo(() => {
        if (!activeLicense?.validUntil) return null;
        const diff = new Date(activeLicense.validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [activeLicense]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Welcome, {user.name}</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Production Dashboard</p>
                </div>
            </div>
            
            <DashboardTabs />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl group-hover:bg-brand-100 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                             <div className={`p-4 rounded-2xl ${activeLicense?.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-500'}`}>
                                <Zap className="w-8 h-8" />
                             </div>
                             <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                activeLicense?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-700'
                             }`}>
                                {activeLicense?.status || 'No License'}
                             </span>
                        </div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Your Plan</h3>
                        <p className="text-3xl font-black text-gray-900">{activeLicense?.planTier || 'Free'}</p>
                        
                        {activeLicense?.validUntil && (
                             <p className="text-sm text-gray-500 mt-2 font-medium">
                                Valid until {new Date(activeLicense.validUntil).toLocaleDateString()}
                             </p>
                        )}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                        <div className="text-center">
                            <span className="block text-2xl font-black text-gray-900 leading-none">{daysRemaining ?? 0}</span>
                            <span className="block text-[10px] text-gray-400 font-bold uppercase mt-1">Days left</span>
                        </div>
                        <Link to="/dashboard/subscription" className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-gray-900 text-white text-xs font-black hover:bg-brand-500 transition-all shadow-lg shadow-gray-900/10">
                            Details <ChevronRight className="w-4 h-4"/>
                        </Link>
                    </div>
                </div>

                {/* History Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Recent Invoices</h3>
                        <FileText className="w-5 h-5 text-gray-300" />
                    </div>
                    {invoices.length > 0 ? (
                        <div className="space-y-4 flex-1">
                            {invoices.slice(0, 3).map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(inv.date).toLocaleDateString()}</p>
                                        <p className="font-black text-gray-900">{inv.amount.toFixed(2)} €</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {inv.status}
                                        </span>
                                        {inv.pdfUrl && inv.pdfUrl !== '#' && (
                                            <a 
                                                href={inv.pdfUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-gray-300 hover:text-brand-500 transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-400 italic">
                            <div className="p-4 bg-gray-50 rounded-full mb-4"><CreditCard className="w-10 h-10 opacity-20" /></div>
                            No payments yet.
                        </div>
                    )}
                    <Link to="/dashboard/subscription" className="mt-8 text-center text-xs font-black text-brand-500 uppercase tracking-widest hover:text-brand-600">
                        View Billing History
                    </Link>
                </div>
            </div>
        </div>
    );
};
