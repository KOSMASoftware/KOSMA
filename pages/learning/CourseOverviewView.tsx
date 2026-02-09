
import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, List, Clock, Play, CheckCircle2, Trophy, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LearningCourse } from '../../data/learningCourses';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { buildLearningUrl } from './learningNav';

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
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{completed: number, total: number, last_article_id?: string} | null>(null);
  
  const totalDuration = course.goals.reduce((acc, g) => acc + g.durationMin, 0);

  // Fetch progress if authenticated
  useEffect(() => {
    if (isAuthenticated) {
        supabase.functions.invoke('learning-progress-summary', {
            body: { course_id: course.id }
        }).then(({ data, error }) => {
            if (!error && data) {
                // Backend returns courses as an array: [{ course_id: '...', completed_goals: 5, ... }]
                const courseRow = (data.courses || []).find((c: any) => c.course_id === course.id);
                
                if (courseRow) {
                    setProgress({
                        completed: courseRow.completed_goals ?? 0,
                        total: courseRow.total_goals ?? course.goals.length,
                        last_article_id: courseRow.last_article_id
                    });
                }
            }
        }).catch(err => console.warn('[Overview] Progress fetch failed (best-effort)', err));
    }
  }, [course.id, isAuthenticated]);

  const handleLoginToStart = () => {
    // Navigate to Login with redirect to the FIRST lesson of this course
    const target = buildLearningUrl({ courseId: course.id, articleId: course.goals[0].articleId });
    navigate(`/login?redirect=${encodeURIComponent(target)}`);
  };

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

            {/* Authenticated: Progress Bar */}
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

            {/* Unauthenticated: Rewards CTA Block */}
            {!isAuthenticated && (
               <div className="mt-6 bg-brand-50 border border-brand-100 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-5 relative overflow-hidden group">
                  {/* Decorative shimmer */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="bg-white p-3 rounded-xl shadow-sm text-brand-500 border border-brand-100 shrink-0 relative z-10">
                     <Trophy className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 relative z-10">
                     <h4 className="text-sm font-black text-brand-900 uppercase tracking-wide mb-2">
                        Complete this course and unlock rewards
                     </h4>
                     <div className="text-sm text-brand-800/80 font-medium leading-relaxed space-y-0.5">
                        <p>Complete 1 course = <span className="font-bold text-brand-900">1 month free for each course</span>.</p>
                        <p>Complete all 6 courses = <span className="font-bold text-brand-900">3 months free (Course Completion Bonus)</span>.</p>
                     </div>
                     <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-2.5">
                        Rewards only count for goals you mark as completed.
                     </p>
                  </div>

                  <button
                     onClick={handleLoginToStart}
                     className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 whitespace-nowrap w-full md:w-auto flex items-center justify-center gap-2 relative z-10"
                  >
                     <LogIn className="w-4 h-4" /> Log in to start
                  </button>
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
         
         {!progress?.last_article_id && isAuthenticated && (
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
