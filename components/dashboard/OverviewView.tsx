
import React, { useMemo } from 'react';
import { User, License, Invoice } from '../../types';
import { Zap, FileText, Download, ChevronRight, CreditCard, Star, Trophy, Medal, Play, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardTabs } from './DashboardTabs';
import { useLearningRewards } from '../../hooks/useLearningRewards';

// --- HELPER: Badge Logic ---
const normalizeBadge = (badge: string | null): string => {
    const b = badge?.toLowerCase() || '';
    if (b === 'expert') return 'Expert';
    if (b === 'skilled') return 'Skilled';
    return 'Novice';
};

const BadgeIcon = ({ type, className }: { type: string, className?: string }) => {
    switch (type) {
        case 'Novice': return <Star className={className} />;
        case 'Skilled': return <Medal className={className} />;
        case 'Expert': return <Trophy className={className} />;
        default: return <Star className={className} />;
    }
};

export const OverviewView: React.FC<{ user: User, licenses: License[], invoices: Invoice[] }> = ({ user, licenses, invoices }) => {
    const activeLicense = licenses[0];
    
    // Fetch Learning Data
    const { data: learningData, loading: learningLoading } = useLearningRewards();

    const daysRemaining = useMemo(() => {
        if (!activeLicense?.validUntil) return null;
        const diff = new Date(activeLicense.validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [activeLicense]);

    // Calculate Learning State
    const badge = normalizeBadge(learningData?.global.current_badge || null);
    const nextBadge = learningData?.global.next_badge || 'Expert';
    const coursesToNext = learningData?.global.courses_to_next_badge || 0;
    
    // Determine Continue Link (Deep Link to first incomplete course)
    const continueCourse = learningData?.courses.find(c => !c.course_completed) || learningData?.courses[0];
    const continueUrl = continueCourse?.continue_url || '/learning';

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Welcome, {user.name}</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Production Dashboard</p>
                </div>
            </div>
            
            <DashboardTabs />
            
            {/* Top Row: Status & Action - 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* 1. Subscription Status (White Card) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl group-hover:bg-brand-100 transition-colors duration-500"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                             <div className={`p-3 rounded-xl ${activeLicense?.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-500'}`}>
                                <Zap className="w-6 h-6" />
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                activeLicense?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-700'
                             }`}>
                                {activeLicense?.status || 'No License'}
                             </span>
                        </div>
                        
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Plan</h3>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{activeLicense?.planTier || 'Free'}</p>
                            {activeLicense?.validUntil && (
                                <p className="text-xs text-gray-500 mt-1 font-bold">
                                    Valid until {new Date(activeLicense.validUntil).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between relative z-10">
                        <div>
                            <span className="block text-xl font-black text-gray-900 leading-none">{daysRemaining ?? '∞'}</span>
                            <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-wide">Days left</span>
                        </div>
                        <Link to="/dashboard/subscription" className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm">
                            Manage <ChevronRight className="w-3.5 h-3.5"/>
                        </Link>
                    </div>
                </div>

                {/* 2. Learning Snapshot (Now Light Card for Consistency) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                    {/* Decorative Blob (Blue/Brand to differentiate slightly from Subscription) */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500"></div>
                    
                    {learningLoading ? (
                        <div className="flex-1 flex items-center justify-center opacity-50 text-sm font-bold text-gray-400">
                            Loading Campus...
                        </div>
                    ) : (
                        <>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                     <div className="p-3 rounded-xl bg-blue-50 text-brand-600">
                                        <BadgeIcon type={badge} className="w-6 h-6" />
                                     </div>
                                     <Link to="/dashboard/learning" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                        Campus
                                     </Link>
                                </div>
                                
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Rank</h3>
                                    <p className="text-2xl font-black text-gray-900 tracking-tight">{badge}</p>
                                    <p className="text-xs text-gray-500 mt-1 font-bold">
                                        {coursesToNext > 0 
                                            ? `${coursesToNext} courses to ${nextBadge}`
                                            : "Highest rank achieved!"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <div>
                                    <Link to="/dashboard/learning" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                                        View Rewards
                                    </Link>
                                </div>
                                <Link 
                                    to={continueUrl} 
                                    className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-sm"
                                >
                                    Continue <Play className="w-3 h-3 fill-current" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Row: History (Full Width) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" /> Recent Invoices
                    </h3>
                    <Link to="/dashboard/subscription" className="text-xs font-bold text-brand-500 hover:text-brand-700">
                        View All
                    </Link>
                </div>
                
                {invoices.length > 0 ? (
                    <div className="space-y-3">
                        {invoices.slice(0, 3).map(inv => (
                            <div key={inv.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{new Date(inv.date).toLocaleDateString()}</p>
                                    <p className="font-bold text-gray-900 text-sm">{inv.amount.toFixed(2)} €</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                        inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {inv.status}
                                    </span>
                                    {inv.pdfUrl && inv.pdfUrl !== '#' && (
                                        <a 
                                            href={inv.pdfUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-all"
                                            title="Download Invoice"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
                        <div className="p-4 bg-gray-50 rounded-full mb-3 border border-gray-100"><CreditCard className="w-8 h-8 opacity-20" /></div>
                        No payment history yet.
                    </div>
                )}
            </div>
        </div>
    );
};
