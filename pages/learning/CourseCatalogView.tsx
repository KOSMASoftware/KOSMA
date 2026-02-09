
import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, List, Trophy, Gift } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { COURSES } from '../../data/learningCourses';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface CourseCatalogViewProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({ onSelectCourse }) => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<{courses_completed_count: number} | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
        supabase.functions.invoke('learning-progress-summary')
        .then(({ data, error }) => {
            if (!error && data) {
                setSummary({ courses_completed_count: data.courses_completed_count || 0 });
            }
        })
        .catch(console.warn);
    }
  }, [isAuthenticated]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Learning Campus</h1>
        <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl mx-auto">
          Master KOSMA with our structured courses. From basics to expert level.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm font-bold text-brand-600">
           <Gift className="w-4 h-4" />
           <span>Complete courses to get free months and license upgrades.</span>
        </div>
      </div>

      {/* REWARDS BANNER (Authenticated Only) */}
      {isAuthenticated && summary !== null && (
        <div className="mb-12 bg-brand-50 rounded-2xl border border-brand-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
            {/* Decorative Background Blur */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-200/40 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="p-4 bg-white rounded-2xl shadow-sm text-brand-500 shrink-0 relative z-10">
                <Trophy className="w-8 h-8" />
            </div>
            
            <div className="flex-1 text-center md:text-left relative z-10">
                <h2 className="text-xl font-black text-brand-900 uppercase tracking-tight mb-1">
                    Rewards Status: <span className="text-brand-600">{summary.courses_completed_count} / 6</span> courses completed
                </h2>
                <p className="text-sm font-medium text-brand-800/80 leading-relaxed max-w-2xl">
                    Complete 1 course = 1 month free for each course.<br/>
                    Complete all 6 courses = 3 months free + license upgrade (Course Completion Bonus).<br/>
                    <span className="text-xs opacity-70 mt-1 block">Important: Rewards only count for goals you explicitly mark as completed.</span>
                </p>
            </div>

            {/* Visual Indicator of 6 slots */}
            <div className="flex gap-2 relative z-10">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-3 h-3 rounded-full border border-brand-200 ${
                            i < summary.courses_completed_count ? 'bg-brand-500 border-brand-500 shadow-[0_0_8px_rgba(0,147,208,0.4)]' : 'bg-white'
                        }`} 
                    />
                ))}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((course, idx) => {
          const totalDuration = course.goals.reduce((acc, g) => acc + g.durationMin, 0);
          
          // Determine Course Color Theme & Border
          let themeColor = '#0093D0'; // Default Brand
          let borderClass = 'border-gray-100';

          if (course.id.includes('budgeting')) {
             themeColor = '#F59E0B'; // Amber
             borderClass = 'border-[#F59E0B]';
          } else if (course.id.includes('cashflow')) {
             themeColor = '#16A34A'; // Green
             borderClass = 'border-[#16A34A]';
          } else if (course.id.includes('cost-control')) {
             themeColor = '#9333EA'; // Purple
             borderClass = 'border-[#9333EA]';
          }

          return (
            <Card 
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              interactive
              enableLedEffect
              color={themeColor}
              className={`h-full flex flex-col items-start text-left p-6 group ${borderClass}`}
            >
              <div className="mb-6 w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center font-black text-xl group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                {idx + 1}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                {course.title}
              </h3>
              
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed flex-1">
                {course.teaser}
              </p>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                   <span className="flex items-center gap-1.5"><List className="w-3.5 h-3.5" /> {course.goals.length} Learning goals</span>
                   <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ~{totalDuration} min</span>
                </div>
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                   {course.languages.join(' · ')}
                </div>
                
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between w-full">
                   <span className="text-sm font-black text-brand-500 group-hover:underline decoration-2 underline-offset-4">Read more</span>
                   <button className="bg-gray-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
