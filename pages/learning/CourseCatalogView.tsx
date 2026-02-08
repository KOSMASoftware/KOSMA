
import React from 'react';
import { ChevronRight, Clock, List } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { COURSES } from '../../data/learningCourses';

interface CourseCatalogViewProps {
  onSelectCourse: (courseId: string) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({ onSelectCourse }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Learning Campus</h1>
        <p className="text-base md:text-lg text-gray-500 font-medium max-w-2xl mx-auto">
          Master KOSMA with our structured courses. From basics to expert level.
        </p>
      </div>

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
