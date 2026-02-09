
import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, List, Clock, Play, CheckCircle2 } from 'lucide-react';
import { LearningCourse } from '../../data/learningCourses';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface CourseOverviewViewProps {
  course: LearningCourse;
  onBack: () => void;
  onSelectGoal: (articleId: string) => void;
}

export const CourseOverviewView: React.FC<CourseOverviewViewProps> = ({ 
  course, 
  onBack, 
  onSelectGoal 
}) => {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<{completed: number, total: number, last_article_id?: string} | null>(null);
  
  const totalDuration = course.goals.reduce((acc, g) => acc + g.durationMin, 0);

  // Fetch progress if authenticated
  useEffect(() => {
    if (isAuthenticated) {
        supabase.functions.invoke('learning-progress-summary', {
            body: { course_id: course.id }
        }).then(({ data, error }) => {
            if (!error && data && data.courses && data.courses[course.id]) {
                const cData = data.courses[course.id];
                // Try to find the last touched article from data (if available in future)
                // For now, fallback to undefined or check if the API returns a global 'last_activity'
                const lastId = data.last_activity?.course_id === course.id ? data.last_activity.article_id : undefined;
                
                setProgress({
                    completed: cData.completed_goals_count || 0,
                    total: cData.total_goals_count || course.goals.length,
                    last_article_id: lastId
                });
            }
        }).catch(err => console.warn('[Overview] Progress fetch failed (best-effort)', err));
    }
  }, [course.id, isAuthenticated]);

  const percentage = progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-start justify-between gap-6 mb-6">
               <div>
                  <span className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Course Overview</span>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">{course.title}</h1>
                  <p className="text-lg text-gray-500 font-medium max-w-xl">{course.teaser}</p>
               </div>
               <div className="hidden md:block">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-500">
                     <GraduationCap className="w-7 h-7" />
                  </div>
               </div>
            </div>
            
            {/* Meta Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-600 mb-6">
               <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-brand-500" /> {course.goals.length} Learning goals
               </span>
               <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> ~{totalDuration} min Total
               </span>
            </div>

            {/* Authenticated Progress Bar */}
            {isAuthenticated && progress && (
               <div className="bg-white p-4 rounded-xl border border-brand-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                     <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                        <span>Progress</span>
                        <span className="text-brand-600">{percentage}% Completed</span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-brand-500 transition-all duration-1000 ease-out" 
                           style={{ width: `${percentage}%` }}
                        />
                     </div>
                  </div>
                  {progress.last_article_id && percentage < 100 && (
                     <button 
                        onClick={() => onSelectGoal(progress.last_article_id!)}
                        className="w-full md:w-auto px-5 py-2 bg-brand-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
                     >
                        Continue
                     </button>
                  )}
               </div>
            )}
         </div>

         <div className="divide-y divide-gray-100">
            {course.goals.map((goal, idx) => (
               <button 
                 key={goal.id} 
                 onClick={() => onSelectGoal(goal.articleId)}
                 className="w-full text-left p-4 md:px-6 md:py-4 hover:bg-gray-50 transition-colors flex items-center gap-6 group"
               >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 text-gray-400 font-black flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors">
                     {idx + 1}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{goal.title}</h4>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{goal.durationMin} min</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:border-brand-200 group-hover:bg-white transition-all">
                     <Play className="w-4 h-4 text-gray-300 group-hover:text-brand-500 ml-0.5" />
                  </div>
               </button>
            ))}
         </div>
         
         {!progress?.last_article_id && (
             <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                   onClick={() => onSelectGoal(course.goals[0].articleId)}
                   className="bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all hover:-translate-y-1"
                >
                   Start Course
                </button>
             </div>
         )}
      </div>
    </div>
  );
};
