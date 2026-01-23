
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ChevronRight, ArrowLeft, Clock, CheckCircle, 
  Play, BookOpen, GraduationCap, LayoutGrid, List
} from 'lucide-react';
import { HELP_DATA, HelpArticle } from '../data/helpArticles';
import { COURSES, LearningCourse, LearningGoal } from '../data/learningCourses';
import { useAuth } from '../context/AuthContext';
import { Layout as DashboardLayout } from '../components/Layout';
import { MarketingLayout } from '../components/layout/MarketingLayout';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/ui/Card';

// --- HELPER: Find Article Content ---
const findArticleContent = (articleId: string): HelpArticle | undefined => {
  for (const cat of HELP_DATA) {
    const found = cat.articles.find(a => a.id === articleId);
    if (found) return found;
  }
  return undefined;
};

// --- COMPONENT: Media Renderer (Reused) ---
const MediaRenderer = ({ media }: { media: any }) => {
  const publicUrl = supabase.storage.from(media.bucket).getPublicUrl(media.path).data.publicUrl;
  const style = (media.w && media.h) ? { aspectRatio: `${media.w} / ${media.h}` } : undefined; 
  const aspectClass = (media.w && media.h) ? '' : 'aspect-video';

  return (
    <div className={`my-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 max-w-2xl w-full relative ${aspectClass}`} style={style}>
      {media.kind === 'video' ? (
        <video src={publicUrl} poster={media.posterPath ? supabase.storage.from(media.bucket).getPublicUrl(media.posterPath).data.publicUrl : undefined} controls className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <img src={publicUrl} alt={media.alt || 'Help Image'} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  );
};

// --- VIEW 1: COURSE LANDING ---
const CourseLandingView = ({ onSelectCourse }: { onSelectCourse: (courseId: string) => void }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Learning Campus</h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
          Master KOSMA with our structured courses. From basics to expert level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              className={`h-full flex flex-col items-start text-left p-8 group ${borderClass}`}
            >
              <div className="mb-6 w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center font-black text-xl group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                {idx + 1}
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
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

// --- VIEW 2: COURSE OVERVIEW ---
const CourseOverviewView = ({ 
  course, 
  onBack, 
  onSelectGoal 
}: { 
  course: LearningCourse, 
  onBack: () => void, 
  onSelectGoal: (articleId: string) => void 
}) => {
  const totalDuration = course.goals.reduce((acc, g) => acc + g.durationMin, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
         <div className="p-10 border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-start justify-between gap-6 mb-6">
               <div>
                  <span className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-2 block">Course Overview</span>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">{course.title}</h1>
                  <p className="text-lg text-gray-500 font-medium max-w-xl">{course.teaser}</p>
               </div>
               <div className="hidden md:block">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-500">
                     <GraduationCap className="w-10 h-10" />
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-bold text-gray-600">
               <span className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-brand-500" /> {course.goals.length} Learning goals
               </span>
               <span className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> ~{totalDuration} min Total
               </span>
            </div>
         </div>

         <div className="divide-y divide-gray-100">
            {course.goals.map((goal, idx) => (
               <button 
                 key={goal.id} 
                 onClick={() => onSelectGoal(goal.articleId)}
                 className="w-full text-left p-6 md:px-10 md:py-8 hover:bg-gray-50 transition-colors flex items-center gap-6 group"
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
         
         <div className="p-10 bg-gray-50 border-t border-gray-100 text-center">
            <button 
               onClick={() => onSelectGoal(course.goals[0].articleId)}
               className="bg-brand-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all hover:-translate-y-1"
            >
               Start Course
            </button>
         </div>
      </div>
    </div>
  );
};

// --- VIEW 3: DETAIL ARTICLE ---
const ArticleDetailView = ({ 
  course, 
  articleId, 
  onBack 
}: { 
  course: LearningCourse, 
  articleId: string, 
  onBack: () => void 
}) => {
  // Find current goal index
  const currentGoalIndex = course.goals.findIndex(g => g.articleId === articleId);
  const currentGoal = course.goals[currentGoalIndex];
  const nextGoal = course.goals[currentGoalIndex + 1];
  
  // Load Content
  const article = findArticleContent(articleId);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  if (!article) return <div className="p-20 text-center">Content not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
       {/* Nav Header */}
       <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
             <ArrowLeft className="w-4 h-4" /> Back to Overview
          </button>
          <div className="text-xs font-black uppercase tracking-widest text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
             Goal {currentGoalIndex + 1} / {course.goals.length}
          </div>
       </div>

       {/* Article Content (Reused Logic) */}
       <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
            {currentGoal?.title || article.title}
          </h1>

          {article.entry.summary && (
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-10 flex gap-4 text-blue-900/80 leading-relaxed font-medium">
               <div className="bg-white p-2 rounded-full h-fit shadow-sm border border-blue-100 shrink-0">
                  <CheckCircle className="w-5 h-5 text-brand-500" />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-500 mb-1">Summary</p>
                  {article.entry.summary}
               </div>
            </div>
          )}

          <div className="space-y-8">
            {article.entry.steps.length === 0 && (
                <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed text-gray-400 italic">
                    Content coming soon.
                </div>
            )}
            
            {article.entry.steps.map((step, idx) => (
               <div key={step.id} className="group border border-gray-100 bg-white rounded-2xl overflow-hidden p-6 md:p-8 hover:border-gray-200 hover:shadow-sm transition-all">
                   <div className="flex items-center gap-4 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                       {idx + 1}
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">
                       {step.title}
                     </h3>
                   </div>
                   
                   <div className="pl-[3rem]">
                      <p className="text-gray-600 leading-relaxed mb-4 font-medium">{step.content}</p>

                      {step.media && <MediaRenderer media={step.media} />}

                      {step.warning && (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm font-medium mt-4">
                            <span className="font-bold">⚠️ Note:</span> {step.warning}
                        </div>
                      )}
                      
                      {step.tip && (
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3 text-gray-600 text-sm font-medium mt-4">
                            <span className="font-bold">💡 Tip:</span> {step.tip}
                        </div>
                      )}
                   </div>
               </div>
            ))}
          </div>
       </div>

       {/* Footer Navigation */}
       <div className="mt-16 pt-10 border-t border-gray-100 flex justify-between items-center">
          <button 
             onClick={onBack}
             className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
             Back to Overview
          </button>

          {nextGoal ? (
             <a 
                href={`#/learning?course=${course.id}&article=${nextGoal.articleId}`}
                className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-900 text-white font-black hover:bg-brand-500 transition-all shadow-lg shadow-gray-900/10"
             >
                <div className="text-left">
                   <span className="block text-[10px] font-bold uppercase opacity-70 tracking-wider">Next Goal</span>
                   <span>{nextGoal.title}</span>
                </div>
                <ChevronRight className="w-5 h-5" />
             </a>
          ) : (
             <div className="text-green-600 font-black flex items-center gap-2 bg-green-50 px-6 py-3 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5" /> Course Completed
             </div>
          )}
       </div>
    </div>
  );
};

// --- MAIN PAGE CONTROLLER ---
const LearningPageContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCourseId = searchParams.get('course');
  const selectedArticleId = searchParams.get('article');

  const selectedCourse = useMemo(() => 
    COURSES.find(c => c.id === selectedCourseId), 
  [selectedCourseId]);

  const handleSelectCourse = (courseId: string) => {
    setSearchParams({ course: courseId });
    window.scrollTo(0, 0);
  };

  const handleSelectGoal = (articleId: string) => {
    if (selectedCourseId) {
       setSearchParams({ course: selectedCourseId, article: articleId });
    }
  };

  const handleBackToOverview = () => {
    if (selectedCourseId) {
        setSearchParams({ course: selectedCourseId }); // Remove article param
    }
  };

  const handleBackToLanding = () => {
    setSearchParams({}); // Clear all
  };

  // State Machine for Views
  if (selectedCourse && selectedArticleId) {
    return <ArticleDetailView course={selectedCourse} articleId={selectedArticleId} onBack={handleBackToOverview} />;
  }

  if (selectedCourse) {
    return <CourseOverviewView course={selectedCourse} onBack={handleBackToLanding} onSelectGoal={handleSelectGoal} />;
  }

  return <CourseLandingView onSelectCourse={handleSelectCourse} />;
};

export const LearningPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const Wrapper = isAuthenticated ? DashboardLayout : MarketingLayout;
  return <Wrapper><LearningPageContent /></Wrapper>;
};
