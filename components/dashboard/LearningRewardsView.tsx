
import React from 'react';
import { useLearningRewards } from '../../hooks/useLearningRewards';
import { DashboardTabs } from './DashboardTabs';
import { Loader2, Trophy, Star, Medal, ArrowRight, Play, CheckCircle2, Clock, Info, List, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const BadgeIcon = ({ type, className }: { type: string | null, className?: string }) => {
    // Normalizing input to handle potential backend casing differences
    const badge = type?.toLowerCase() || '';
    switch (badge) {
        case 'novice': return <Star className={className} />;
        case 'skilled': return <Medal className={className} />;
        case 'expert': return <Trophy className={className} />;
        default: return <GraduationCap className={className} />;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
        case 'granted': 
            return <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3"/> Granted</span>;
        case 'pending': 
            return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">Processing</span>;
        case 'failed': 
            return <span className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Failed</span>;
        default: 
            return null;
    }
};

export const LearningRewardsView: React.FC = () => {
    const { data, loading } = useLearningRewards();

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <DashboardTabs />
                <div className="flex flex-col justify-center items-center py-20 text-gray-400 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Loading Progress...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <DashboardTabs />
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">Could not load learning data. Please try again later.</p>
                </div>
            </div>
        );
    }

    const { global, courses, rewards } = data;
    
    // Sort courses: Active/In-Progress first, then Not Started, then Completed
    const sortedCourses = [...courses].sort((a, b) => {
        if (a.course_completed === b.course_completed) {
            // If completion status is same, prefer the one with more progress (but not done)
            return b.completed_goals - a.completed_goals; 
        }
        // Completed courses go to the bottom
        return a.course_completed ? 1 : -1;
    });

    // Enforce strict Badge Display names
    const displayBadge = global.current_badge || 'Novice'; 
    const nextBadgeDisplay = global.next_badge || 'Expert';

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Learning & Rewards</h1>
            </div>
            
            <DashboardTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Header Stats / Badges (Normalized to Dashboard Style) */}
                <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-brand-100/50 transition-colors duration-500"></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Progress</p>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                {global.courses_completed_count} <span className="text-gray-300 font-medium text-2xl">/</span> 6 <span className="text-lg text-gray-500 font-bold">Courses</span>
                            </h2>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center border border-brand-100 shadow-sm">
                            <BadgeIcon type={displayBadge} className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-brand-500 mb-2">
                            <span>{displayBadge}</span>
                            <span className="text-gray-300">{nextBadgeDisplay}</span>
                        </div>
                        {/* Normalized Progress Bar */}
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100 relative">
                            <div 
                                className="h-full bg-brand-500 shadow-[0_0_10px_rgba(0,147,208,0.3)] relative z-10 transition-all duration-1000 ease-out"
                                style={{ width: `${(global.courses_completed_count / 6) * 100}%` }}
                            />
                            {/* Step Dividers */}
                            <div className="absolute inset-0 flex justify-between px-[16.66%] z-20">
                                {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-white/50"></div>)}
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-gray-500">
                            {global.courses_to_next_badge > 0 
                                ? `${global.courses_to_next_badge} more courses to reach ${nextBadgeDisplay} status.` 
                                : "You have reached the highest status!"}
                        </p>
                    </div>
                </div>

                {/* 2. Next Milestone (Call to Action Card) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300"></div>
                    <div className="mb-4 w-12 h-12 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Next Reward</h3>
                    <p className="text-gray-900 font-bold text-sm leading-tight max-w-[200px]">
                        {rewards.next_milestone?.description || "All rewards unlocked!"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Open Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Play className="w-5 h-5 text-brand-500" /> Your Courses
                    </h3>
                    
                    <div className="space-y-4">
                        {sortedCourses.map(course => (
                            <div 
                                key={course.course_id} 
                                className={`group p-5 rounded-2xl border transition-all ${
                                    course.course_completed 
                                    ? 'bg-gray-50 border-gray-100 opacity-70 hover:opacity-100' 
                                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold text-base truncate ${course.course_completed ? 'text-gray-600 line-through decoration-gray-300' : 'text-gray-900'}`}>
                                                {course.course_title}
                                            </h4>
                                            {course.course_completed && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-2">
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                <List className="w-3.5 h-3.5" /> {course.completed_goals}/{course.total_goals} Goals
                                            </span>
                                            {/* Mini Progress */}
                                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${course.course_completed ? 'bg-green-500' : 'bg-brand-500'}`} 
                                                    style={{ width: `${(course.completed_goals / course.total_goals) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!course.course_completed && (
                                        <Link 
                                            to={course.continue_url} 
                                            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10 whitespace-nowrap"
                                        >
                                            Continue <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Rewards History */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" /> History
                    </h3>
                    
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1">
                        {rewards.history.length === 0 ? (
                            <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <span className="text-gray-400 text-xs font-bold">No rewards yet.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {rewards.history.map((reward, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors rounded-xl group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(reward.granted_at).toLocaleDateString()}
                                            </span>
                                            <StatusBadge status={reward.status} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                                            {reward.reward_display_name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Info Hint (Clean Style) */}
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
