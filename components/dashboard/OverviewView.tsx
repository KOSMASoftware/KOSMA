
import React, { useMemo } from 'react';
import { User, License, Invoice } from '../../types';
import { Zap, FileText, Download, ChevronRight, CreditCard, Star, Trophy, Medal, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardTabs } from './DashboardTabs';
import { useLearningRewards } from '../../hooks/useLearningRewards';
import { Button } from '../ui/Button';
import { H1, H2, H3, H5, Label, Small } from '../ui/Typography';

const normalizeBadge = (badge: string | null): string => {
    const b = badge?.toLowerCase() || '';
    if (b === 'expert') return 'Expert';
    if (b === 'skilled') return 'Skilled';
    return 'Novice';
};

const toHashRouterPath = (url: string) => {
    if (!url) return '/learning';
    return url.replace(/^\/#/, '');
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
    const { data: learningData, loading: learningLoading } = useLearningRewards();

    const daysRemaining = useMemo(() => {
        if (!activeLicense?.validUntil) return null;
        const diff = new Date(activeLicense.validUntil).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }, [activeLicense]);

    const badge = normalizeBadge(learningData?.global.current_badge || null);
    const nextBadge = learningData?.global.next_badge || 'Expert';
    const coursesToNext = learningData?.global.courses_to_next_badge || 0;
    const continueCourse = learningData?.courses.find(c => !c.course_completed) || learningData?.courses[0];
    const continueUrl = continueCourse?.continue_url || '/learning';

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <H2>Welcome, {user.name}</H2>
                    <Label className="text-gray-500 mt-1 italic">Production Dashboard</Label>
                </div>
            </div>
            
            <DashboardTabs />
            
            {/* Top Row: Status & Action - 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* 1. Subscription Status */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl group-hover:bg-brand-100 transition-colors duration-500"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                             <div className={`p-3 rounded-xl ${activeLicense?.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-500'}`}>
                                <Zap className="w-6 h-6" />
                             </div>
                             <Small className={`px-2.5 py-1 rounded-lg font-bold ${
                                activeLicense?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-brand-100 text-brand-700'
                             }`}>
                                {activeLicense?.status || 'No License'}
                             </Small>
                        </div>
                        
                        <div>
                            <H5 className="text-gray-400 mb-1">Current Plan</H5>
                            <H2>{activeLicense?.planTier || 'Free'}</H2>
                            {activeLicense?.validUntil && (
                                <Small className="mt-1 block">
                                    Valid until {new Date(activeLicense.validUntil).toLocaleDateString()}
                                </Small>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between relative z-10">
                        <div>
                            <H2 className="leading-none">{daysRemaining ?? '∞'}</H2>
                            <H5 className="mt-1">Days left</H5>
                        </div>
                        <Button 
                            to="/dashboard/subscription" 
                            variant="secondary"
                            icon={<ChevronRight className="w-3.5 h-3.5"/>}
                        >
                            Manage
                        </Button>
                    </div>
                </div>

                {/* 2. Learning Snapshot */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500"></div>
                    
                    {learningLoading ? (
                        <div className="flex-1 flex items-center justify-center opacity-50">
                            <Label className="text-gray-400">Loading Campus...</Label>
                        </div>
                    ) : (
                        <>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                     <div className="p-3 rounded-xl bg-blue-50 text-brand-600">
                                        <BadgeIcon type={badge} className="w-6 h-6" />
                                     </div>
                                     <Link to="/dashboard/learning">
                                        <Small className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors cursor-pointer">
                                            Campus
                                        </Small>
                                     </Link>
                                </div>
                                
                                <div>
                                    <H5 className="text-gray-400 mb-1">Current Rank</H5>
                                    <H2>{badge}</H2>
                                    <Small className="mt-1 block">
                                        {coursesToNext > 0 
                                            ? `${coursesToNext} courses to ${nextBadge}`
                                            : "Highest rank achieved!"}
                                    </Small>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <div>
                                    <Link to="/dashboard/learning" className="hover:opacity-80 transition-opacity">
                                        <Label className="text-gray-400 font-bold cursor-pointer">View Rewards</Label>
                                    </Link>
                                </div>
                                <Button 
                                    to={toHashRouterPath(continueUrl)} 
                                    variant="primary"
                                    icon={<Play className="w-3 h-3 fill-current" />}
                                >
                                    Continue
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Row: History */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <H3 className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" /> Recent Invoices
                    </H3>
                    <Link to="/dashboard/subscription" className="hover:opacity-80">
                        <Label className="text-brand-500 cursor-pointer">View All</Label>
                    </Link>
                </div>
                
                {invoices.length > 0 ? (
                    <div className="space-y-3">
                        {invoices.slice(0, 3).map(inv => (
                            <div key={inv.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                                <div>
                                    <H5 className="text-gray-400 mb-0.5">{new Date(inv.date).toLocaleDateString()}</H5>
                                    <Label className="text-gray-900 font-bold">{inv.amount.toFixed(2)} €</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Small className={`px-2.5 py-1 rounded-lg font-bold ${
                                        inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {inv.status}
                                    </Small>
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
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                        <div className="p-4 bg-gray-50 rounded-full mb-3 border border-gray-100"><CreditCard className="w-8 h-8 opacity-20" /></div>
                        <Small className="font-medium italic">No payment history yet.</Small>
                    </div>
                )}
            </div>
        </div>
    );
};
