
import React, { useState } from 'react';
import { useLearningRewards } from '../../hooks/useLearningRewards';
import { DashboardTabs } from './DashboardTabs';
import { Loader2, Trophy, Star, Medal, ArrowRight, Play, CheckCircle2, Clock, Info, List, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { H1, H2, H3, H4, H5, Label, Small } from '../ui/Typography';

const toHashRouterPath = (url: string) => {
    if (!url) return '/learning';
    return url.replace(/^\/#/, '');
};

const BadgeIcon = ({ type, className }: { type: string | null, className?: string }) => {
    const badge = type?.toLowerCase() || 'novice';
    switch (badge) {
        case 'novice': return <Star className={className} />;
        case 'skilled': return <Medal className={className} />;
        case 'expert': return <Trophy className={className} />;
        default: return <Star className={className} />;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
        case 'granted': 
            return <Small className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold"><CheckCircle2 className="w-3 h-3"/> Granted</Small>;
        case 'pending': 
            return <Small className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold">Processing</Small>;
        case 'failed': 
            return <Small className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-lg font-bold">Failed</Small>;
        default: 
            return null;
    }
};

const getCourseTheme = (courseId: string) => {
    if (courseId.includes('budgeting')) return { border: 'border-l-amber-500', text: 'text-amber-600', bg: 'bg-amber-500' };
    if (courseId.includes('cashflow')) return { border: 'border-l-green-600', text: 'text-green-600', bg: 'bg-green-600' };
    if (courseId.includes('cost-control')) return { border: 'border-l-purple-600', text: 'text-purple-600', bg: 'bg-purple-600' };
    return { border: 'border-l-brand-500', text: 'text-brand-600', bg: 'bg-brand-500' };
};

export const LearningRewardsView: React.FC = () => {
    const { data, loading, error } = useLearningRewards();
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

    const toggleCourse = (id: string) => {
        setExpandedCourseId(prev => prev === id ? null : id);
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <DashboardTabs />
                <div className="flex flex-col justify-center items-center py-20 text-gray-400 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <H5>Loading Progress...</H5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <DashboardTabs />
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <div>
                        <Label className="text-red-700 font-bold">Failed to load learning data</Label>
                        <Small className="block mt-1 opacity-80">{error}</Small>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { global, courses, rewards } = data;
    const sortedCourses = [...courses].sort((a, b) => {
        if (a.course_completed === b.course_completed) {
            return b.completed_goals - a.completed_goals; 
        }
        return a.course_completed ? 1 : -1;
    });

    const normalizeBadge = (badge: string | null): string => {
        const b = badge?.toLowerCase() || '';
        if (b === 'expert') return 'Expert';
        if (b === 'skilled') return 'Skilled';
        return 'Novice';
    };

    const displayBadge = normalizeBadge(global.current_badge);
    const nextBadgeDisplay = global.next_badge || 'Expert';

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <H3>Learning & Rewards</H3>
            </div>
            
            <DashboardTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Header Stats / Badges */}
                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-100/50 transition-colors duration-500"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <H5 className="text-gray-400 mb-1">Total Progress</H5>
                            <div className="flex items-baseline gap-2">
                                <H3>{global.courses_completed_count}</H3>
                                <Label className="text-gray-400">/ 6 Courses</Label>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center border border-brand-100 shadow-sm">
                            <BadgeIcon type={displayBadge} className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between mb-2">
                            <Label className="text-brand-500 font-bold">{displayBadge}</Label>
                            <Label className="text-gray-300 font-bold">{nextBadgeDisplay}</Label>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100 relative">
                            <div 
                                className="h-full bg-brand-500 shadow-[0_0_10px_rgba(0,147,208,0.3)] relative z-10 transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, (global.courses_completed_count / 6) * 100)}%` }}
                            />
                            <div className="absolute inset-0 flex justify-between px-[16.66%] z-20">
                                {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-white/50"></div>)}
                            </div>
                        </div>
                        <Small className="mt-3 block text-gray-500 font-medium">
                            {global.courses_to_next_badge > 0 
                                ? `${global.courses_to_next_badge} more courses to reach ${nextBadgeDisplay} status.` 
                                : "You have reached the highest status!"}
                        </Small>
                    </div>
                </div>

                {/* 2. Next Milestone */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300"></div>
                    <div className="mb-4 w-12 h-12 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <H5 className="text-gray-400 mb-2">Next Reward</H5>
                    <Label className="text-gray-900 font-bold leading-tight max-w-[200px]">
                        {rewards.next_milestone?.description || "All rewards unlocked!"}
                    </Label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Your Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <H3 className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-brand-500" /> Your Courses
                    </H3>
                    
                    <div className="space-y-3">
                        {sortedCourses.map(course => {
                            const theme = getCourseTheme(course.course_id);
                            const isExpanded = expandedCourseId === course.course_id;
                            const progressPercent = Math.round((course.completed_goals / course.total_goals) * 100);
                            
                            let statusLabel = 'Not Started';
                            let statusColor = 'bg-gray-100 text-gray-500';
                            
                            if (course.course_completed) {
                                statusLabel = 'Completed';
                                statusColor = 'bg-green-50 text-green-700 border border-green-100';
                            } else if (course.completed_goals > 0) {
                                statusLabel = 'In Progress';
                                statusColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                            }

                            return (
                                <div 
                                    key={course.course_id} 
                                    className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-md border-gray-200 ring-1 ring-black/5' : 'hover:border-gray-200'}`}
                                >
                                    <div 
                                        className={`flex items-center justify-between p-4 cursor-pointer border-l-[4px] ${theme.border} bg-white hover:bg-gray-50/50 transition-colors`}
                                        onClick={() => toggleCourse(course.course_id)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                                            <Label className={`text-sm font-bold ${theme.text}`}>
                                                {course.course_title}
                                            </Label>
                                            
                                            <div className="flex items-center gap-3">
                                                <Small className={`px-2 py-0.5 rounded-md font-bold ${statusColor}`}>
                                                    {statusLabel}
                                                </Small>
                                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <List className="w-3 h-3" /> {course.completed_goals}/{course.total_goals}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pl-4 text-gray-300">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between text-xs text-gray-400">
                                                    <span>Last activity: {course.last_activity_at ? new Date(course.last_activity_at).toLocaleDateString() : 'Never'}</span>
                                                    {course.last_article_id && <span>Resume at: {course.last_article_id}</span>}
                                                </div>

                                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${theme.bg} transition-all duration-500`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-2">
                                                    {!course.course_completed ? (
                                                        <Button 
                                                            to={toHashRouterPath(course.continue_url)} 
                                                            variant="primary"
                                                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                                                        >
                                                            Continue Course
                                                        </Button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-4 py-2.5 rounded-xl border border-green-100">
                                                            <CheckCircle2 className="w-4 h-4" /> Course fully completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Rewards History */}
                <div className="space-y-6">
                    <H3 className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" /> Reward History
                    </H3>
                    
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
                        {rewards.history.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <Label className="text-gray-400 text-xs">No rewards yet.</Label>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {rewards.history.map((reward, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors rounded-xl group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <H5 className="text-gray-400">
                                                {new Date(reward.granted_at).toLocaleDateString()}
                                            </H5>
                                            <StatusBadge status={reward.status} />
                                        </div>
                                        <Label className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">
                                            {reward.reward_display_name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Info Hint */}
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3">
                        <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] font-medium text-gray-500 leading-relaxed">
                            <span className="font-bold text-gray-900 block mb-1">Processing Info</span>
                            Rewards are applied to your account automatically. Credits will appear on your next invoice. Pending rewards may take a few minutes to sync.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
