
import React from 'react';
import { useLearningRewards } from '../../hooks/useLearningRewards';
import { DashboardTabs } from './DashboardTabs';
import { Loader2, Trophy, Star, Medal, ArrowRight, Play, CheckCircle2, Clock, Info, List } from 'lucide-react';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';

const BadgeIcon = ({ type, className }: { type: string | null, className?: string }) => {
    switch (type?.toLowerCase()) {
        case 'novice': return <Star className={className} />;
        case 'skilled': return <Medal className={className} />;
        case 'expert': return <Trophy className={className} />;
        default: return <div className={`rounded-full border-2 border-dashed border-gray-200 ${className}`}></div>;
    }
};

const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
        case 'granted': return <span className="bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Applied</span>;
        case 'pending': return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Processing</span>;
        case 'failed': return <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Error</span>;
        default: return null;
    }
};

export const LearningRewardsView: React.FC = () => {
    const { data, loading } = useLearningRewards();

    if (loading || !data) {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                <DashboardTabs />
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
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
        return a.course_completed ? 1 : -1;
    });

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Learning & Rewards</h1>
            </div>
            
            <DashboardTabs />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Header Stats / Badges */}
                <Card className="col-span-1 md:col-span-2 p-6 flex flex-col justify-between h-full bg-gradient-to-br from-brand-900 to-brand-800 text-white border-none shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-brand-200 text-xs font-black uppercase tracking-widest mb-1">Your Progress</p>
                            <h2 className="text-3xl font-black">{global.courses_completed_count} / 6 <span className="text-lg text-brand-300 font-bold">Courses</span></h2>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                            <BadgeIcon type={global.current_badge || 'Novice'} className="w-8 h-8 text-yellow-400 drop-shadow-md" />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex justify-between text-xs font-bold text-brand-200 mb-2 uppercase tracking-wide">
                            <span>{global.current_badge || 'Starter'}</span>
                            <span>Next: {global.next_badge || 'Master'}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 relative">
                            <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.6)] relative z-10 transition-all duration-1000"
                                style={{ width: `${(global.courses_completed_count / 6) * 100}%` }}
                            />
                            {/* Steps markers */}
                            <div className="absolute inset-0 flex justify-between px-[16.66%] z-0">
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-px h-full bg-white/10"></div>
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-medium text-brand-100 opacity-80">
                            {global.courses_to_next_badge > 0 
                                ? `${global.courses_to_next_badge} more courses to reach ${global.next_badge} status.` 
                                : "You have reached the highest status!"}
                        </p>
                    </div>
                </Card>

                {/* 2. Next Milestone */}
                <Card className="p-6 bg-white flex flex-col justify-center items-center text-center h-full border-dashed border-2 border-brand-200">
                    <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Next Reward</h3>
                    <p className="text-gray-600 font-bold text-sm leading-tight max-w-[200px]">
                        {rewards.next_milestone?.description || "All rewards unlocked!"}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Open Courses */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Play className="w-5 h-5 text-brand-500" /> Your Courses
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {sortedCourses.map(course => (
                            <div 
                                key={course.course_id} 
                                className={`group p-5 rounded-2xl border transition-all ${
                                    course.course_completed 
                                    ? 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100' 
                                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-brand-200'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-bold text-base ${course.course_completed ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {course.course_title}
                                            </h4>
                                            {course.course_completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mt-2">
                                            <span className="flex items-center gap-1">
                                                <List className="w-3 h-3" /> {course.completed_goals}/{course.total_goals} Goals
                                            </span>
                                            {/* Progress Bar Mini */}
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${course.course_completed ? 'bg-green-500' : 'bg-brand-500'}`} 
                                                    style={{ width: `${(course.completed_goals / course.total_goals) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {!course.course_completed && (
                                        <Link 
                                            to={course.continue_url.replace('/learning', '/#/learning')} // Fix for hash router if needed, though raw link might work depending on setup
                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-lg shadow-gray-900/10 whitespace-nowrap"
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
                            <div className="p-8 text-center text-gray-400 text-xs italic font-medium">No rewards earned yet.</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {rewards.history.map((reward, idx) => (
                                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors rounded-xl">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                {new Date(reward.granted_at).toLocaleDateString()}
                                            </span>
                                            <StatusBadge status={reward.status} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-700 leading-tight">
                                            {reward.reward_display_name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Info Hint */}
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
                        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-blue-800/70 leading-relaxed">
                            <span className="font-bold block mb-1 text-blue-900">How Rewards work</span>
                            Rewards are automatically processed. Credits are applied to your upcoming invoices automatically. If a reward is "Processing", it may take a few minutes to appear in your billing history.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
