
import React from 'react';
import { ArrowLeft, GraduationCap, List, Clock, Play } from 'lucide-react';
import { LearningCourse } from '../../data/learningCourses';

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
  const totalDuration = course.goals.reduce((acc, g) => acc + g.durationMin, 0);

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
            
            <div className="flex items-center gap-6 text-sm font-bold text-gray-600">
               <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-brand-500" /> {course.goals.length} Learning goals
               </span>
               <span className="bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> ~{totalDuration} min Total
               </span>
            </div>
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
         
         <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <button 
               onClick={() => onSelectGoal(course.goals[0].articleId)}
               className="bg-brand-500 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all hover:-translate-y-1"
            >
               Start Course
            </button>
         </div>
      </div>
    </div>
  );
};
